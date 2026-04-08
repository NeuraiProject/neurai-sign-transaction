import * as bitcoin from "bitcoinjs-lib";
import { Buffer } from "buffer";
import { ECPairFactory } from "ecpair";
import * as ecc from "@bitcoinerlab/secp256k1";
import { ml_dsa44 } from "@noble/post-quantum/ml-dsa.js";
import { xna } from "./coins/xna";
import { xnaLegacy } from "./coins/xna-legacy";
import { xnaPQ } from "./coins/xna-pq";

const ECPair = ECPairFactory(ecc);

const HASH_TYPE = bitcoin.Transaction.SIGHASH_ALL;
const LEGACY_PREFIX_LENGTH = 25;
const PQ_PREFIX_LENGTH = 22;
const PQ_PUBLIC_KEY_LENGTH = 1312;
const PQ_SECRET_KEY_LENGTH = 2560;
const PQ_KEYDATA_LENGTH = 3872;
const PQ_SEED_LENGTH = 32;
const PQ_PUBLIC_KEY_HEADER = Buffer.from([0x05]);

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
}

interface IPQSigningMaterial {
  secretKey: Buffer;
  publicKey: Buffer;
  serializedPublicKey: Buffer;
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

export interface IUTXO {
  address: string;
  assetName: string;
  txid: string;
  outputIndex: number;
  script: string;
  satoshis: number;
  height?: number;
  value: number;
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
    script.length >= PQ_PREFIX_LENGTH &&
    script[0] === bitcoin.opcodes.OP_1 &&
    script[1] === 0x14
  );
}

function buildP2PKHLikeScript(program: Buffer): Buffer {
  return bitcoin.script.compile([
    bitcoin.opcodes.OP_DUP,
    bitcoin.opcodes.OP_HASH160,
    program,
    bitcoin.opcodes.OP_EQUALVERIFY,
    bitcoin.opcodes.OP_CHECKSIG,
  ]);
}

function getPQScriptCode(scriptPubKey: Buffer): Buffer {
  if (!isPQScript(scriptPubKey)) {
    throw new Error("PQ scriptPubKey must start with OP_1 <20-byte program>");
  }

  const program = scriptPubKey.subarray(2, PQ_PREFIX_LENGTH);
  const scriptCode = buildP2PKHLikeScript(program);
  if (scriptPubKey.length === PQ_PREFIX_LENGTH) {
    return scriptCode;
  }

  return Buffer.concat([scriptCode, scriptPubKey.subarray(PQ_PREFIX_LENGTH)]);
}

function getUTXOAmount(utxo: IUTXO): number {
  const amount = utxo.satoshis ?? utxo.value;
  if (!Number.isSafeInteger(amount) || amount < 0) {
    throw new Error(`Invalid amount for UTXO ${utxo.txid}:${utxo.outputIndex}`);
  }

  return amount;
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

export function sign(
  network: SupportedNetwork,
  rawTransactionHex: string,
  UTXOs: Array<IUTXO>,
  privateKeys: Record<string, PrivateKeyInput>
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
    const { txid, vout } = getInputReference(input);

    const utxo = getUTXO(txid, vout);
    if (!utxo) throw new Error(`Missing UTXO for input ${txid}:${vout}`);

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
    if (!utxo) throw new Error(`Missing UTXO for input ${txid}:${vout}`);

    const scriptPubKey = Buffer.from(utxo.script, "hex");

    if (!isLegacyScript(scriptPubKey) && !isPQScript(scriptPubKey)) {
      throw new Error(
        `Unsupported prevout script for ${txid}:${vout}. Only legacy P2PKH and Neurai PQ witness v1 are supported`
      );
    }

    if (isPQScript(scriptPubKey)) {
      const pqMaterial = getPQMaterialByAddress(utxo.address);
      const scriptCode = getPQScriptCode(scriptPubKey);
      const sighash = tx.hashForWitnessV0(i, scriptCode, getUTXOAmount(utxo), HASH_TYPE);
      const signature = Buffer.from(
        ml_dsa44.sign(new Uint8Array(sighash), new Uint8Array(pqMaterial.secretKey), {
          extraEntropy: false,
        })
      );
      const signatureWithHashType = Buffer.concat([signature, Buffer.from([HASH_TYPE])]);

      tx.setInputScript(i, Buffer.alloc(0));
      tx.setWitness(i, [signatureWithHashType, pqMaterial.serializedPublicKey]);
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

  return tx.toHex();
}

const Signer = {
  sign,
};

export default Signer;
