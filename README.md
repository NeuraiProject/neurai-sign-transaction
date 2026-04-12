# neurai-sign-transaction

Signs a Neurai transaction.

The purpose of this project is to enable signing XNA, asset and AuthScript inputs in pure JavaScript, supporting all three AuthScript auth types (NoAuth, PQ and Legacy) as well as classic P2PKH.

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

For legacy P2PKH inputs, the value can be the WIF string directly, or an object like `{ WIF }`.

For AuthScript inputs, the value depends on the `authType`:

### NoAuth (`authType: 0x00`)

No key material is required. The witness contains only the auth type byte, any `functionalArgs`, and the `witnessScript`.

```js
{ authType: 0 }
// or with a custom covenant script:
{ authType: 0, witnessScript: "527551", functionalArgs: ["deadbeef"] }
```

### PQ (`authType: 0x01`) — default

Provide PQ key material in any of these forms:

- a 32-byte seed in hex (`seedKey` from `@neuraiproject/neurai-key`)
- a 2560-byte ML-DSA-44 secret key in hex (`privateKey` / `secretKey`)
- a 3872-byte exported keydata blob in hex (`secret + public`)
- an object like `{ seedKey }`, `{ privateKey }` or `{ secretKey, publicKey }`

When using an object, you may also include `authType: 1`, `witnessScript`, and `functionalArgs`.

### Legacy AuthScript (`authType: 0x02`)

Uses a classic secp256k1 key inside the AuthScript witness structure. Provide a WIF key:

```js
{ WIF: "cVP9mzc...", authType: 2 }
// or with a covenant script:
{ WIF: "cVP9mzc...", authType: 2, witnessScript: "527551", functionalArgs: ["cafe"] }
```

Mixed transactions are supported — the same `privateKeys` object can contain legacy P2PKH WIF entries, PQ entries, Legacy AuthScript entries and NoAuth entries at the same time.

The signer also supports partial signing flows. Inputs that do not have a matching UTXO in the provided `UTXOs` array, or do not have a matching key entry in `privateKeys`, are preserved as-is and skipped instead of aborting the whole signing process.

For PQ/AuthScript inputs, the referenced UTXO must include a valid amount in `satoshis` or `value`, because the witness sighash includes the prevout amount.

## AuthScript rules

All AuthScript inputs use Neurai AuthScript witness v1 rules:

- prevout must start with `OP_1 <32-byte-commitment>`
- assets may append the usual asset suffix after the 34-byte AuthScript prefix
- sighash uses Neurai `SIGVERSION_AUTHSCRIPT`, which is BIP143-style plus `auth_type_byte`
- default `witnessScript` is `OP_TRUE`; custom templates can be provided via `witnessScript` and `functionalArgs`

### Commitment reconstruction

The signer reconstructs the commitment and verifies it matches the prevout before signing. The commitment is built from:

| authType | auth_descriptor |
|----------|----------------|
| `0x00` NoAuth | `0x00` |
| `0x01` PQ | `0x01 \|\| Hash160(0x05 \|\| pqPublicKey)` |
| `0x02` Legacy | `0x02 \|\| Hash160(compressedSecp256k1PubKey)` |

`commitment = TaggedHash("NeuraiAuthScript", version || auth_descriptor || SHA256(witnessScript))`

### Witness stacks

| authType | Witness stack |
|----------|--------------|
| `0x00` NoAuth | `[0x00, ...functionalArgs, witnessScript]` |
| `0x01` PQ | `[0x01, ml-dsa44-sig+hashType, 0x05\|\|pqPubKey, ...functionalArgs, witnessScript]` |
| `0x02` Legacy | `[0x02, ecdsaSig+hashType, compressedPubKey, ...functionalArgs, witnessScript]` |

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

Mixed transaction with all auth types:

```js
const privateKeys = {
  // Legacy P2PKH — plain WIF
  "mgRYHdMq...": "cVP9mzc...",
  // PQ AuthScript (default authType 0x01)
  "tnq1pqaddr...": { seedKey: "aabbcc..." },
  // Legacy AuthScript (authType 0x02)
  "tnq1legacyaddr...": { WIF: "cVP9mzc...", authType: 2 },
  // NoAuth (authType 0x00)
  "tnq1noauthaddr...": { authType: 0 },
};
```

Example with an explicit custom witnessScript and functional args:

```js
const privateKeys = {
  "tnq1yourauthscriptaddress...": {
    seedKey: "aabbcc...32-byte-seed-in-hex",
    authType: 0x01,
    witnessScript: "527551", // OP_2 OP_DROP OP_1
    functionalArgs: ["deadbeef"],
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
