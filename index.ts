import * as bitcoin from "bitcoinjs-lib";
import { ECPairFactory } from "ecpair";
import ecc from "@bitcoinerlab/secp256k1";

const { xna } = require("./coins/xna");
const { xnaLegacy } = require("./coins/xna-legacy");

function toBitcoinJS(network: any): bitcoin.Network {
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

const ECPair = ECPairFactory(ecc);

interface IUTXO {
  address: string;
  assetName: string;
  txid: string;
  outputIndex: number;
  script: string;
  satoshis: number;
  height?: number;
  value: number;
}

export function sign(
  network: "xna" | "xna-test" | "xna-legacy" | "xna-legacy-test",
  rawTransactionHex: string,
  UTXOs: Array<IUTXO>,
  privateKeys: Record<string, string>
): string {
  const networkMapper = {
    xna: toBitcoinJS(xna.mainnet),
    "xna-test": toBitcoinJS(xna.testnet),
    "xna-legacy": toBitcoinJS(xnaLegacy.mainnet),
    "xna-legacy-test": toBitcoinJS(xnaLegacy.testnet),
  };

  const COIN = networkMapper[network];
  if (!COIN) throw new Error("Invalid network specified");
  COIN.bech32 = COIN.bech32 || ""; //ECPair requires bech32 to not be undefined

  const COIN_NETWORK = COIN as bitcoin.Network;

  const unsignedTx = bitcoin.Transaction.fromHex(rawTransactionHex);
  const tx = new bitcoin.Transaction();
  tx.version = unsignedTx.version;
  tx.locktime = unsignedTx.locktime;

  function getKeyPairByAddress(address: string) {
    const wif = privateKeys[address];
    if (!wif) throw new Error(`Missing private key for address: ${address}`);

    try {
      return ECPair.fromWIF(wif, COIN_NETWORK);
    } catch (e) {
      console.error("Failed to parse WIF:", e);
      throw e;
    }
  }

  function getUTXO(txid: string, vout: number): IUTXO | undefined {
    return UTXOs.find((u) => u.txid === txid && u.outputIndex === vout);
  }

  // Add inputs
  for (let i = 0; i < unsignedTx.ins.length; i++) {
    const input = unsignedTx.ins[i];
    const txid = Buffer.from(input.hash).reverse().toString("hex");
    const vout = input.index;

    const utxo = getUTXO(txid, vout);
    if (!utxo) throw new Error(`Missing UTXO for input ${txid}:${vout}`);

    const script = Buffer.from(utxo.script, "hex");
    tx.addInput(Buffer.from(input.hash), input.index, input.sequence, script);
  }

  // Add outputs
  for (const out of unsignedTx.outs) {
    tx.addOutput(out.script, out.value);
  }

  // Sign each input
  for (let i = 0; i < tx.ins.length; i++) {
    const input = tx.ins[i];
    const txid = Buffer.from(input.hash).reverse().toString("hex");
    const vout = input.index;

    const utxo = getUTXO(txid, vout);
    if (!utxo) throw new Error(`Missing UTXO for input ${txid}:${vout}`);

    const keyPair = getKeyPairByAddress(utxo.address);
    const scriptPubKey = Buffer.from(utxo.script, "hex");

    const sighash = tx.hashForSignature(
      i,
      scriptPubKey,
      bitcoin.Transaction.SIGHASH_ALL
    );
    const rawSignature = keyPair.sign(sighash);

    const signatureWithHashType = bitcoin.script.signature.encode(
      Buffer.from(rawSignature),
      bitcoin.Transaction.SIGHASH_ALL
    );

    const pubKey = keyPair.publicKey;
    const scriptSig = bitcoin.script.compile([
      signatureWithHashType,
      Buffer.from(pubKey),
    ]);

    tx.setInputScript(i, scriptSig);
  }

  return tx.toHex();
}

export default {
  sign,
};
