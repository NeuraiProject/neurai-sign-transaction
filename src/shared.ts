import * as bitcoin from "bitcoinjs-lib";
import { Buffer } from "buffer";
import { ECPairFactory } from "ecpair";
import * as ecc from "@bitcoinerlab/secp256k1";
import { ml_dsa44 } from "@noble/post-quantum/ml-dsa.js";
import {
  parsePartialFillScript,
  splitAssetWrappedScriptPubKey,
} from "@neuraiproject/neurai-scripts";
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
 * Hint that unlocks signing of a bare-script prevout that is not a
 * recognised legacy P2PKH nor a Neurai AuthScript witness v1. The library
 * only honours hints for the two partial-fill covenant cancel branches —
 * every other shape is still rejected.
 */
export type BareScriptSigningHint =
  | { kind: "covenant-cancel-legacy" }
  | { kind: "covenant-cancel-pq"; txHashSelector: number };

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

function hashForAuthScript(
  tx: bitcoin.Transaction,
  inIndex: number,
  witnessScript: Buffer,
  amount: number,
  hashType: number,
  authType: number
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

  const unsignedTx = bitcoin.Transaction.fromHex(rawTransactionHex);
  const tx = new bitcoin.Transaction();
  tx.version = unsignedTx.version;
  tx.locktime = unsignedTx.locktime;

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

  for (let i = 0; i < unsignedTx.ins.length; i++) {
    const input = unsignedTx.ins[i];
    tx.addInput(Buffer.from(input.hash), input.index, input.sequence, input.script);
    if (input.witness.length > 0) {
      tx.setWitness(i, input.witness);
    }
  }

  for (const out of unsignedTx.outs) {
    tx.addOutput(out.script, out.value);
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

    if (!inputIsLegacy && !inputIsPQ) {
      const hint = utxo.bareScriptHint;
      if (hint?.kind === "covenant-cancel-legacy") {
        const split = splitAssetWrappedScriptPubKey(utxo.script);
        if (!split.assetTransfer) {
          throw new Error(
            `covenant-cancel-legacy hint for ${txid}:${vout} requires an asset-wrapped prevout`
          );
        }

        let parsed;
        try {
          parsed = parsePartialFillScript(split.prefixHex);
        } catch (err) {
          throw new Error(
            `covenant-cancel-legacy hint for ${txid}:${vout} but prefix is not a recognized partial-fill covenant: ${(err as Error).message}`
          );
        }

        if (!hasPrivateKeyForAddress(utxo.address)) {
          throw new Error(
            `Missing private key for covenant cancel at ${txid}:${vout} (seller address ${utxo.address})`
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

        const sighash = tx.hashForSignature(i, scriptPubKey, HASH_TYPE);
        const rawSignature = keyPair.sign(sighash);
        const signatureWithHashType = bitcoin.script.signature.encode(
          Buffer.from(rawSignature),
          HASH_TYPE
        );
        const scriptSig = bitcoin.script.compile([
          signatureWithHashType,
          Buffer.from(keyPair.publicKey),
          bitcoin.opcodes.OP_1,
        ]);
        tx.setInputScript(i, scriptSig);
        debug({
          step: "covenant-cancel-legacy-signed",
          i,
          prefixLen: split.prefixHex.length / 2,
          tokenId: parsed.tokenId,
          unitPriceSats: parsed.unitPriceSats.toString(),
          assetName: split.assetTransfer.assetName,
          amountRaw: split.assetTransfer.amountRaw.toString(),
        });
        continue;
      }
      if (hint?.kind === "covenant-cancel-pq") {
        throw new Error(
          `covenant-cancel-pq hint for ${txid}:${vout} is not implemented in this build (lands in @neuraiproject/neurai-sign-transaction 1.4.0)`
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
          getUTXOAmount(utxo),
          HASH_TYPE,
          spendTemplate.authType
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
          getUTXOAmount(utxo),
          HASH_TYPE,
          spendTemplate.authType
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
    const sighash = tx.hashForSignature(i, scriptPubKey, HASH_TYPE);
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

  return tx.toHex();
}

const Signer = {
  sign,
};

export default Signer;
