import {Transaction as $hCgyA$Transaction, script as $hCgyA$script} from "bitcoinjs-lib";
import {ECPairFactory as $hCgyA$ECPairFactory} from "ecpair";
import $hCgyA$bitcoinerlabsecp256k1 from "@bitcoinerlab/secp256k1";
import {toBitcoinJS as $hCgyA$toBitcoinJS, xna as $hCgyA$xna, evr as $hCgyA$evr} from "@hyperbitjs/chains";





const $c3f6c693698dc7cd$var$ECPair = (0, $hCgyA$ECPairFactory)((0, $hCgyA$bitcoinerlabsecp256k1));
function $c3f6c693698dc7cd$export$c5552dfdbc7cec71(network, rawTransactionHex, UTXOs, privateKeys) {
    const networkMapper = {
        xna: (0, $hCgyA$toBitcoinJS)((0, $hCgyA$xna).mainnet),
        "xna-test": (0, $hCgyA$toBitcoinJS)((0, $hCgyA$xna).testnet),
        evr: (0, $hCgyA$toBitcoinJS)((0, $hCgyA$evr).mainnet),
        "evr-test": (0, $hCgyA$toBitcoinJS)((0, $hCgyA$evr).testnet)
    };
    const COIN = networkMapper[network];
    COIN.bech32 = COIN.bech32 || ""; //ECPair requires bech32 to not be undefined
    if (!COIN) throw new Error("Invalid network specified");
    const COIN_NETWORK = COIN;
    const unsignedTx = $hCgyA$Transaction.fromHex(rawTransactionHex);
    const tx = new $hCgyA$Transaction();
    tx.version = unsignedTx.version;
    tx.locktime = unsignedTx.locktime;
    function getKeyPairByAddress(address) {
        const wif = privateKeys[address];
        if (!wif) throw new Error(`Missing private key for address: ${address}`);
        try {
            return $c3f6c693698dc7cd$var$ECPair.fromWIF(wif, COIN_NETWORK);
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
        const sighash = tx.hashForSignature(i, scriptPubKey, $hCgyA$Transaction.SIGHASH_ALL);
        const rawSignature = keyPair.sign(sighash);
        const signatureWithHashType = $hCgyA$script.signature.encode(Buffer.from(rawSignature), $hCgyA$Transaction.SIGHASH_ALL);
        const pubKey = keyPair.publicKey;
        const scriptSig = $hCgyA$script.compile([
            signatureWithHashType,
            Buffer.from(pubKey)
        ]);
        tx.setInputScript(i, scriptSig);
    }
    return tx.toHex();
}
var $c3f6c693698dc7cd$export$2e2bcd8739ae039 = {
    sign: $c3f6c693698dc7cd$export$c5552dfdbc7cec71
};


export {$c3f6c693698dc7cd$export$c5552dfdbc7cec71 as sign, $c3f6c693698dc7cd$export$2e2bcd8739ae039 as default};
//# sourceMappingURL=index.mjs.map
