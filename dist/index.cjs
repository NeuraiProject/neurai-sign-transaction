var $g5Y9E$bitcoinjslib = require("bitcoinjs-lib");
var $g5Y9E$ecpair = require("ecpair");
var $g5Y9E$bitcoinerlabsecp256k1 = require("@bitcoinerlab/secp256k1");
var $g5Y9E$hyperbitjschains = require("@hyperbitjs/chains");


function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}

function $parcel$defineInteropFlag(a) {
  Object.defineProperty(a, '__esModule', {value: true, configurable: true});
}

function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$defineInteropFlag(module.exports);

$parcel$export(module.exports, "sign", () => $80bd448eb6ea085b$export$c5552dfdbc7cec71);
$parcel$export(module.exports, "default", () => $80bd448eb6ea085b$export$2e2bcd8739ae039);




const $80bd448eb6ea085b$var$ECPair = (0, $g5Y9E$ecpair.ECPairFactory)((0, ($parcel$interopDefault($g5Y9E$bitcoinerlabsecp256k1))));
function $80bd448eb6ea085b$export$c5552dfdbc7cec71(network, rawTransactionHex, UTXOs, privateKeys) {
    const networkMapper = {
        xna: (0, $g5Y9E$hyperbitjschains.toBitcoinJS)((0, $g5Y9E$hyperbitjschains.xna).mainnet),
        "xna-test": (0, $g5Y9E$hyperbitjschains.toBitcoinJS)((0, $g5Y9E$hyperbitjschains.xna).testnet),
        evr: (0, $g5Y9E$hyperbitjschains.toBitcoinJS)((0, $g5Y9E$hyperbitjschains.evr).mainnet),
        "evr-test": (0, $g5Y9E$hyperbitjschains.toBitcoinJS)((0, $g5Y9E$hyperbitjschains.evr).testnet)
    };
    const COIN = networkMapper[network];
    COIN.bech32 = COIN.bech32 || ""; //ECPair requires bech32 to not be undefined
    if (!COIN) throw new Error("Invalid network specified");
    const COIN_NETWORK = COIN;
    const unsignedTx = $g5Y9E$bitcoinjslib.Transaction.fromHex(rawTransactionHex);
    const tx = new $g5Y9E$bitcoinjslib.Transaction();
    tx.version = unsignedTx.version;
    tx.locktime = unsignedTx.locktime;
    function getKeyPairByAddress(address) {
        const wif = privateKeys[address];
        if (!wif) throw new Error(`Missing private key for address: ${address}`);
        try {
            return $80bd448eb6ea085b$var$ECPair.fromWIF(wif, COIN_NETWORK);
        } catch (e) {
            console.error("Failed to parse WIF:", e);
            throw e;
        }
    }
    function getUTXO(txid, vout) {
        return UTXOs.find((u)=>u.txid === txid && u.outputIndex === vout);
    }
    // Add inputs
    for(let i = 0; i < unsignedTx.ins.length; i++){
        const input = unsignedTx.ins[i];
        const txid = Buffer.from(input.hash).reverse().toString("hex");
        const vout = input.index;
        const utxo = getUTXO(txid, vout);
        if (!utxo) throw new Error(`Missing UTXO for input ${txid}:${vout}`);
        const script = Buffer.from(utxo.script, "hex");
        tx.addInput(Buffer.from(input.hash), input.index, input.sequence, script);
    }
    // Add outputs
    for (const out of unsignedTx.outs)tx.addOutput(out.script, out.value);
    // Sign each input
    for(let i = 0; i < tx.ins.length; i++){
        const input = tx.ins[i];
        const txid = Buffer.from(input.hash).reverse().toString("hex");
        const vout = input.index;
        const utxo = getUTXO(txid, vout);
        if (!utxo) throw new Error(`Missing UTXO for input ${txid}:${vout}`);
        const keyPair = getKeyPairByAddress(utxo.address);
        const scriptPubKey = Buffer.from(utxo.script, "hex");
        const sighash = tx.hashForSignature(i, scriptPubKey, $g5Y9E$bitcoinjslib.Transaction.SIGHASH_ALL);
        const rawSignature = keyPair.sign(sighash);
        const signatureWithHashType = $g5Y9E$bitcoinjslib.script.signature.encode(Buffer.from(rawSignature), $g5Y9E$bitcoinjslib.Transaction.SIGHASH_ALL);
        const pubKey = keyPair.publicKey;
        const scriptSig = $g5Y9E$bitcoinjslib.script.compile([
            signatureWithHashType,
            Buffer.from(pubKey)
        ]);
        tx.setInputScript(i, scriptSig);
    }
    return tx.toHex();
}
var $80bd448eb6ea085b$export$2e2bcd8739ae039 = {
    sign: $80bd448eb6ea085b$export$c5552dfdbc7cec71
};


//# sourceMappingURL=index.cjs.map
