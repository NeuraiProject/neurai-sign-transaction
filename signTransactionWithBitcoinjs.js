const bitcoin = require("bitcoinjs-lib");
const coininfo = require("coininfo");

const NEURAI = coininfo.neurai.main.toBitcoinJS();
const { getRPC, methods } = require("@neuraiproject/neurai-rpc");

const full = require("./mock/full.json").debug;
const UTXOs = full.xnaUTXOs.concat(full.assetUTXOs);

const txHex = full.rawUnsignedTransaction;
const tx = bitcoin.Transaction.fromHex(txHex);

const txb = bitcoin.TransactionBuilder.fromTransaction(tx, NEURAI);

function getUTXO(transactionId, index) {
  return UTXOs.find((utxo) => {
    return utxo.txid === transactionId && utxo.outputIndex === index;
  });
}
for (let i = 0; i < tx.ins.length; i++) {
  const input = tx.ins[i];

  const txId = Buffer.from(input.hash, "hex").reverse().toString("hex");
  const utxo = getUTXO(full.inputs[i].txid, full.inputs[i].vout);

  const address = utxo.address;
  console.log(address);

  const keyPair = getKeyPairByAddress(address);

  const signParams = {
    prevOutScriptType: "p2pkh",
    vin: i,
    keyPair,
    UTXO: utxo,
  };
  txb.sign(signParams);
}

const signedTxHex = txb.build().toHex();

const rpc = getRPC("anon", "anon", "https://xna-rpc-mainnet.ting.finance/rpc");

async function main() {
  const decoded = await rpc(methods.decoderawtransaction, [signedTxHex]);
  const fs = require("fs");

  fs.writeFileSync(
    "./mock/decodedSignedTransactionBitcoinjs.json",
    JSON.stringify(decoded, null, 4)
  );
}

main();
//const signedTxHex = txb.build().toHex();
// Broadcast this signed raw transaction
//console.log(signedTxHex);

function getKeyPairByAddress(address) {
  const wif = full.privateKeys[address];
  const keyPair = bitcoin.ECPair.fromWIF(wif, NEURAI);
  return keyPair;
}
