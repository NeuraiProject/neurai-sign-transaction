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

## Fee / size estimation

Because PQ AuthScript inputs are roughly six times larger than legacy P2PKH inputs (~977 vbytes vs ~148), transactions built with a generic per-input estimate will frequently fall under the node's `min relay fee`. To make accurate fee estimation possible without re-implementing the witness layout in every wallet/builder, this package exposes a small estimation API alongside `sign`.

The size constants are exported so that anyone composing transactions can compute fees consistently:

```js
import { VBYTES } from "@neuraiproject/neurai-sign-transaction";

VBYTES.baseTxOverheadBytes; // 10  — version + counts + locktime
VBYTES.segwitMarkerVbytes;  // 1   — added once when any input is PQ
VBYTES.legacyInputVbytes;   // 148 — P2PKH spend, worst-case scriptSig
VBYTES.pqInputVbytes;       // 977 — AuthScript v1 PQ spend with default OP_TRUE script
VBYTES.legacyOutputBytes;   // 34  — value + script length + 25-byte P2PKH script
VBYTES.pqOutputBytes;       // 43  — value + script length + 34-byte AuthScript v1 script
```

### `isPQAddress(address)` / `isPQScript(scriptHex)`

Classifiers for distinguishing PQ destinations from legacy ones. PQ addresses use the `nq` (mainnet) and `tnq` (testnet) bech32 HRPs; PQ scripts start with `OP_1 <32-byte commitment>` (`5120…` in hex), including asset-wrapped variants.

### `estimateInputVbytes(utxo)` / `estimateOutputBytes(target)`

Per-component helpers. `estimateInputVbytes` prefers the UTXO's `script` and falls back to its `address` if the script is not available. `estimateOutputBytes` accepts either an address string or a `{ address }` descriptor.

```js
import {
  estimateInputVbytes,
  estimateOutputBytes,
} from "@neuraiproject/neurai-sign-transaction";

estimateInputVbytes({ script: "5120…" });        // 977
estimateInputVbytes({ address: "mgRYHdMq…" });   // 148
estimateOutputBytes("nq1qabc…");                 // 43
estimateOutputBytes({ address: "mgRYHdMq…" });   // 34
```

### `estimateTransactionVbytes(inputs, outputs)`

Quick pre-build estimate when you do not yet have a `rawTx`. Sums input/output contributions plus base overhead and the segwit marker (added once when any input is PQ). Inputs may be partial UTXO-like objects (`script` and/or `address`); outputs may be address strings or `{ address }`.

```js
import { estimateTransactionVbytes } from "@neuraiproject/neurai-sign-transaction";

const vbytes = estimateTransactionVbytes(
  [{ script: "5120…" }, { address: "mgRYHdMq…" }],
  ["nq1qchange…", "mgRYHdMqburn…"],
);
const feeXna = (vbytes / 1000) * feeRateXnaPerKb;
```

Use this in wallets / builders during UTXO selection to budget the right XNA amount before constructing the raw transaction.

### `estimateVirtualSize(network, rawTxHex, utxos)`

Exact post-signing size for an already-built unsigned transaction. Internally fills each input with a worst-case dummy `scriptSig` / witness derived from the matching UTXO's script, then returns `bitcoinjs-lib`'s `tx.virtualSize()`. **No actual signing is performed**, so this is cheap to call (no PQ key material involved).

The `network` parameter is accepted for API symmetry with `sign`; the script type is inferred from each UTXO's `script`. Unknown/missing UTXOs fall back to a worst-case legacy P2PKH spend.

```js
import { estimateVirtualSize } from "@neuraiproject/neurai-sign-transaction";

const vsize = estimateVirtualSize("xna-pq-test", rawUnsignedHex, UTXOs);
const feeSats = Math.ceil((vsize / 1000) * feeRateSatsPerKb);
```

Recommended flow when an exact fee is required (e.g. when ECDSA signature length variability matters):

1. Build the raw transaction with a placeholder fee.
2. Call `estimateVirtualSize` to get the real vbytes.
3. Re-build the raw transaction adjusting the change output by the difference.
4. Call `sign` on the corrected raw transaction.

Because `estimateVirtualSize` always assumes the worst-case signature size (72-byte DER for ECDSA, 2420-byte ml-dsa44 for PQ), the returned vsize is an upper bound on the actual signed size — you will never under-pay the relay fee.

### What `estimateVirtualSize` covers

The estimator classifies each input as legacy or PQ from the UTXO's `script` and assumes the most common spend layout:

- a worst-case P2PKH `scriptSig` (DER signature + compressed pubkey), or
- a PQ AuthScript witness with the **default** `OP_TRUE` `witnessScript` and **no** `functionalArgs`.

That covers the normal flows: ordinary XNA / asset / asset-creation transactions where every input is either legacy P2PKH or simple PQ AuthScript. For these, the returned vsize is exact within ±2 vbytes.

### Limitations

The estimator does not currently inspect the `privateKeys` map and does not accept signing hints, so it cannot distinguish:

| Case | Effect |
|------|--------|
| PQ AuthScript with custom `witnessScript` and/or `functionalArgs` (covenants) | **Under-estimates** by `len(witnessScript) - 1 + sum(len(functionalArgs))` weight units divided by 4 — risks `min relay fee not met` |
| `authType: 0x00` NoAuth (no signature, no pubkey) | Over-estimates by ≈ 925 vbytes — safe but wasteful |
| `authType: 0x02` Legacy AuthScript (ECDSA inside the AuthScript witness, not PQ) | Over-estimates by ≈ 925 vbytes — safe but wasteful |
| `bareScriptHint` covenant-cancel branches | Witness includes the covenant script and selector byte, neither of which the estimator can size |

If you build covenant spends, NoAuth witnesses, or Legacy AuthScript witnesses programmatically, compute the witness size yourself and add it to `VBYTES.baseTxOverheadBytes + sum(estimateOutputBytes)`. The exotic-witness path may grow a `signingHints` parameter in a future minor version.
