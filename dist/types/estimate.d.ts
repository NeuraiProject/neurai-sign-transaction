import type { IUTXO, SupportedNetwork } from "./shared";
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
    /** vbytes contributed by a typical PQ AuthScript input with a default OP_TRUE witnessScript. */
    readonly pqInputVbytes: 977;
    /** Raw bytes of a legacy P2PKH output: 8-byte value + 1-byte script length + 25-byte scriptPubKey. */
    readonly legacyOutputBytes: 34;
    /** Raw bytes of an AuthScript-v1 output: 8-byte value + 1-byte script length + 34-byte scriptPubKey. */
    readonly pqOutputBytes: 43;
};
/**
 * Returns true when the address belongs to a Neurai PQ (AuthScript v1) bech32
 * destination. PQ HRPs are `nq` (mainnet) and `tnq` (testnet).
 */
export declare function isPQAddress(address: string): boolean;
/**
 * Returns true when the hex-encoded scriptPubKey is an AuthScript-v1 output
 * (witness v1 with a 32-byte program). Asset-wrapped variants share the same
 * 34-byte prefix so they are also detected as PQ.
 */
export declare function isPQScript(scriptHex: string): boolean;
/**
 * Estimate the vbytes contributed by spending a single UTXO. Uses the UTXO's
 * `script` if available (most accurate), otherwise falls back to its `address`.
 * Unknown prevouts are treated as legacy.
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
