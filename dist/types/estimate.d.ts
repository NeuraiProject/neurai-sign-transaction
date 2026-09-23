import type { IUTXO, SupportedNetwork } from "./shared";
/**
 * Destination kind of an address or scriptPubKey, as neurai-create-transaction
 * decodes it: `p2pkh` (Base58), `authscript` (generic witness v1, `nc1p…`),
 * `pq` (strict witness v2, `pq1z…`), `ecdsa` (strict witness v3, `nq1r…`), or
 * `unknown` for anything else (invalid address, bare script, P2SH…).
 */
export type AddressKind = "p2pkh" | "authscript" | "pq" | "ecdsa" | "unknown";
/**
 * Per-component byte sizes used across the Neurai stack for fee estimation.
 *
 * `*Vbytes` values are weight-adjusted (the unit miners actually use). `*Bytes`
 * values are raw serialized bytes (only useful for non-witness components).
 */
export declare const VBYTES: {
    /** Raw transaction overhead: version (4) + in-count varint (1) + out-count varint (1) + locktime (4). */
    readonly baseTxOverheadBytes: 10;
    /**
     * Extra weight contributed by the segwit marker + flag bytes when the
     * transaction has at least one PQ input. (2 bytes / 4 weight units = 0.5,
     * rounded up to 1 vbyte to be safe.)
     */
    readonly segwitMarkerVbytes: 1;
    /** vbytes contributed by a typical legacy P2PKH input (worst-case scriptSig). */
    readonly legacyInputVbytes: 148;
    /**
     * vbytes contributed by a PQ input: strict PQ witness v2, or generic
     * AuthScript v1 with a PQ key and the default OP_TRUE witnessScript.
     */
    readonly pqInputVbytes: 977;
    /**
     * vbytes contributed by a strict ECDSA witness v3 input (41 non-witness
     * bytes + a 113-byte worst-case witness = 277 weight units, rounded up).
     */
    readonly ecdsaWitnessInputVbytes: 70;
    /** Raw bytes of a legacy P2PKH output: 8-byte value + 1-byte script length + 25-byte scriptPubKey. */
    readonly legacyOutputBytes: 34;
    /**
     * Raw bytes of any AuthScript output (`OP_1`/`OP_2`/`OP_3` + 32-byte
     * program): 8-byte value + 1-byte script length + 34-byte scriptPubKey.
     */
    readonly witnessOutputBytes: 43;
    /** @deprecated Same as `witnessOutputBytes`, which covers every witness version. */
    readonly pqOutputBytes: 43;
};
/** Destination kind of an address; `unknown` when it does not decode. */
export declare function getAddressKind(address: string): AddressKind;
/**
 * Destination kind of a hex scriptPubKey, ignoring a trailing asset wrapper.
 */
export declare function getScriptKind(scriptHex: string): AddressKind;
/**
 * True for the addresses whose spend carries an ML-DSA-44 witness: strict PQ
 * v2 (`pq1z…` / `tpq1z…`) and generic AuthScript v1 (`nc1p…` / `tnc1p…`,
 * whose usual key is PQ).
 *
 * @deprecated Use `getAddressKind`. Since 3.0.0 `nq1…` / `tnq1…` addresses
 * are ECDSA witness v3 and return false.
 */
export declare function isPQAddress(address: string): boolean;
/**
 * True for `OP_1` (generic AuthScript v1) and `OP_2` (strict PQ v2)
 * scriptPubKeys with a 32-byte program, asset-wrapped or not.
 *
 * @deprecated Use `getScriptKind`. `OP_3` (strict ECDSA v3) scripts return
 * false.
 */
export declare function isPQScript(scriptHex: string): boolean;
/**
 * Estimate the vbytes contributed by spending a single UTXO. Uses the UTXO's
 * `script` if available (most accurate), otherwise falls back to its `address`.
 * Unknown prevouts are treated as legacy. Generic AuthScript v1 inputs are
 * sized as PQ spends with the default OP_TRUE witnessScript.
 */
export declare function estimateInputVbytes(utxo: Pick<IUTXO, "script" | "address"> | {
    script?: string;
    address?: string;
}): number;
/**
 * Estimate the raw bytes contributed by an output, given either its address or
 * a `{ address }` descriptor. Outputs are non-witness, so vbytes equal bytes.
 */
export declare function estimateOutputBytes(target: string | {
    address?: string;
}): number;
/**
 * Quick fee-estimation helper. Sums the per-input/per-output contributions for
 * an unsigned transaction described by its inputs (UTXO-like) and outputs
 * (address strings or `{address}`). Includes base overhead and segwit marker.
 *
 * For an exact size, prefer {@link estimateVirtualSize}.
 */
export declare function estimateTransactionVbytes(inputs: ReadonlyArray<Pick<IUTXO, "script" | "address"> | {
    script?: string;
    address?: string;
}>, outputs: ReadonlyArray<string | {
    address?: string;
}>): number;
/**
 * Compute the post-signing virtual size of an unsigned raw transaction by
 * filling each input with a worst-case dummy scriptSig/witness based on the
 * provided UTXO set. Returns vbytes as bitcoinjs-lib's `tx.virtualSize()`.
 *
 * No actual signing is performed; this is safe to call cheaply (no PQ key
 * material involved). Use this to compute an exact fee before signing.
 *
 * The `network` parameter is accepted for API symmetry with `sign()` but is
 * not currently required (script types are inferred from the UTXO scripts).
 */
export declare function estimateVirtualSize(_network: SupportedNetwork, rawTransactionHex: string, utxos: ReadonlyArray<IUTXO>): number;
