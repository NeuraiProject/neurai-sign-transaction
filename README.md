# neurai-sign-transaction

Signs a Neurai transaction.

The purpose of this project is to enable signing XNA, asset and AuthScript inputs in pure JavaScript for every Neurai address type: classic P2PKH, generic AuthScript witness v1 with its three auth types (NoAuth, PQ and Legacy), strict PQ witness v2 and strict ECDSA witness v3.

## 3.0.1: ESM type declarations

The package is CommonJS (no `"type": "module"`), so TypeScript read its only
declaration file, `dist/index.d.ts`, as CommonJS for every entry. For
`import` (which loads the ESM build, `dist/index.mjs`) that typed the default
import as the whole module: `import Signer from "…"; Signer.getAddressKind(…)`
compiled under `moduleResolution: "node16"` / `"nodenext"` and failed at
runtime, because the ESM default export is the `Signer` object (`{ sign }`).
Named imports were not affected.

- `import` and the browser entry now use ESM declarations
  (`dist/index.d.mts`); `require` keeps `dist/index.d.ts` (CommonJS).
- The browser build is `dist/browser.mjs` (was `dist/browser.js`, ESM syntax
  in a `.js` file of a CommonJS package, which Node had to re-parse). Import
  it through `@neuraiproject/neurai-sign-transaction/browser` as before.
- `npm run test:types` compiles ESM, CommonJS and browser consumers
  (`types-test/`) against the built declarations (NodeNext, Node16, Bundler;
  `skipLibCheck: false`), and `npm run test:package` checks the packed tarball
  in a clean project, with TypeScript 4.7 too, including that every
  declaration has the module format of the file it describes.

No runtime or API change.

## 3.0.0: address types of neurai-key 5

| Prevout scriptPubKey | Address | Signed as |
|---|---|---|
| `OP_DUP OP_HASH160 <20B> OP_EQUALVERIFY OP_CHECKSIG` | `N…` / `t…` | P2PKH scriptSig |
| `OP_1 <32B>` | `nc1p…` / `tnc1p…` | generic AuthScript v1 (NoAuth / PQ / Legacy, custom `witnessScript`) |
| `OP_2 <32B>` | `pq1z…` / `tpq1z…` | strict PQ v2: `[0x01, sig, 0x05‖pqPubKey, OP_TRUE]` |
| `OP_3 <32B>` | `nq1r…` / `tnq1r…` | strict ECDSA v3: `[0x02, sig, compressedPubKey, OP_TRUE]` |

The input type always comes from the prevout `script`. Breaking changes versus 2.x:

- `OP_2` / `OP_3` prevouts used to throw "Only legacy P2PKH and Neurai AuthScript witness v1 are supported"; they are signed now (see [Strict families](#strict-families-pq-v2-and-ecdsa-v3)).
- `isPQAddress` / `isPQScript` are deprecated and decode the address instead of checking a prefix: `nq1…` / `tnq1…` is ECDSA witness v3 and returns `false`; `pq1…` / `tpq1…` and `nc1…` / `tnc1…` return `true`. Strings that are not valid Neurai addresses return `false`. Use `getAddressKind` / `getScriptKind`.
- `estimateInputVbytes` / `estimateOutputBytes` / `estimateTransactionVbytes` decode addresses too: an invalid address is sized as legacy, a v3 input as `VBYTES.ecdsaWitnessInputVbytes` (70), and every witness output as `VBYTES.witnessOutputBytes` (43). The segwit marker is added for any witness input.
- `network` accepts every neurai-key 5 label (`xna-old-legacy`, `xna-authscript[-test]` are new). Only the chain matters: mainnet labels use the mainnet WIF and `-test` labels the testnet/regtest WIF. An unknown label throws with the list of valid ones.
- Requires `@neuraiproject/neurai-create-transaction` `^0.9.0` and `@neuraiproject/neurai-scripts` `^0.9.0`.

The strict families are only active on regtest today; generic AuthScript v1 on testnet and regtest. `test-regtest.js` (`npm run test:regtest`, needs a regtest node, see the file header) spends every type with keys from neurai-key 5 and checks that the node accepts them.

## Package outputs

This package publishes explicit entry points for each runtime:

- `@neuraiproject/neurai-sign-transaction` -> main ESM/CJS library entry
- `@neuraiproject/neurai-sign-transaction/browser` -> browser-focused ESM bundle
- `@neuraiproject/neurai-sign-transaction/global` -> IIFE bundle for `<script>` usage

The preferred consumption path is ESM. The global bundle is kept only for legacy HTML usage.

## How to use

The `sign` method has four required arguments and one optional argument:

1. network string, any neurai-key 5 label: `"xna" | "xna-test" | "xna-legacy" | "xna-legacy-test" | "xna-old-legacy" | "xna-pq" | "xna-pq-test" | "xna-authscript" | "xna-authscript-test"` (only its chain is used)
2. raw transaction hex
3. array of UTXO objects
4. private keys object keyed by address/identifier
5. optional diagnostics object: `{ debug }`

This library signs an already-built raw transaction. It does not build the raw transaction for you.

For legacy P2PKH inputs, the value can be the WIF string directly, or an object like `{ WIF }`.

Objects returned by `@neuraiproject/neurai-key` can be passed as they are (`{ WIF, ... }`, `{ seedKey, ... }`).

For generic AuthScript v1 inputs (`nc1p…` / `tnc1p…`), the value depends on the `authType`:

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

### Strict families: PQ v2 and ECDSA v3

The node fixes the whole spend template, so there is nothing to configure:

- **PQ v2** (`OP_2`, `pq1z…`): PQ key material as above (a plain hex string is the PQ seed / secret, or `{ seedKey }`, or the neurai-key 5 `getPQAddress` object).
- **ECDSA v3** (`OP_3`, `nq1r…`): a WIF string or `{ WIF }` (the neurai-key 5 `xna` / `xna-test` object). The key must be compressed; an uncompressed WIF throws.

An entry may repeat the fixed values (`authType` 1 / 2, `witnessScript: "51"`), but any other `authType`, another `witnessScript` or `functionalArgs` throw instead of being ignored. Covenant `bareScriptHint`s only apply to generic v1 prevouts.

## AuthScript rules

- the prevout starts with `OP_1`, `OP_2` or `OP_3` followed by the 32-byte commitment
- assets may append the usual asset suffix after the 34-byte AuthScript prefix (the NIP-025 non-RBF rule only covers `OP_1` asset outputs, like in the node)
- generic v1 sighash uses Neurai `SIGVERSION_AUTHSCRIPT`: BIP143-style, then `auth_type_byte` before the hash type
- strict v2 / v3 sighash uses `SIGVERSION_AUTHSCRIPT_STRICT`: the same, with the witness version byte between `nLockTime` and `auth_type_byte`. A v1-style signature is rejected on a strict input
- generic v1: default `witnessScript` is `OP_TRUE`; custom templates can be provided via `witnessScript` and `functionalArgs`. Strict v2 / v3: always `OP_TRUE`, no arguments

### Commitment reconstruction

The signer reconstructs the commitment and verifies it matches the prevout before signing. The commitment is built from:

| authType | auth_descriptor |
|----------|----------------|
| `0x00` NoAuth | `0x00` |
| `0x01` PQ | `0x01 \|\| Hash160(0x05 \|\| pqPublicKey)` |
| `0x02` Legacy | `0x02 \|\| Hash160(compressedSecp256k1PubKey)` |

`commitment = TaggedHash("NeuraiAuthScript", witness_version || auth_descriptor || SHA256(witnessScript))`

with `witness_version` 1 (generic), 2 (PQ, authType `0x01`) or 3 (ECDSA, authType `0x02`).

### Witness stacks

| authType | Witness stack |
|----------|--------------|
| `0x00` NoAuth | `[0x00, ...functionalArgs, witnessScript]` |
| `0x01` PQ | `[0x01, ml-dsa44-sig+hashType, 0x05\|\|pqPubKey, ...functionalArgs, witnessScript]` |
| `0x02` Legacy | `[0x02, ecdsaSig+hashType, compressedPubKey, ...functionalArgs, witnessScript]` |
| strict PQ v2 | `[0x01, ml-dsa44-sig+hashType, 0x05\|\|pqPubKey, 0x51]` |
| strict ECDSA v3 | `[0x02, ecdsaSig+hashType, compressedPubKey, 0x51]` |

The method returns a signed transaction hex. Broadcasting it is up to the caller.

```js
import Signer from "@neuraiproject/neurai-sign-transaction";

const raw = "...";
const UTXOs = [
  {
    address: "tnc1pyourauthscriptaddress...",
    assetName: "XNA",
    txid: "...",
    outputIndex: 0,
    script: "5120...", // OP_1 <32-byte commitment>
    satoshis: 150000,
    value: 150000,
  },
];
const privateKeys = {
  "tnc1pyourauthscriptaddress...": {
    seedKey: "aabbcc...32-byte-seed-in-hex",
  },
};
const signed = Signer.sign("xna-authscript-test", raw, UTXOs, privateKeys);
console.log(signed);
```

Mixed transaction with every address type:

```js
import NeuraiKey from "@neuraiproject/neurai-key";

const pq = NeuraiKey.getPQAddress("xna-pq-test", mnemonic, 0, 0);          // tpq1z…
const ecdsa = NeuraiKey.getAddressPair("xna-test", mnemonic, 0, 0).external; // tnq1r…

const privateKeys = {
  // Legacy P2PKH — plain WIF
  "mgRYHdMq...": "cVP9mzc...",
  // Generic AuthScript v1, PQ key (default authType 0x01)
  "tnc1ppqaddr...": { seedKey: "aabbcc..." },
  // Generic AuthScript v1, Legacy key (authType 0x02)
  "tnc1plegacyaddr...": { WIF: "cVP9mzc...", authType: 2 },
  // Generic AuthScript v1, NoAuth (authType 0x00)
  "tnc1pnoauthaddr...": { authType: 0 },
  // Strict PQ v2 and strict ECDSA v3: the neurai-key objects as they are
  [pq.address]: pq,
  [ecdsa.address]: ecdsa,
};
```

Example with an explicit custom witnessScript and functional args:

```js
const privateKeys = {
  "tnc1pyourauthscriptaddress...": {
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

VBYTES.baseTxOverheadBytes;     // 10  — version + counts + locktime
VBYTES.segwitMarkerVbytes;      // 1   — added once when any input is a witness input
VBYTES.legacyInputVbytes;       // 148 — P2PKH spend, worst-case scriptSig
VBYTES.pqInputVbytes;           // 977 — PQ v2 spend, or AuthScript v1 PQ spend with default OP_TRUE script
VBYTES.ecdsaWitnessInputVbytes; // 70  — strict ECDSA v3 spend
VBYTES.legacyOutputBytes;       // 34  — value + script length + 25-byte P2PKH script
VBYTES.witnessOutputBytes;      // 43  — value + script length + 34-byte OP_1/OP_2/OP_3 script
VBYTES.pqOutputBytes;           // 43  — deprecated alias of witnessOutputBytes
```

### `getAddressKind(address)` / `getScriptKind(scriptHex)`

Return `"p2pkh" | "authscript" | "pq" | "ecdsa" | "unknown"`, decoding the address with `neurai-create-transaction` (node HRP/version pairs: `nc`+v1, `pq`+v2, `nq`+v3) or reading the scriptPubKey prefix (asset wrappers are ignored).

### `isPQAddress(address)` / `isPQScript(scriptHex)` (deprecated)

`true` for the address / script types whose spend carries an ML-DSA-44 witness: strict PQ v2 (`pq1z…`, `5220…`) and generic AuthScript v1 (`nc1p…`, `5120…`). Since 3.0.0 `nq1…` / `tnq1…` (ECDSA witness v3, `5320…`) returns `false`. Scripts are matched including asset-wrapped variants.

### `estimateInputVbytes(utxo)` / `estimateOutputBytes(target)`

Per-component helpers. `estimateInputVbytes` prefers the UTXO's `script` and falls back to its `address` if the script is not available. `estimateOutputBytes` accepts either an address string or a `{ address }` descriptor.

```js
import {
  estimateInputVbytes,
  estimateOutputBytes,
} from "@neuraiproject/neurai-sign-transaction";

estimateInputVbytes({ script: "5120…" });        // 977
estimateInputVbytes({ script: "5320…" });        // 70
estimateInputVbytes({ address: "mgRYHdMq…" });   // 148
estimateOutputBytes("tpq1z…");                   // 43
estimateOutputBytes({ address: "mgRYHdMq…" });   // 34
```

### `estimateTransactionVbytes(inputs, outputs)`

Quick pre-build estimate when you do not yet have a `rawTx`. Sums input/output contributions plus base overhead and the segwit marker (added once when any input is PQ). Inputs may be partial UTXO-like objects (`script` and/or `address`); outputs may be address strings or `{ address }`.

```js
import { estimateTransactionVbytes } from "@neuraiproject/neurai-sign-transaction";

const vbytes = estimateTransactionVbytes(
  [{ script: "5120…" }, { address: "mgRYHdMq…" }],
  ["tnq1rchange…", "mgRYHdMqburn…"],
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

The estimator classifies each input from the UTXO's `script` and assumes the most common spend layout:

- a worst-case P2PKH `scriptSig` (DER signature + compressed pubkey), or
- a strict ECDSA v3 witness (`[0x02, 73-byte signature, 33-byte key, 0x51]`), or
- a PQ witness: strict PQ v2, or generic AuthScript v1 with the **default** `OP_TRUE` `witnessScript` and **no** `functionalArgs`.

That covers the normal flows: ordinary XNA / asset / asset-creation transactions where every input is legacy P2PKH, strict PQ / ECDSA or simple PQ AuthScript v1. For these, the returned vsize is exact within ±3 vbytes (checked against the node in `test-regtest.js`).

### Limitations

The estimator does not currently inspect the `privateKeys` map and does not accept signing hints, so it cannot distinguish:

| Case | Effect |
|------|--------|
| PQ AuthScript with custom `witnessScript` and/or `functionalArgs` (covenants) | **Under-estimates** by `len(witnessScript) - 1 + sum(len(functionalArgs))` weight units divided by 4 — risks `min relay fee not met` |
| `authType: 0x00` NoAuth (no signature, no pubkey) | Over-estimates by ≈ 925 vbytes — safe but wasteful |
| `authType: 0x02` Legacy AuthScript v1 (ECDSA inside the generic AuthScript witness, not PQ) | Over-estimates by ≈ 925 vbytes — safe but wasteful (strict ECDSA v3 inputs are sized exactly) |
| `bareScriptHint` covenant-cancel branches | Witness includes the covenant script and selector byte, neither of which the estimator can size |

If you build covenant spends, NoAuth witnesses, or Legacy AuthScript witnesses programmatically, compute the witness size yourself and add it to `VBYTES.baseTxOverheadBytes + sum(estimateOutputBytes)`. The exotic-witness path may grow a `signingHints` parameter in a future minor version.

### Exact values and bitcoinjs-lib 7

The signer uses bitcoinjs-lib **7.0.1** and keeps transaction output values and
AuthScript input values as bigint throughout signing and size estimation.
UTXO `satoshis` accepts bigint, integer text, or a safe integer number. Prefer
`satoshis`; the historical fallback `value` still denotes raw units here.
Unsafe numbers are rejected because their original precision cannot be recovered.
The Neurai monetary maximum is 2100000000000000000 raw units, rather than
Bitcoin's monetary limit. Asset quantity remains separate from the XNA nValue
used in the signature hash (zero for standard asset-wrapped outputs).

bitcoinjs v7 byte arrays are Uint8Array. This package still returns signed
transaction hex; callers do not need to decode its internal byte arrays.
