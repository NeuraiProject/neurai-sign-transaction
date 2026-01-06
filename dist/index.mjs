import {Transaction as $hCgyA$Transaction, script as $hCgyA$script} from "bitcoinjs-lib";
import {ECPairFactory as $hCgyA$ECPairFactory} from "ecpair";
import $hCgyA$bitcoinerlabsecp256k1 from "@bitcoinerlab/secp256k1";




var $0d42a025c13759a0$exports = {};
/**
 * Neurai (XNA) chain configuration data
 * This replaces the dependency on @hyperbitjs/chains with only the data needed for Neurai
 */ const $0d42a025c13759a0$var$xna = {
    mainnet: {
        name: "Neurai",
        unit: "XNA",
        symbol: "xna",
        decimalPlaces: 100000000,
        messagePrefix: "Neurai Signed Message:\n",
        confirmations: 6,
        website: "https://neurai.org/",
        projectUrl: "https://github.com/NeuraiProject",
        id: "94C49B3B-2C88-4408-B566-3D277C596778",
        network: "mainnet",
        hashGenesisBlock: "00000044d33c0c0ba019be5c0249730424a69cb4c222153322f68c6104484806",
        port: 19000,
        portRpc: 19001,
        protocol: {
            magic: 1381320014
        },
        seedsDns: [
            "seed1.neurai.org",
            "seed2.neurai.org",
            "neurai-ipv4.neuraiexplorer.com"
        ],
        versions: {
            bip32: {
                private: 76066276,
                public: 76067358
            },
            bip44: 1900,
            private: 128,
            public: 53,
            scripthash: 117
        }
    },
    testnet: {
        name: "Neurai",
        unit: "XNA",
        symbol: "xna",
        decimalPlaces: 100000000,
        messagePrefix: "Neurai Signed Message:\n",
        confirmations: 6,
        website: "https://neurai.org/",
        projectUrl: "https://github.com/NeuraiProject",
        id: "1EB2ACBA-E8E0-4970-BB20-37DA4B70F6A6",
        network: "testnet",
        hashGenesisBlock: "0000006af8b8297448605b0283473ec712f9768f81cc7eae6269b875dee3b0cf",
        port: 19100,
        portRpc: 19101,
        protocol: {
            magic: 1313166674
        },
        seedsDns: [
            "testnet1.neuracrypt.org",
            "testnet2.neuracrypt.org",
            "testnet3.neuracrypt.org"
        ],
        versions: {
            bip32: {
                private: 70615956,
                public: 70617039
            },
            bip44: 1,
            private: 239,
            public: 127,
            scripthash: 196
        }
    }
};
const $0d42a025c13759a0$var$chains = {
    xna: $0d42a025c13759a0$var$xna
};
$0d42a025c13759a0$exports = {
    xna: $0d42a025c13759a0$var$xna,
    chains: $0d42a025c13759a0$var$chains
};


var $c3f6c693698dc7cd$require$xna = $0d42a025c13759a0$exports.xna;
var $4f57ad7a71fd71ab$exports = {};
/**
 * Neurai Legacy (XNA-LEGACY) chain configuration data
 * This replaces the dependency on @hyperbitjs/chains with only the data needed for Neurai Legacy
 */ const $4f57ad7a71fd71ab$var$xnaLegacy = {
    mainnet: {
        name: "Neurai",
        unit: "XNA",
        symbol: "xna",
        decimalPlaces: 100000000,
        messagePrefix: "Neurai Signed Message:\n",
        confirmations: 6,
        website: "https://neurai.org/",
        projectUrl: "https://github.com/NeuraiProject",
        id: "94C49B3B-2C88-4408-B566-3D277C596778",
        network: "mainnet",
        hashGenesisBlock: "00000044d33c0c0ba019be5c0249730424a69cb4c222153322f68c6104484806",
        port: 19000,
        portRpc: 19001,
        protocol: {
            magic: 1381320014
        },
        seedsDns: [
            "seed1.neurai.org",
            "seed2.neurai.org",
            "neurai-ipv4.neuraiexplorer.com"
        ],
        versions: {
            bip32: {
                private: 76066276,
                public: 76067358
            },
            bip44: 0,
            private: 128,
            public: 53,
            scripthash: 117
        }
    },
    testnet: {
        name: "Neurai",
        unit: "XNA",
        symbol: "xna",
        decimalPlaces: 100000000,
        messagePrefix: "Neurai Signed Message:\n",
        confirmations: 6,
        website: "https://neurai.org/",
        projectUrl: "https://github.com/NeuraiProject",
        id: "1EB2ACBA-E8E0-4970-BB20-37DA4B70F6A6",
        network: "testnet",
        hashGenesisBlock: "0000006af8b8297448605b0283473ec712f9768f81cc7eae6269b875dee3b0cf",
        port: 19100,
        portRpc: 19101,
        protocol: {
            magic: 1313166674
        },
        seedsDns: [
            "testnet1.neuracrypt.org",
            "testnet2.neuracrypt.org",
            "testnet3.neuracrypt.org"
        ],
        versions: {
            bip32: {
                private: 70615956,
                public: 70617039
            },
            bip44: 1,
            private: 239,
            public: 127,
            scripthash: 196
        }
    }
};
const $4f57ad7a71fd71ab$var$chains = {
    "xna-legacy": $4f57ad7a71fd71ab$var$xnaLegacy
};
$4f57ad7a71fd71ab$exports = {
    xnaLegacy: $4f57ad7a71fd71ab$var$xnaLegacy,
    chains: $4f57ad7a71fd71ab$var$chains
};


var $c3f6c693698dc7cd$require$xnaLegacy = $4f57ad7a71fd71ab$exports.xnaLegacy;
function $c3f6c693698dc7cd$var$toBitcoinJS(network) {
    return {
        messagePrefix: network.messagePrefix,
        bech32: network.bech32 || "",
        bip32: {
            public: network.versions.bip32.public,
            private: network.versions.bip32.private
        },
        pubKeyHash: network.versions.public,
        scriptHash: network.versions.scripthash,
        wif: network.versions.private
    };
}
const $c3f6c693698dc7cd$var$ECPair = (0, $hCgyA$ECPairFactory)((0, $hCgyA$bitcoinerlabsecp256k1));
function $c3f6c693698dc7cd$export$c5552dfdbc7cec71(network, rawTransactionHex, UTXOs, privateKeys) {
    const networkMapper = {
        xna: $c3f6c693698dc7cd$var$toBitcoinJS($c3f6c693698dc7cd$require$xna.mainnet),
        "xna-test": $c3f6c693698dc7cd$var$toBitcoinJS($c3f6c693698dc7cd$require$xna.testnet),
        "xna-legacy": $c3f6c693698dc7cd$var$toBitcoinJS($c3f6c693698dc7cd$require$xnaLegacy.mainnet),
        "xna-legacy-test": $c3f6c693698dc7cd$var$toBitcoinJS($c3f6c693698dc7cd$require$xnaLegacy.testnet)
    };
    const COIN = networkMapper[network];
    if (!COIN) throw new Error("Invalid network specified");
    COIN.bech32 = COIN.bech32 || ""; //ECPair requires bech32 to not be undefined
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
