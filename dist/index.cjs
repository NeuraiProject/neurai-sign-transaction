var $g5Y9E$bitcoinjslib = require("bitcoinjs-lib");
var $g5Y9E$ecpair = require("ecpair");
var $g5Y9E$bitcoinerlabsecp256k1 = require("@bitcoinerlab/secp256k1");


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



var $af3d93861d966625$exports = {};
/**
 * Neurai (XNA) chain configuration data
 * This replaces the dependency on @hyperbitjs/chains with only the data needed for Neurai
 */ const $af3d93861d966625$var$xna = {
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
const $af3d93861d966625$var$chains = {
    xna: $af3d93861d966625$var$xna
};
$af3d93861d966625$exports = {
    xna: $af3d93861d966625$var$xna,
    chains: $af3d93861d966625$var$chains
};


var $80bd448eb6ea085b$require$xna = $af3d93861d966625$exports.xna;
var $f755b72afc69c754$exports = {};
/**
 * Neurai Legacy (XNA-LEGACY) chain configuration data
 * This replaces the dependency on @hyperbitjs/chains with only the data needed for Neurai Legacy
 */ const $f755b72afc69c754$var$xnaLegacy = {
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
const $f755b72afc69c754$var$chains = {
    "xna-legacy": $f755b72afc69c754$var$xnaLegacy
};
$f755b72afc69c754$exports = {
    xnaLegacy: $f755b72afc69c754$var$xnaLegacy,
    chains: $f755b72afc69c754$var$chains
};


var $80bd448eb6ea085b$require$xnaLegacy = $f755b72afc69c754$exports.xnaLegacy;
function $80bd448eb6ea085b$var$toBitcoinJS(network) {
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
const $80bd448eb6ea085b$var$ECPair = (0, $g5Y9E$ecpair.ECPairFactory)((0, ($parcel$interopDefault($g5Y9E$bitcoinerlabsecp256k1))));
function $80bd448eb6ea085b$export$c5552dfdbc7cec71(network, rawTransactionHex, UTXOs, privateKeys) {
    const networkMapper = {
        xna: $80bd448eb6ea085b$var$toBitcoinJS($80bd448eb6ea085b$require$xna.mainnet),
        "xna-test": $80bd448eb6ea085b$var$toBitcoinJS($80bd448eb6ea085b$require$xna.testnet),
        "xna-legacy": $80bd448eb6ea085b$var$toBitcoinJS($80bd448eb6ea085b$require$xnaLegacy.mainnet),
        "xna-legacy-test": $80bd448eb6ea085b$var$toBitcoinJS($80bd448eb6ea085b$require$xnaLegacy.testnet)
    };
    const COIN = networkMapper[network];
    if (!COIN) throw new Error("Invalid network specified");
    COIN.bech32 = COIN.bech32 || ""; //ECPair requires bech32 to not be undefined
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
