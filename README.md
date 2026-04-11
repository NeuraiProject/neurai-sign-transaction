# neurai-sign-transaction

Signs a Neurai transaction

The sole purpose of this project is to enable us to
"Sign XNA, asset and PQ-input transfer transactions in pure JavaScript"
 
## Package outputs

This package now publishes explicit entry points for each runtime:

- `@neuraiproject/neurai-sign-transaction` -> main ESM/CJS library entry
- `@neuraiproject/neurai-sign-transaction/browser` -> browser-focused ESM bundle
- `@neuraiproject/neurai-sign-transaction/global` -> IIFE bundle for `<script>`

The preferred consumption path is ESM. The global bundle is kept only for legacy HTML usage.

## How to use

The sign method has four required arguments and one optional argument
1) The network "string", can be "xna" | "xna-test" | "xna-legacy" | "xna-legacy-test" | "xna-pq" | "xna-pq-test",
2) The raw transaction (in hex)
3) An array of UTXO objects to use
4) Private keys. An object with "address" as key.

There is also an optional fifth argument for diagnostics:
5) `{ debug }`, where `debug` can be `true` to emit console logs or a callback receiving structured events.

This library signs an already-built raw transaction. It does not build the raw transaction for you.

For legacy inputs, the value can be the WIF string as before, or an object like `{ WIF }`.

For PQ inputs, the value can be any of these:
- a 32-byte seed in hex (`seedKey` from `@neuraiproject/neurai-key`)
- a 2560-byte ML-DSA-44 secret key in hex (`privateKey` / `secretKey`)
- a 3872-byte exported keydata blob in hex (`secret + public`)
- an object like `{ seedKey }`, `{ privateKey }` or `{ secretKey, publicKey }`

Mixed transactions are supported, so the same `privateKeys` object can contain legacy WIF entries and PQ entries at the same time.

The signer also supports partial signing flows. Inputs that do not have a matching UTXO in the provided `UTXOs` array, or do not have a matching key entry in `privateKeys`, are preserved as-is and skipped instead of aborting the whole signing process. This is required for mixed atomic swaps where another participant has already signed their own input.

For PQ inputs, the referenced UTXO must include a valid amount in `satoshis` or `value`, because the witness sighash includes the prevout amount.

PQ inputs are signed with witness data using the Neurai node rules:
- prevout `OP_1 <20-byte-program>` or `OP_1 <20-byte-program> OP_XNA_ASSET ... OP_DROP`
- `hashForWitnessV0` including the prevout amount
- witness stack `[ml-dsa44-signature+sighashType, 0x05||pqPublicKey]`

`xna-pq` and `xna-pq-test` use the PQ bech32 HRPs (`nq` / `tnq`) and PQ bip32 settings.

returns a signed transaction (hex), after that it is up to you to publish it on the network
```
import Signer from "@neuraiproject/neurai-sign-transaction";

const raw =
  "0200000002fe6cfe20184b592849231eea8167e3de073b6ec1b8218c2ef36838a4e07dd11c0200000000ffffffff28c32b825b14251708ea39c0ac706bd3d933778d7838d01b678b045a48e219950000000000ffffffff0200000000000000003a76a91416014dfb02a07417cbf8c0366ee5ae0a29d5878f88acc01e72766e74114652454e2f59554c45544944453230323100e1f5050000000075000e2707000000001976a914c6a0e8557c7567a4d9cc84574c34fbb62ece3c9688ac00000000";
const UTXOs = [
  {
    address: "RTPSdYw3iB93L6Hb9xWd1ixVxPYu1QePdi",
    assetName: "XNA",
    txid: "1cd17de0a43868f32e8c21b8c16e3b07dee36781ea1e234928594b1820fe6cfe",
    outputIndex: 2,
    script: "76a914c6a0e8557c7567a4d9cc84574c34fbb62ece3c9688ac",
    satoshis: 122000000,
    height: 2670673,
  },
  {
    address: "RSuQSgXXr1z4gKommSqhHLffiNxnSE3Bwn",
    assetName: "FREN/YULETIDE2021",
    txid: "9519e2485a048b671bd038788d7733d9d36b70acc039ea081725145b822bc328",
    outputIndex: 0,
    script:
      "76a914c1536f46fa2fa04be210406529be283c1c85e4ce88acc01e72766e74114652454e2f59554c45544944453230323100e1f5050000000075",
    satoshis: 100000000,
    height: 2670669,
  },
];
const privateKeys = {
  RTPSdYw3iB93L6Hb9xWd1ixVxPYu1QePdi:
    "L2GD7txjmdKSTy7mBq2FowZusjdWP679ttWSRfj4eLBu2usTWMV9",
  RSuQSgXXr1z4gKommSqhHLffiNxnSE3Bwn:
    "Kxj2xMvLbcXeGzuSrZLtpnZWzXnTXnhtuCQRQhKLjN7bSQXuakyh",
};
const signed = Signer.sign("xna", raw, UTXOs, privateKeys);
console.log(signed);


```

Debug example:
```js
const events = [];
const signed = Signer.sign(network, rawTransactionHex, utxos, privateKeys, {
  debug: (event) => events.push(event),
});

console.log(events);
```

Example PQ key input:
```
const privateKeys = {
  tnq1yourpqaddresshere: {
    seedKey: "aabbcc...32-byte-seed-in-hex",
  },
};
```

Browser ESM usage:

```js
import Signer from "@neuraiproject/neurai-sign-transaction/browser";

const signed = Signer.sign(network, rawTransactionHex, utxos, privateKeys);
```

Legacy global usage:

```html
<script src="./dist/NeuraiSignTransaction.global.js"></script>
<script>
  const signed = globalThis.NeuraiSignTransaction.sign(
    network,
    rawTransactionHex,
    utxos,
    privateKeys
  );
</script>
```
