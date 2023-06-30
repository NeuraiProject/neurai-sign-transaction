import {Buffer as $hCgyA$Buffer} from "buffer";
import {Transaction as $hCgyA$Transaction, TransactionBuilder as $hCgyA$TransactionBuilder, ECPair as $hCgyA$ECPair} from "bitcoinjs-lib";
import {chains as $hCgyA$chains, toBitcoinJS as $hCgyA$toBitcoinJS} from "@hyperbitjs/chains";



var $c3f6c693698dc7cd$require$Buffer = $hCgyA$Buffer;

function $c3f6c693698dc7cd$export$c5552dfdbc7cec71(network, rawTransactionHex, UTXOs, privateKeys) {
    const networkMapper = {
        xna: (0, $hCgyA$chains).xna.main,
        "xna-test": (0, $hCgyA$chains).xna.test,
        evr: (0, $hCgyA$chains).evr.main,
        "evr-test": (0, $hCgyA$chains).evr.test
    };
    const coin = networkMapper[network];
    if (!coin) throw new Error("Validation error, first argument network must be xna, xna-test, evr or evr-test");
    //@ts-ignore
    const NEURAI = (0, $hCgyA$toBitcoinJS)(coin);
    const tx = $hCgyA$Transaction.fromHex(rawTransactionHex);
    const txb = $hCgyA$TransactionBuilder.fromTransaction(tx, NEURAI);
    function getKeyPairByAddress(address) {
        const wif = privateKeys[address];
        const keyPair = $hCgyA$ECPair.fromWIF(wif, NEURAI);
        return keyPair;
    }
    function getUTXO(transactionId, index) {
        return UTXOs.find((utxo)=>{
            return utxo.txid === transactionId && utxo.outputIndex === index;
        });
    }
    for(let i = 0; i < tx.ins.length; i++){
        const input = tx.ins[i];
        const txId = $c3f6c693698dc7cd$require$Buffer.from(input.hash, "hex").reverse().toString("hex");
        const utxo = getUTXO(txId, input.index);
        if (!utxo) throw Error("Could not find UTXO for input " + input);
        const address = utxo.address;
        const keyPair = getKeyPairByAddress(address);
        const signParams = {
            prevOutScriptType: "p2pkh",
            vin: i,
            keyPair: keyPair,
            UTXO: utxo
        };
        txb.sign(signParams);
    }
    const signedTxHex = txb.build().toHex();
    return signedTxHex;
}
var $c3f6c693698dc7cd$export$2e2bcd8739ae039 = {
    sign: $c3f6c693698dc7cd$export$c5552dfdbc7cec71
};


export {$c3f6c693698dc7cd$export$c5552dfdbc7cec71 as sign, $c3f6c693698dc7cd$export$2e2bcd8739ae039 as default};
//# sourceMappingURL=index.mjs.map
