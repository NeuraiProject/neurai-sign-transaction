# neurai-sign-transaction

Signs a Neurai transaction.

The purpose of this project is to enable signing XNA, asset and PQ/AuthScript inputs in pure JavaScript.

## Package outputs

This package publishes explicit entry points for each runtime:

- `@neuraiproject/neurai-sign-transaction` -> main ESM/CJS library entry
- `@neuraiproject/neurai-sign-transaction/browser` -> browser-focused ESM bundle
- `@neuraiproject/neurai-sign-transaction/global` -> IIFE bundle for `<script>` usage

The preferred consumption path is ESM. The global bundle is kept only for legacy HTML usage.

## How to use

The `sign` method has four required arguments and one optional argument:

1. network string: `"xna" | "xna-test" | "xna-legacy" | "xna-legacy-test" | "xna-pq" | "xna-pq-test"`
2. raw transaction hex
3. array of UTXO objects
4. private keys object keyed by address/identifier
5. optional diagnostics object: `{ debug }`

This library signs an already-built raw transaction. It does not build the raw transaction for you.

For legacy inputs, the value can be the WIF string as before, or an object like `{ WIF }`.

For PQ/AuthScript inputs, the value can be any of these:

- a 32-byte seed in hex (`seedKey` from `@neuraiproject/neurai-key`)
- a 2560-byte ML-DSA-44 secret key in hex (`privateKey` / `secretKey`)
- a 3872-byte exported keydata blob in hex (`secret + public`)
- an object like `{ seedKey }`, `{ privateKey }` or `{ secretKey, publicKey }`

Mixed transactions are supported, so the same `privateKeys` object can contain legacy WIF entries and PQ entries at the same time.

The signer also supports partial signing flows. Inputs that do not have a matching UTXO in the provided `UTXOs` array, or do not have a matching key entry in `privateKeys`, are preserved as-is and skipped instead of aborting the whole signing process.

For PQ/AuthScript inputs, the referenced UTXO must include a valid amount in `satoshis` or `value`, because the witness sighash includes the prevout amount.

## PQ/AuthScript rules

PQ inputs are signed using Neurai AuthScript witness v1 rules:

- prevout must start with `OP_1 <32-byte-commitment>`
- assets may append the usual asset suffix after the 34-byte AuthScript prefix
- the signer reconstructs the commitment from:
  - `auth_type = 0x01`
  - `auth_descriptor = 0x01 || Hash160(0x05 || pqPublicKey)`
  - `witnessScript = OP_TRUE` by default
- sighash uses Neurai `SIGVERSION_AUTHSCRIPT`, which is BIP143-style plus `auth_type_byte`
- witness stack for the default PQ template is:
  - `[auth_type_byte, ml-dsa44-signature+sighashType, 0x05||pqPublicKey, witnessScript]`

Current support is intentionally narrow:

- only PQ `auth_type = 0x01` is supported by this library
- default simple PQ template is `witnessScript = OP_TRUE`
- custom templates can be provided with `witnessScript` and `functionalArgs`
- legacy-secp and `NoAuth` AuthScript variants are not signed by this library yet

`xna-pq` and `xna-pq-test` use the PQ bech32 HRPs (`nq` / `tnq`) and PQ bip32 settings.

The method returns a signed transaction hex. Broadcasting it is up to the caller.

```js
import Signer from "@neuraiproject/neurai-sign-transaction";

const raw = "...";
const UTXOs = [
  {
    address: "tnq1yourauthscriptaddress...",
    assetName: "XNA",
    txid: "...",
    outputIndex: 0,
    script: "5120...", // OP_1 <32-byte commitment>
    satoshis: 150000,
    value: 150000,
  },
];
const privateKeys = {
  "tnq1yourauthscriptaddress...": {
    seedKey: "aabbcc...32-byte-seed-in-hex",
  },
};
const signed = Signer.sign("xna-pq-test", raw, UTXOs, privateKeys);
console.log(signed);
```

Example with an explicit custom witnessScript:

```js
const privateKeys = {
  "tnq1yourauthscriptaddress...": {
    seedKey: "aabbcc...32-byte-seed-in-hex",
    authType: 0x01,
    witnessScript: "51", // OP_TRUE
    functionalArgs: [],
  },
};
```

Debug example:

```js
const events = [];
const signed = Signer.sign(network, rawTransactionHex, utxos, privateKeys, {
  debug: (event) => events.push(event),
});

console.log(events);
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
