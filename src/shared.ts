import * as bitcoin from "bitcoinjs-lib";
import { Buffer } from "buffer";
import { ECPairFactory } from "ecpair";
import * as ecc from "@bitcoinerlab/secp256k1";
import { ml_dsa44 } from "@noble/post-quantum/ml-dsa.js";
import {
  buildAuthScriptWitnessNoAuth,
  buildCancelWitnessStack,
  buildCancelWitnessStackPQ,
  buildFillWitnessStack,
  parsePartialFillScript,
  parsePartialFillScriptPQ,
  splitAssetWrappedScriptPubKey,
} from "@neuraiproject/neurai-scripts";
import {
  parseTransaction,
  serializeTransaction,
  type DecodedTransaction,
  type RefInput,
} from "@neuraiproject/neurai-create-transaction";
import { computeOpTxHash } from "./tx-hash";
import { xna } from "./coins/xna";
import { xnaLegacy } from "./coins/xna-legacy";
import { xnaPQ } from "./coins/xna-pq";

const ECPair = ECPairFactory(ecc);

const HASH_TYPE = bitcoin.Transaction.SIGHASH_ALL;
const LEGACY_PREFIX_LENGTH = 25;
const AUTHSCRIPT_PREFIX_LENGTH = 34;
const AUTHSCRIPT_PROGRAM_LENGTH = 32;
const AUTHSCRIPT_TAG = "NeuraiAuthScript";
const AUTHSCRIPT_VERSION = 0x01;
const NOAUTH_TYPE = 0x00;
const PQ_AUTHSCRIPT_TYPE = 0x01;
const LEGACY_AUTHSCRIPT_TYPE = 0x02;
// Neurai asset wrapper opcode: <destination scriptPubKey> OP_XNA_ASSET <pushdata> OP_DROP.
// Asset-wrapped outputs always carry nValue = 0 on-chain (the asset quantity
// lives in the pushdata payload), which is what the node puts into the
// BIP-143 sighash. See `getSighashAmount` below.
const OP_XNA_ASSET = 0xc0;
const PQ_PUBLIC_KEY_LENGTH = 1312;
const PQ_SECRET_KEY_LENGTH = 2560;
const PQ_KEYDATA_LENGTH = 3872;
const PQ_SEED_LENGTH = 32;
const PQ_PUBLIC_KEY_HEADER = Buffer.from([0x05]);
const DEFAULT_PQ_WITNESS_SCRIPT = Buffer.from([bitcoin.opcodes.OP_TRUE]);
const ZERO_32 = Buffer.alloc(32, 0);

export type SupportedNetwork =
  | "xna"
  | "xna-test"
  | "xna-legacy"
  | "xna-legacy-test"
  | "xna-pq"
  | "xna-pq-test";

export type PrivateKeyInput = string | IPQPrivateKeyInput;

export interface IPQPrivateKeyInput {
  WIF?: string;
  seedKey?: string;
  privateKey?: string;
  secretKey?: string;
  publicKey?: string;
  authType?: number;
  witnessScript?: string;
  functionalArgs?: string[];
}

export interface ISignDebugEvent {
  step: string;
  [key: string]: unknown;
}

export interface ISignOptions {
  debug?: boolean | ((event: ISignDebugEvent) => void);
}

interface IPQSigningMaterial {
  secretKey: Buffer;
  publicKey: Buffer;
  serializedPublicKey: Buffer;
}

interface IPQSpendTemplate {
  authType: number;
  witnessScript: Buffer;
  functionalArgs: Buffer[];
}

type ChainNetwork = {
  messagePrefix: string;
  bech32?: string;
  versions: {
    bip32: {
      public: number;
      private: number;
    };
    public: number;
    private: number;
    scripthash: number;
  };
};

type PQChainNetwork = {
  hrp: string;
  bip32: {
    public: number;
    private: number;
  };
};

/**
 * Hint that unlocks spending of a partial-fill covenant branch. Covenant
 * UTXOs on-chain are always AuthScript-v1 witness wrapped (consensus
 * `IsAssetScript` only accepts 25-byte P2PKH or 34-byte AuthScript-v1
 * prefixes before an OP_XNA_ASSET wrapper), so the covenant itself lives
 * in the spend WITNESS, not in the scriptPubKey. Callers must supply the
 * covenant bytes in `covenantScriptHex`; the library verifies that
 * `taggedHash("NeuraiAuthScript", 0x01 || 0x00 || SHA256(covenantScript))`
 * matches the 32-byte program in the prevout before spending.
 *
 * `covenant-fill` needs no signature and therefore no private key. The
 * order total is NEVER taken from the caller: it is derived from the
 * prevout's transfer asset wrapper (`amountRaw`), the on-chain source of
 * truth, so the full/partial branch choice cannot be corrupted by a wrong
 * total. `amount` is the raw (satoshi-scaled) asset quantity to fill.
 */
export type BareScriptSigningHint =
  | { kind: "covenant-cancel-legacy"; covenantScriptHex: string }
  | { kind: "covenant-cancel-pq"; covenantScriptHex: string }
  | { kind: "covenant-fill"; covenantScriptHex: string; amount: bigint };

export interface IUTXO {
  address: string;
  assetName: string;
  txid: string;
  outputIndex: number;
  /**
   * scriptPubKey of the prevout as hex. For asset UTXOs this includes the
   * trailing `OP_XNA_ASSET <pushdata(payload)> OP_DROP` wrapper; the
   * library strips the wrapper internally when a covenant-cancel hint is
   * supplied.
   */
  script: string;
  satoshis: number;
  height?: number;
  value: number;
  /**
   * Optional signing hint for non-standard prevouts (currently: partial-fill
   * covenant cancel branches). Ignored for recognised legacy/PQ prevouts.
   */
  bareScriptHint?: BareScriptSigningHint;
}

function toBitcoinJS(network: ChainNetwork): bitcoin.Network {
  return {
    messagePrefix: network.messagePrefix,
    bech32: network.bech32 || "",
    bip32: {
      public: network.versions.bip32.public,
      private: network.versions.bip32.private,
    },
    pubKeyHash: network.versions.public,
    scriptHash: network.versions.scripthash,
    wif: network.versions.private,
  };
}

function toBitcoinJSPQ(
  baseNetwork: ChainNetwork,
  pqNetwork: PQChainNetwork
): bitcoin.Network {
  return {
    ...toBitcoinJS(baseNetwork),
    bech32: pqNetwork.hrp,
    bip32: {
      public: pqNetwork.bip32.public,
      private: pqNetwork.bip32.private,
    },
  };
}

function isHexString(value: string): boolean {
  return /^[0-9a-f]+$/i.test(value) && value.length % 2 === 0;
}

function bufferFromHex(value: string, label: string): Buffer {
  if (!isHexString(value)) {
    throw new Error(`${label} must be a hex string`);
  }

  return Buffer.from(value, "hex");
}

function bufferFromHexAllowEmpty(value: string, label: string): Buffer {
  return value === "" ? Buffer.alloc(0) : bufferFromHex(value, label);
}

function toBigIntAmount(value: unknown, label: string): bigint {
  if (typeof value === "bigint") return value;
  if (typeof value === "number" && Number.isSafeInteger(value)) return BigInt(value);
  if (typeof value === "string" && /^\d+$/.test(value)) return BigInt(value);
  throw new Error(`${label} must be a bigint (or a safe integer / decimal string)`);
}

function isLegacyScript(script: Buffer): boolean {
  return (
    script.length >= LEGACY_PREFIX_LENGTH &&
    script[0] === bitcoin.opcodes.OP_DUP &&
    script[1] === bitcoin.opcodes.OP_HASH160 &&
    script[2] === 0x14 &&
    script[23] === bitcoin.opcodes.OP_EQUALVERIFY &&
    script[24] === bitcoin.opcodes.OP_CHECKSIG
  );
}

function isPQScript(script: Buffer): boolean {
  return (
    script.length >= AUTHSCRIPT_PREFIX_LENGTH &&
    script[0] === bitcoin.opcodes.OP_1 &&
    script[1] === 0x20
  );
}

// NIP-025: asset payload marker "rvn" + type. The marker is still the
// Ravencoin-inherited one (NIP-040 migration to "xna" is pending).
const XNA_ASSET_PAYLOAD_MARKER = Buffer.from("rvn", "ascii");
// 't' transfer, 'q' new, 'o' owner, 'r' reissue (assets.h:19-23).
const XNA_ASSET_TYPE_MARKERS = new Set([0x74, 0x71, 0x6f, 0x72]);

/**
 * Mirror of the node's `IsAssetAuthScript()` predicate (strict AuthScript
 * asset parser, script.cpp:340-378): AuthScript-v1 prefix (34 B), then
 * `OP_XNA_ASSET` exactly at offset 34, then ONE pushdata element decoded
 * with Script push semantics (direct push / OP_PUSHDATA1/2/4, lengths
 * validated) whose payload starts with "rvn" + a valid type marker, then a
 * final OP_DROP as the script's last byte.
 *
 * Deliberately NOT a generic byte search: a 0xc0 inside push data must not
 * count as a wrapper.
 */
function isAssetAuthScript(scriptPubKey: Buffer): boolean {
  if (!isPQScript(scriptPubKey)) return false;

  let offset = AUTHSCRIPT_PREFIX_LENGTH;
  if (scriptPubKey.length <= offset || scriptPubKey[offset] !== OP_XNA_ASSET) {
    return false;
  }
  offset += 1;

  if (offset >= scriptPubKey.length) return false;
  const op = scriptPubKey[offset];
  offset += 1;

  let payloadLength: number;
  if (op > 0 && op < bitcoin.opcodes.OP_PUSHDATA1) {
    payloadLength = op;
  } else if (op === bitcoin.opcodes.OP_PUSHDATA1) {
    if (offset + 1 > scriptPubKey.length) return false;
    payloadLength = scriptPubKey[offset];
    offset += 1;
  } else if (op === bitcoin.opcodes.OP_PUSHDATA2) {
    if (offset + 2 > scriptPubKey.length) return false;
    payloadLength = scriptPubKey.readUInt16LE(offset);
    offset += 2;
  } else if (op === bitcoin.opcodes.OP_PUSHDATA4) {
    if (offset + 4 > scriptPubKey.length) return false;
    payloadLength = scriptPubKey.readUInt32LE(offset);
    offset += 4;
  } else {
    return false;
  }

  if (offset + payloadLength > scriptPubKey.length) return false;
  const payload = scriptPubKey.subarray(offset, offset + payloadLength);
  offset += payloadLength;

  if (payload.length < 4) return false;
  if (!payload.subarray(0, 3).equals(XNA_ASSET_PAYLOAD_MARKER)) return false;
  if (!XNA_ASSET_TYPE_MARKERS.has(payload[3])) return false;

  return (
    offset === scriptPubKey.length - 1 &&
    scriptPubKey[offset] === bitcoin.opcodes.OP_DROP
  );
}

// NIP-025 (`nASSETRBFBlockEnabled`) is a hard-coded per-network opt-in in
// the node: true on testnet/regtest, false on mainnet
// (chainparams.cpp:135,351,568). Regtest shares the testnet networks here.
// Revisit this set when a mainnet fork activates the rule.
const NETWORKS_WITH_ASSET_AUTHSCRIPT_RBF_BLOCK: ReadonlySet<SupportedNetwork> =
  new Set(["xna-test", "xna-legacy-test", "xna-pq-test"]);
const MIN_NON_RBF_SEQUENCE = 0xfffffffe;

function getAuthScriptProgram(scriptPubKey: Buffer): Buffer {
  if (!isPQScript(scriptPubKey)) {
    throw new Error("AuthScript scriptPubKey must start with OP_1 <32-byte commitment>");
  }
  return scriptPubKey.subarray(2, AUTHSCRIPT_PREFIX_LENGTH);
}

function getUTXOAmount(utxo: IUTXO): number {
  const amount = utxo.satoshis ?? utxo.value;
  if (!Number.isSafeInteger(amount) || amount < 0) {
    throw new Error(`Invalid amount for UTXO ${utxo.txid}:${utxo.outputIndex}`);
  }

  return amount;
}

/**
 * Returns the nValue that the consensus layer puts into the BIP-143 sighash
 * preimage for this UTXO.
 *
 * Neurai / Ravencoin asset UTXOs are indexed under `getaddressutxos` with
 * `satoshis = assetAmount` (legacy Ravencoin convention). The real on-chain
 * `nValue` for any asset transfer / issue / reissue / owner output is 0,
 * and that 0 is what the node puts into the sighash. Passing
 * `utxo.satoshis` directly (the asset quantity) produces a sighash that
 * diverges from the node and the signature fails consensus verification
 * with `WITNESS_PROGRAM_MISMATCH`.
 *
 * The script itself is the source of truth: if the scriptPubKey has an
 * `OP_XNA_ASSET` byte right after the destination prefix (P2PKH = 25 bytes,
 * AuthScript v1 = 34 bytes), the output is asset-wrapped and its nValue
 * is 0.
 *
 * Non-standard prefixes (covenants, bare scripts, unknown witness
 * versions) fall through to `getUTXOAmount`; callers that supply a
 * `bareScriptHint` are expected to provide a UTXO whose `satoshis` field
 * already reflects the real nValue.
 */
function getSighashAmount(utxo: IUTXO): number {
  if (typeof utxo.script !== "string" || utxo.script.length === 0) {
    return getUTXOAmount(utxo);
  }

  let scriptPubKey: Buffer;
  try {
    scriptPubKey = bufferFromHex(utxo.script, `scriptPubKey for ${utxo.txid}:${utxo.outputIndex}`);
  } catch {
    return getUTXOAmount(utxo);
  }

  const assetOffset = isLegacyScript(scriptPubKey)
    ? LEGACY_PREFIX_LENGTH
    : isPQScript(scriptPubKey)
      ? AUTHSCRIPT_PREFIX_LENGTH
      : -1;

  if (assetOffset >= 0 && scriptPubKey.length > assetOffset && scriptPubKey[assetOffset] === OP_XNA_ASSET) {
    return 0;
  }

  return getUTXOAmount(utxo);
}

function sha256(buffer: Buffer): Buffer {
  return Buffer.from(bitcoin.crypto.sha256(buffer));
}

function hash256(buffer: Buffer): Buffer {
  return Buffer.from(bitcoin.crypto.hash256(buffer));
}

function hash160(buffer: Buffer): Buffer {
  return Buffer.from(bitcoin.crypto.hash160(buffer));
}

function taggedHash(tag: string, msg: Buffer): Buffer {
  const tagHash = sha256(Buffer.from(tag, "utf8"));
  return sha256(Buffer.concat([tagHash, tagHash, msg]));
}

function encodeVarInt(value: number): Buffer {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`Invalid varint value: ${value}`);
  }
  if (value < 0xfd) {
    return Buffer.from([value]);
  }
  if (value <= 0xffff) {
    const out = Buffer.alloc(3);
    out[0] = 0xfd;
    out.writeUInt16LE(value, 1);
    return out;
  }
  if (value <= 0xffffffff) {
    const out = Buffer.alloc(5);
    out[0] = 0xfe;
    out.writeUInt32LE(value, 1);
    return out;
  }
  const out = Buffer.alloc(9);
  out[0] = 0xff;
  writeUInt64LE(out, BigInt(value), 1);
  return out;
}

function encodeVarSlice(buffer: Buffer): Buffer {
  return Buffer.concat([encodeVarInt(buffer.length), buffer]);
}

function writeUInt64LE(target: Buffer, value: bigint, offset = 0): void {
  const normalized = BigInt.asUintN(64, value);
  target.writeUInt32LE(Number(normalized & 0xffffffffn), offset);
  target.writeUInt32LE(Number((normalized >> 32n) & 0xffffffffn), offset + 4);
}

function serializeOutput(output: bitcoin.Transaction["outs"][number]): Buffer {
  const value = Buffer.alloc(8);
  writeUInt64LE(value, BigInt(output.value));
  return Buffer.concat([value, encodeVarSlice(output.script)]);
}

function serializeOutpoint(input: bitcoin.Transaction["ins"][number]): Buffer {
  const index = Buffer.alloc(4);
  index.writeUInt32LE(input.index, 0);
  return Buffer.concat([Buffer.from(input.hash), index]);
}

function toSerializedPQPublicKey(publicKey: Buffer): Buffer {
  if (publicKey.length !== PQ_PUBLIC_KEY_LENGTH) {
    throw new Error("PQ public key must be 1312 bytes");
  }

  return Buffer.concat([PQ_PUBLIC_KEY_HEADER, publicKey]);
}

function getPQMaterialFromBuffer(data: Buffer): IPQSigningMaterial {
  if (data.length === PQ_SEED_LENGTH) {
    const keys = ml_dsa44.keygen(new Uint8Array(data));
    const publicKey = Buffer.from(keys.publicKey);
    return {
      secretKey: Buffer.from(keys.secretKey),
      publicKey,
      serializedPublicKey: toSerializedPQPublicKey(publicKey),
    };
  }

  if (data.length === PQ_SECRET_KEY_LENGTH) {
    const publicKey = Buffer.from(ml_dsa44.getPublicKey(new Uint8Array(data)));
    return {
      secretKey: data,
      publicKey,
      serializedPublicKey: toSerializedPQPublicKey(publicKey),
    };
  }

  if (data.length === PQ_KEYDATA_LENGTH) {
    const secretKey = data.subarray(0, PQ_SECRET_KEY_LENGTH);
    const publicKey = data.subarray(PQ_SECRET_KEY_LENGTH);
    return {
      secretKey,
      publicKey,
      serializedPublicKey: toSerializedPQPublicKey(publicKey),
    };
  }

  throw new Error(
    "PQ private key must be a 32-byte seed, 2560-byte secret key or 3872-byte keydata"
  );
}

function getPQMaterialFromEntry(
  address: string,
  privateKeyEntry: PrivateKeyInput
): IPQSigningMaterial {
  if (typeof privateKeyEntry === "string") {
    return getPQMaterialFromBuffer(
      bufferFromHex(privateKeyEntry, `PQ key for address ${address}`)
    );
  }

  const seedKey = privateKeyEntry.seedKey;
  if (seedKey) {
    return getPQMaterialFromBuffer(
      bufferFromHex(seedKey, `PQ seed for address ${address}`)
    );
  }

  const secretKeyHex = privateKeyEntry.secretKey || privateKeyEntry.privateKey;
  if (secretKeyHex) {
    const material = getPQMaterialFromBuffer(
      bufferFromHex(secretKeyHex, `PQ secret for address ${address}`)
    );

    if (privateKeyEntry.publicKey) {
      const publicKey = bufferFromHex(
        privateKeyEntry.publicKey,
        `PQ public key for address ${address}`
      );
      if (publicKey.length !== PQ_PUBLIC_KEY_LENGTH) {
        throw new Error(`PQ public key for address ${address} must be 1312 bytes`);
      }
      return {
        secretKey: material.secretKey,
        publicKey,
        serializedPublicKey: toSerializedPQPublicKey(publicKey),
      };
    }

    return material;
  }

  throw new Error(
    `Missing PQ key material for address ${address}. Provide seedKey, privateKey or secretKey in hex`
  );
}

function getAuthScriptSpendTemplate(
  address: string,
  privateKeyEntry: PrivateKeyInput
): IPQSpendTemplate {
  if (typeof privateKeyEntry === "string") {
    return {
      authType: PQ_AUTHSCRIPT_TYPE,
      witnessScript: DEFAULT_PQ_WITNESS_SCRIPT,
      functionalArgs: [],
    };
  }

  const authType = privateKeyEntry.authType ?? PQ_AUTHSCRIPT_TYPE;
  if (
    authType !== NOAUTH_TYPE &&
    authType !== PQ_AUTHSCRIPT_TYPE &&
    authType !== LEGACY_AUTHSCRIPT_TYPE
  ) {
    throw new Error(
      `Unsupported authType 0x${authType.toString(16).padStart(2, "0")} for address ${address}. Supported: 0x00 (NoAuth), 0x01 (PQ), 0x02 (Legacy)`
    );
  }

  const witnessScript = privateKeyEntry.witnessScript
    ? bufferFromHex(
        privateKeyEntry.witnessScript,
        `AuthScript witnessScript for address ${address}`
      )
    : DEFAULT_PQ_WITNESS_SCRIPT;

  const functionalArgs = (privateKeyEntry.functionalArgs ?? []).map((arg, idx) =>
    bufferFromHex(arg, `AuthScript functionalArgs[${idx}] for address ${address}`)
  );

  return {
    authType,
    witnessScript,
    functionalArgs,
  };
}

function getAuthScriptCommitment(
  authType: number,
  publicKey: Buffer | null,
  witnessScript: Buffer
): Buffer {
  let authDescriptor: Buffer;

  if (authType === NOAUTH_TYPE) {
    authDescriptor = Buffer.from([NOAUTH_TYPE]);
  } else if (authType === PQ_AUTHSCRIPT_TYPE) {
    if (!publicKey) {
      throw new Error("PQ auth requires a public key");
    }
    authDescriptor = Buffer.concat([
      Buffer.from([PQ_AUTHSCRIPT_TYPE]),
      hash160(publicKey),
    ]);
  } else if (authType === LEGACY_AUTHSCRIPT_TYPE) {
    if (!publicKey) {
      throw new Error("Legacy auth requires a public key");
    }
    authDescriptor = Buffer.concat([
      Buffer.from([LEGACY_AUTHSCRIPT_TYPE]),
      hash160(publicKey),
    ]);
  } else {
    throw new Error(
      `Unsupported authType 0x${authType.toString(16).padStart(2, "0")}. Supported: 0x00 (NoAuth), 0x01 (PQ), 0x02 (Legacy)`
    );
  }

  const witnessScriptHash = sha256(witnessScript);
  const preimage = Buffer.concat([
    Buffer.from([AUTHSCRIPT_VERSION]),
    authDescriptor,
    witnessScriptHash,
  ]);
  return taggedHash(AUTHSCRIPT_TAG, preimage);
}

/**
 * NIP-014 (tx v3) reference-input data, precomputed once per sign() call.
 * `concat` is the raw concatenation of 36-byte serialized outpoints
 * (txid LE ‖ vout u32LE) — possibly EMPTY, which still contributes
 * `hash256("")` to the v3 sighash (the node inserts hashRefInputs for every
 * v3 tx, `interpreter.cpp:2702-2711`). Null means the tx is not v3.
 */
interface IRefInputsData {
  count: number;
  concat: Buffer;
}

function serializeRefInputOutpoint(ref: RefInput): Buffer {
  const txid = bufferFromHex(ref.txid, "vrefin txid");
  if (txid.length !== 32) {
    throw new Error(`vrefin txid must be 32 bytes, got ${txid.length}`);
  }
  const index = Buffer.alloc(4);
  index.writeUInt32LE(ref.vout, 0);
  return Buffer.concat([Buffer.from(txid).reverse(), index]);
}

function getRefInputsData(decoded: DecodedTransaction): IRefInputsData | null {
  if (decoded.version !== 3) return null;
  const vrefin = decoded.vrefin ?? [];
  return {
    count: vrefin.length,
    concat: Buffer.concat(vrefin.map(serializeRefInputOutpoint)),
  };
}

/**
 * Legacy (SIGVERSION_BASE) sighash for a v3 transaction. bitcoinjs'
 * `hashForSignature` cannot produce it: the node's
 * `CTransactionSignatureSerializer` serializes `CompactSize(vrefin.length)`
 * plus each outpoint between vout and nLockTime, unconditionally for v3.
 * Only SIGHASH_ALL (without ANYONECANPAY) is implemented — the only mode
 * this library signs with.
 */
function hashForLegacySignatureV3(
  tx: bitcoin.Transaction,
  refInputs: IRefInputsData,
  inIndex: number,
  scriptPubKey: Buffer,
  hashType: number
): Buffer {
  if ((hashType & 0x1f) !== bitcoin.Transaction.SIGHASH_ALL || (hashType & bitcoin.Transaction.SIGHASH_ANYONECANPAY) !== 0) {
    throw new Error("hashForLegacySignatureV3 only supports plain SIGHASH_ALL");
  }

  const version = Buffer.alloc(4);
  version.writeInt32LE(tx.version, 0);
  const locktime = Buffer.alloc(4);
  locktime.writeUInt32LE(tx.locktime, 0);
  const hashTypeBuffer = Buffer.alloc(4);
  hashTypeBuffer.writeUInt32LE(hashType >>> 0, 0);

  const parts: Buffer[] = [version, encodeVarInt(tx.ins.length)];
  for (let i = 0; i < tx.ins.length; i++) {
    const input = tx.ins[i];
    const sequence = Buffer.alloc(4);
    sequence.writeUInt32LE(input.sequence, 0);
    parts.push(
      serializeOutpoint(input),
      i === inIndex ? encodeVarSlice(scriptPubKey) : encodeVarInt(0),
      sequence
    );
  }
  parts.push(encodeVarInt(tx.outs.length));
  for (const out of tx.outs) {
    parts.push(serializeOutput(out));
  }
  parts.push(encodeVarInt(refInputs.count), refInputs.concat);
  parts.push(locktime, hashTypeBuffer);

  return hash256(Buffer.concat(parts));
}

function hashForAuthScript(
  tx: bitcoin.Transaction,
  inIndex: number,
  witnessScript: Buffer,
  amount: number,
  hashType: number,
  authType: number,
  refInputs: IRefInputsData | null = null
): Buffer {
  const baseType = hashType & 0x1f;
  const anyoneCanPay = (hashType & bitcoin.Transaction.SIGHASH_ANYONECANPAY) !== 0;

  let hashPrevouts = ZERO_32;
  let hashSequence = ZERO_32;
  let hashOutputs = ZERO_32;

  if (!anyoneCanPay) {
    hashPrevouts = hash256(Buffer.concat(tx.ins.map(serializeOutpoint)));
  }

  if (
    !anyoneCanPay &&
    baseType !== bitcoin.Transaction.SIGHASH_SINGLE &&
    baseType !== bitcoin.Transaction.SIGHASH_NONE
  ) {
    hashSequence = hash256(
      Buffer.concat(
        tx.ins.map((input) => {
          const sequence = Buffer.alloc(4);
          sequence.writeUInt32LE(input.sequence, 0);
          return sequence;
        })
      )
    );
  }

  if (
    baseType !== bitcoin.Transaction.SIGHASH_SINGLE &&
    baseType !== bitcoin.Transaction.SIGHASH_NONE
  ) {
    hashOutputs = hash256(Buffer.concat(tx.outs.map(serializeOutput)));
  } else if (baseType === bitcoin.Transaction.SIGHASH_SINGLE && inIndex < tx.outs.length) {
    hashOutputs = hash256(serializeOutput(tx.outs[inIndex]));
  }

  const input = tx.ins[inIndex];
  const outpoint = serializeOutpoint(input);
  const sequence = Buffer.alloc(4);
  sequence.writeUInt32LE(input.sequence, 0);
  const version = Buffer.alloc(4);
  version.writeInt32LE(tx.version, 0);
  const amountBuffer = Buffer.alloc(8);
  writeUInt64LE(amountBuffer, BigInt(amount));
  const locktime = Buffer.alloc(4);
  locktime.writeUInt32LE(tx.locktime, 0);
  const hashTypeBuffer = Buffer.alloc(4);
  hashTypeBuffer.writeUInt32LE(hashType >>> 0, 0);

  const preimage = Buffer.concat([
    version,
    hashPrevouts,
    hashSequence,
    outpoint,
    encodeVarSlice(witnessScript),
    amountBuffer,
    sequence,
    hashOutputs,
    // NIP-014: for v3, hashRefInputs goes between hashOutputs and locktime,
    // ALWAYS — an empty vrefin contributes hash256(""), not a zero hash.
    ...(refInputs ? [hash256(refInputs.concat)] : []),
    locktime,
    Buffer.from([authType]),
    hashTypeBuffer,
  ]);

  return hash256(preimage);
}

function getUTXOKey(txid: string, outputIndex: number): string {
  return `${txid}:${outputIndex}`;
}

function getInputReference(input: { hash: Uint8Array; index: number }): {
  txid: string;
  vout: number;
} {
  return {
    txid: Buffer.from(input.hash).reverse().toString("hex"),
    vout: input.index,
  };
}

function createDebugLogger(
  debugOption?: ISignOptions["debug"]
): (event: ISignDebugEvent) => void {
  if (debugOption === false) {
    return () => {};
  }

  if (typeof debugOption === "function") {
    return debugOption;
  }

  return (event) => {
    console.log("[pq-sign]", event);
  };
}

export function sign(
  network: SupportedNetwork,
  rawTransactionHex: string,
  UTXOs: Array<IUTXO>,
  privateKeys: Record<string, PrivateKeyInput>,
  options?: ISignOptions
): string {
  const networkMapper: Record<SupportedNetwork, bitcoin.Network> = {
    xna: toBitcoinJS(xna.mainnet),
    "xna-test": toBitcoinJS(xna.testnet),
    "xna-legacy": toBitcoinJS(xnaLegacy.mainnet),
    "xna-legacy-test": toBitcoinJS(xnaLegacy.testnet),
    "xna-pq": toBitcoinJSPQ(xna.mainnet, xnaPQ.mainnet),
    "xna-pq-test": toBitcoinJSPQ(xna.testnet, xnaPQ.testnet),
  };

  const COIN = networkMapper[network];
  if (!COIN) throw new Error("Invalid network specified");
  COIN.bech32 = COIN.bech32 || "";

  // The codec understands v1/v2/v3 (with vrefin); bitcoinjs alone would
  // misparse a v3 transaction. The bitcoinjs Transaction remains the
  // internal working representation — for v3 it is a "reduced" view that
  // never touches the wire: the signed hex is re-serialized by the codec.
  const decoded = parseTransaction(rawTransactionHex);
  const refInputs = getRefInputsData(decoded);

  // Consensus (tx_verify.cpp:520-537): within a v3 tx, vrefin entries must
  // be unique (bad-txns-vrefin-duplicate) and must not overlap any vin
  // prevout (bad-txns-vrefin-overlap-vin). Fail at signing time instead of
  // producing a tx the node is guaranteed to reject.
  if (refInputs && refInputs.count > 0) {
    const prevouts = new Set(
      decoded.inputs.map((input) => getUTXOKey(input.txid, input.vout))
    );
    const seenRefs = new Set<string>();
    for (const ref of decoded.vrefin) {
      const key = getUTXOKey(ref.txid, ref.vout);
      if (seenRefs.has(key)) {
        throw new Error(
          `vrefin reference ${ref.txid}:${ref.vout} is duplicated ` +
            `(the node rejects this with bad-txns-vrefin-duplicate)`
        );
      }
      seenRefs.add(key);
      if (prevouts.has(key)) {
        throw new Error(
          `vrefin reference ${ref.txid}:${ref.vout} overlaps a transaction input ` +
            `(the node rejects this with bad-txns-vrefin-overlap-vin)`
        );
      }
    }
  }
  const tx = new bitcoin.Transaction();
  tx.version = decoded.version;
  tx.locktime = decoded.locktime;

  const legacyKeyPairCache = new Map<string, ReturnType<typeof ECPair.fromWIF>>();
  const pqMaterialCache = new Map<string, IPQSigningMaterial>();
  const utxoMap = new Map<string, IUTXO>(
    UTXOs.map((utxo) => [getUTXOKey(utxo.txid, utxo.outputIndex), utxo])
  );
  const debug = createDebugLogger(options?.debug);

  function hasPrivateKeyForAddress(address: string): boolean {
    return privateKeys[address] !== undefined;
  }

  function getKeyPairByAddress(address: string) {
    const cached = legacyKeyPairCache.get(address);
    if (cached) return cached;

    const privateKeyEntry = privateKeys[address];
    if (!privateKeyEntry) {
      throw new Error(`Missing private key for address: ${address}`);
    }

    const wif = typeof privateKeyEntry === "string" ? privateKeyEntry : privateKeyEntry.WIF;
    if (!wif) {
      throw new Error(`Missing WIF private key for address: ${address}`);
    }

    const keyPair = ECPair.fromWIF(wif, COIN);
    legacyKeyPairCache.set(address, keyPair);
    return keyPair;
  }

  function getPQMaterialByAddress(address: string): IPQSigningMaterial {
    const cached = pqMaterialCache.get(address);
    if (cached) return cached;

    const privateKeyEntry = privateKeys[address];
    if (!privateKeyEntry) {
      throw new Error(`Missing private key for address: ${address}`);
    }

    const material = getPQMaterialFromEntry(address, privateKeyEntry);
    pqMaterialCache.set(address, material);
    return material;
  }

  function getUTXO(txid: string, vout: number): IUTXO | undefined {
    return utxoMap.get(getUTXOKey(txid, vout));
  }

  for (let i = 0; i < decoded.inputs.length; i++) {
    const input = decoded.inputs[i];
    tx.addInput(
      Buffer.from(bufferFromHex(input.txid, "input txid")).reverse(),
      input.vout,
      input.sequence,
      bufferFromHexAllowEmpty(input.scriptSigHex ?? "", "input scriptSig")
    );
    if (input.witness && input.witness.length > 0) {
      tx.setWitness(
        i,
        input.witness.map((item, w) =>
          bufferFromHexAllowEmpty(item, `witness[${w}]`)
        )
      );
    }
  }

  for (const out of decoded.outputs) {
    const value = Number(out.valueSats);
    if (!Number.isSafeInteger(value) || value < 0) {
      throw new Error(`Output value ${out.valueSats} out of safe integer range`);
    }
    tx.addOutput(bufferFromHex(out.scriptPubKeyHex, "output script"), value);
  }

  // NIP-025: on networks where nASSETRBFBlockEnabled is active, a tx that
  // spends any asset-AuthScript UTXO must have EVERY input opted out of
  // RBF, or the node rejects it whole with
  // bad-txns-asset-authscript-input-rbf (tx_verify.cpp:770-796). Failing
  // here beats producing a signed tx the node is guaranteed to reject.
  if (NETWORKS_WITH_ASSET_AUTHSCRIPT_RBF_BLOCK.has(network)) {
    const triggering = tx.ins.find((input) => {
      const { txid, vout } = getInputReference(input);
      const inputUtxo = getUTXO(txid, vout);
      if (
        !inputUtxo ||
        typeof inputUtxo.script !== "string" ||
        inputUtxo.script.length === 0
      ) {
        return false;
      }
      return isAssetAuthScript(Buffer.from(inputUtxo.script, "hex"));
    });
    if (triggering) {
      const offending = tx.ins
        .map((input, idx) => ({ idx, sequence: input.sequence }))
        .filter(({ sequence }) => sequence < MIN_NON_RBF_SEQUENCE);
      if (offending.length > 0) {
        const { txid, vout } = getInputReference(triggering);
        throw new Error(
          `NIP-025: input ${txid}:${vout} spends an asset AuthScript UTXO, so every input must have nSequence >= 0x${MIN_NON_RBF_SEQUENCE.toString(16)} ` +
            `(the node rejects the whole tx with bad-txns-asset-authscript-input-rbf). Offending inputs: ` +
            offending
              .map((o) => `#${o.idx} (0x${o.sequence.toString(16)})`)
              .join(", ")
        );
      }
    }
  }

  for (let i = 0; i < tx.ins.length; i++) {
    const input = tx.ins[i];
    const { txid, vout } = getInputReference(input);

    const utxo = getUTXO(txid, vout);
    debug({
      step: "input",
      i,
      txid,
      vout,
      hasUtxo: !!utxo,
      utxoAddress: utxo?.address ?? null,
      utxoScript: utxo?.script ?? null,
    });
    if (!utxo) {
      debug({
        step: "skip-missing-utxo",
        i,
        txid,
        vout,
      });
      continue;
    }

    const scriptPubKey = Buffer.from(utxo.script, "hex");
    const inputIsLegacy = isLegacyScript(scriptPubKey);
    const inputIsPQ = isPQScript(scriptPubKey);
    debug({
      step: "script-type",
      i,
      isLegacy: inputIsLegacy,
      isPQ: inputIsPQ,
    });

    const hint = utxo.bareScriptHint;

    // Covenant branches: the prevout is AuthScript-v1-wrapped
    // (commitment-to-covenant), so `inputIsPQ` is true. The hint tells
    // the library the covenant witness script to use and the branch to
    // take: fill (no signature) or cancel (legacy ECDSA or PQ CSFS).
    if (
      inputIsPQ &&
      (hint?.kind === "covenant-cancel-legacy" ||
        hint?.kind === "covenant-cancel-pq" ||
        hint?.kind === "covenant-fill")
    ) {
      // Common verification: AuthScript-NOAUTH commitment must match the
      // 32-byte program in the prevout. `scriptPubKey` may be either bare
      // AuthScript v1 (34 bytes) or AuthScript v1 + asset wrapper — both
      // share the same 34-byte prefix we care about.
      if (scriptPubKey.length < AUTHSCRIPT_PREFIX_LENGTH) {
        throw new Error(
          `${hint.kind} hint for ${txid}:${vout}: prevout is shorter than the 34-byte AuthScript v1 prefix`
        );
      }
      const covenantScriptBytes = bufferFromHex(hint.covenantScriptHex, `${hint.kind} covenantScriptHex`);
      const expectedCommitment = getAuthScriptCommitment(NOAUTH_TYPE, null, covenantScriptBytes);
      const actualCommitment = scriptPubKey.subarray(2, AUTHSCRIPT_PREFIX_LENGTH);
      if (!expectedCommitment.equals(actualCommitment)) {
        throw new Error(
          `${hint.kind} commitment mismatch for ${txid}:${vout}: hint.covenantScriptHex does not hash to the UTXO's AuthScript commitment`
        );
      }

      if (hint.kind === "covenant-fill") {
        // A NOAUTH commitment match alone must not let an arbitrary
        // witness script be spent "as a fill": the covenant has to parse
        // as a partial-fill order (legacy or PQ).
        let parsesAsPartialFill = false;
        try {
          parsePartialFillScript(hint.covenantScriptHex);
          parsesAsPartialFill = true;
        } catch {
          try {
            parsePartialFillScriptPQ(hint.covenantScriptHex);
            parsesAsPartialFill = true;
          } catch {
            // fall through
          }
        }
        if (!parsesAsPartialFill) {
          throw new Error(
            `covenant-fill covenantScriptHex for ${txid}:${vout} is not a partial-fill covenant (neither legacy nor PQ)`
          );
        }

        // The order total comes from the prevout's transfer wrapper, never
        // from the caller: a wrong total would silently pick the wrong
        // full/partial branch.
        let assetTransfer;
        try {
          assetTransfer = splitAssetWrappedScriptPubKey(utxo.script).assetTransfer;
        } catch (err) {
          throw new Error(
            `covenant-fill for ${txid}:${vout}: cannot parse the prevout asset wrapper: ${(err as Error).message}`
          );
        }
        if (!assetTransfer) {
          throw new Error(
            `covenant-fill for ${txid}:${vout}: prevout carries no transfer asset wrapper; the order total cannot be derived`
          );
        }
        const total = assetTransfer.amountRaw;
        const fillAmount = toBigIntAmount(
          hint.amount,
          `covenant-fill amount for ${txid}:${vout}`
        );

        let fillArgs: Uint8Array[];
        try {
          fillArgs = buildFillWitnessStack(fillAmount, total);
        } catch (err) {
          throw new Error(
            `covenant-fill for ${txid}:${vout}: ${(err as Error).message}`
          );
        }
        const witnessStack = buildAuthScriptWitnessNoAuth({
          args: fillArgs,
          witnessScript: covenantScriptBytes,
        }).map((item) => Buffer.from(item));
        tx.setInputScript(i, Buffer.alloc(0));
        tx.setWitness(i, witnessStack);
        debug({
          step: "covenant-fill-witness-set",
          i,
          amount: fillAmount.toString(),
          total: total.toString(),
          assetName: assetTransfer.assetName,
          fullFill: fillAmount === total,
        });
        continue;
      }

      if (!hasPrivateKeyForAddress(utxo.address)) {
        throw new Error(
          `Missing private key for covenant cancel at ${txid}:${vout} (address ${utxo.address})`
        );
      }

      const amount = getSighashAmount(utxo);

      if (hint.kind === "covenant-cancel-legacy") {
        let parsed;
        try {
          parsed = parsePartialFillScript(hint.covenantScriptHex);
        } catch (err) {
          throw new Error(
            `covenant-cancel-legacy covenantScriptHex is not a legacy partial-fill covenant: ${(err as Error).message}`
          );
        }
        const keyPair = getKeyPairByAddress(utxo.address);
        const derivedPKH = hash160(Buffer.from(keyPair.publicKey));
        const covenantPKH = Buffer.from(parsed.sellerPubKeyHash);
        if (!derivedPKH.equals(covenantPKH)) {
          throw new Error(
            `covenant cancel key for ${txid}:${vout} does not match the covenant sellerPubKeyHash (got ${derivedPKH.toString("hex")}, expected ${covenantPKH.toString("hex")})`
          );
        }
        // AuthScript-NOAUTH sighash: scriptCode = the covenant (witness
        // script), authType = 0x00. Amount is the UTXO's XNA value —
        // typically 0 for asset covenant outputs.
        const sighash = hashForAuthScript(
          tx,
          i,
          covenantScriptBytes,
          amount,
          HASH_TYPE,
          NOAUTH_TYPE,
          refInputs
        );
        const rawSignature = keyPair.sign(sighash);
        const signatureWithHashType = bitcoin.script.signature.encode(
          Buffer.from(rawSignature),
          HASH_TYPE
        );
        const witnessStack = buildAuthScriptWitnessNoAuth({
          args: buildCancelWitnessStack(
            signatureWithHashType,
            Buffer.from(keyPair.publicKey)
          ),
          witnessScript: covenantScriptBytes,
        }).map((item) => Buffer.from(item));
        tx.setInputScript(i, Buffer.alloc(0));
        tx.setWitness(i, witnessStack);
        debug({
          step: "covenant-cancel-legacy-signed",
          i,
          tokenId: parsed.tokenId,
          unitPriceSats: parsed.unitPriceSats.toString(),
        });
        continue;
      }

      // hint.kind === "covenant-cancel-pq"
      let parsedPQ;
      try {
        parsedPQ = parsePartialFillScriptPQ(hint.covenantScriptHex);
      } catch (err) {
        throw new Error(
          `covenant-cancel-pq covenantScriptHex is not a PQ partial-fill covenant: ${(err as Error).message}`
        );
      }
      const pqMaterial = getPQMaterialByAddress(utxo.address);
      const derivedPqCommitment = sha256(pqMaterial.serializedPublicKey);
      const covenantPqCommitment = Buffer.from(parsedPQ.pubKeyCommitment);
      if (!derivedPqCommitment.equals(covenantPqCommitment)) {
        throw new Error(
          `PQ covenant cancel key commitment mismatch for ${txid}:${vout}: ` +
            `wallet pubkey hashes to ${derivedPqCommitment.toString("hex")}, ` +
            `covenant commits to ${covenantPqCommitment.toString("hex")}`
        );
      }
      // Consensus: OP_TXHASH pushes the 32-byte digest, CSFS then
      // re-hashes the message stack item (SIGVERSION_AUTHSCRIPT-ish),
      // so we sign SHA256(opTxHash). See plan v3 §3.
      const opTxHash = computeOpTxHash(tx, parsedPQ.txHashSelector, i);
      const message = sha256(opTxHash);
      const rawSig = ml_dsa44.sign(
        new Uint8Array(message),
        new Uint8Array(pqMaterial.secretKey),
        { extraEntropy: false }
      );
      const sigWithHashType = Buffer.concat([
        Buffer.from(rawSig),
        Buffer.from([HASH_TYPE]),
      ]);
      const witnessStack = buildAuthScriptWitnessNoAuth({
        args: buildCancelWitnessStackPQ(
          sigWithHashType,
          pqMaterial.serializedPublicKey
        ),
        witnessScript: covenantScriptBytes,
      }).map((item) => Buffer.from(item));
      tx.setInputScript(i, Buffer.alloc(0));
      tx.setWitness(i, witnessStack);
      debug({
        step: "covenant-cancel-pq-signed",
        i,
        selector: parsedPQ.txHashSelector,
        opTxHashHex: opTxHash.toString("hex"),
        tokenId: parsedPQ.tokenId,
        unitPriceSats: parsedPQ.unitPriceSats.toString(),
      });
      continue;
    }

    if (!inputIsLegacy && !inputIsPQ) {
      if (hint) {
        throw new Error(
          `${hint.kind} hint requires an AuthScript-v1-wrapped prevout for ${txid}:${vout}, but the prevout script is neither P2PKH nor AuthScript v1`
        );
      }
      throw new Error(
        `Unsupported prevout script for ${txid}:${vout}. Only legacy P2PKH and Neurai AuthScript witness v1 are supported`
      );
    }

    if (inputIsPQ) {
      const hasPrivateKeyEntry = hasPrivateKeyForAddress(utxo.address);
      debug({
        step: "pq-material",
        i,
        address: utxo.address,
        hasPrivateKeyEntry,
      });
      if (!hasPrivateKeyEntry) {
        debug({
          step: "skip-missing-private-key",
          i,
          address: utxo.address,
        });
        continue;
      }

      const privateKeyEntry = privateKeys[utxo.address];
      if (!privateKeyEntry) {
        throw new Error(`Missing private key for address: ${utxo.address}`);
      }

      const spendTemplate = getAuthScriptSpendTemplate(utxo.address, privateKeyEntry);
      const actualCommitment = getAuthScriptProgram(scriptPubKey);

      let expectedCommitment: Buffer;
      if (spendTemplate.authType === NOAUTH_TYPE) {
        expectedCommitment = getAuthScriptCommitment(
          NOAUTH_TYPE,
          null,
          spendTemplate.witnessScript
        );
      } else if (spendTemplate.authType === PQ_AUTHSCRIPT_TYPE) {
        const pqMat = getPQMaterialByAddress(utxo.address);
        expectedCommitment = getAuthScriptCommitment(
          PQ_AUTHSCRIPT_TYPE,
          pqMat.serializedPublicKey,
          spendTemplate.witnessScript
        );
      } else {
        const kp = getKeyPairByAddress(utxo.address);
        expectedCommitment = getAuthScriptCommitment(
          LEGACY_AUTHSCRIPT_TYPE,
          Buffer.from(kp.publicKey),
          spendTemplate.witnessScript
        );
      }

      debug({
        step: "authscript-template",
        i,
        authType: spendTemplate.authType,
        witnessScriptHex: spendTemplate.witnessScript.toString("hex"),
        functionalArgs: spendTemplate.functionalArgs.map((arg) => arg.toString("hex")),
      });

      if (!actualCommitment.equals(expectedCommitment)) {
        throw new Error(
          `AuthScript commitment mismatch for ${txid}:${vout}. The provided key/template does not match the prevout script`
        );
      }

      let witnessStack: Buffer[];

      if (spendTemplate.authType === NOAUTH_TYPE) {
        witnessStack = [
          Buffer.from([NOAUTH_TYPE]),
          ...spendTemplate.functionalArgs,
          spendTemplate.witnessScript,
        ];
      } else if (spendTemplate.authType === PQ_AUTHSCRIPT_TYPE) {
        const pqMaterial = getPQMaterialByAddress(utxo.address);
        const sighash = hashForAuthScript(
          tx,
          i,
          spendTemplate.witnessScript,
          getSighashAmount(utxo),
          HASH_TYPE,
          spendTemplate.authType,
          refInputs
        );
        const signature = Buffer.from(
          ml_dsa44.sign(new Uint8Array(sighash), new Uint8Array(pqMaterial.secretKey), {
            extraEntropy: false,
          })
        );
        const signatureWithHashType = Buffer.concat([signature, Buffer.from([HASH_TYPE])]);
        witnessStack = [
          Buffer.from([PQ_AUTHSCRIPT_TYPE]),
          signatureWithHashType,
          pqMaterial.serializedPublicKey,
          ...spendTemplate.functionalArgs,
          spendTemplate.witnessScript,
        ];
      } else {
        const keyPair = getKeyPairByAddress(utxo.address);
        const sighash = hashForAuthScript(
          tx,
          i,
          spendTemplate.witnessScript,
          getSighashAmount(utxo),
          HASH_TYPE,
          spendTemplate.authType,
          refInputs
        );
        const rawSignature = keyPair.sign(sighash);
        const signatureWithHashType = bitcoin.script.signature.encode(
          Buffer.from(rawSignature),
          HASH_TYPE
        );
        witnessStack = [
          Buffer.from([LEGACY_AUTHSCRIPT_TYPE]),
          signatureWithHashType,
          Buffer.from(keyPair.publicKey),
          ...spendTemplate.functionalArgs,
          spendTemplate.witnessScript,
        ];
      }

      tx.setInputScript(i, Buffer.alloc(0));
      tx.setWitness(i, witnessStack);
      debug({
        step: "witness-set",
        i,
        witnessItems: tx.ins[i].witness?.length ?? 0,
        witness0Len: tx.ins[i].witness?.[0]?.length ?? 0,
        witness1Len: tx.ins[i].witness?.[1]?.length ?? 0,
        witness2Len: tx.ins[i].witness?.[2]?.length ?? 0,
        witnessLastHex: tx.ins[i].witness?.[tx.ins[i].witness.length - 1]?.toString("hex") ?? null,
      });
      continue;
    }

    if (!hasPrivateKeyForAddress(utxo.address)) {
      debug({
        step: "skip-missing-private-key",
        i,
        address: utxo.address,
      });
      continue;
    }

    const keyPair = getKeyPairByAddress(utxo.address);
    const sighash = refInputs
      ? hashForLegacySignatureV3(tx, refInputs, i, scriptPubKey, HASH_TYPE)
      : tx.hashForSignature(i, scriptPubKey, HASH_TYPE);
    const rawSignature = keyPair.sign(sighash);

    const signatureWithHashType = bitcoin.script.signature.encode(
      Buffer.from(rawSignature),
      HASH_TYPE
    );

    const scriptSig = bitcoin.script.compile([
      signatureWithHashType,
      Buffer.from(keyPair.publicKey),
    ]);

    tx.setInputScript(i, scriptSig);
  }

  debug({
    step: "final-inputs",
    inputs: tx.ins.map((input, i) => ({
      i,
      scriptLen: input.script?.length ?? 0,
      witnessItems: input.witness?.length ?? 0,
    })),
  });

  if (refInputs) {
    // v3 exit criterion: the signed hex is serialized by the codec end to
    // end. bitcoinjs' toHex() does not know vrefin and would silently drop
    // it, changing the txid.
    return serializeTransaction({
      ...decoded,
      inputs: decoded.inputs.map((input, i) => ({
        ...input,
        scriptSigHex: Buffer.from(tx.ins[i].script).toString("hex"),
        witness: tx.ins[i].witness.map((item) => Buffer.from(item).toString("hex")),
      })),
    });
  }

  return tx.toHex();
}

const Signer = {
  sign,
};

export default Signer;
