type SupportedNetwork = "xna" | "xna-test" | "xna-legacy" | "xna-legacy-test" | "xna-pq" | "xna-pq-test";
type PrivateKeyInput = string | IPQPrivateKeyInput;
interface IPQPrivateKeyInput {
    WIF?: string;
    seedKey?: string;
    privateKey?: string;
    secretKey?: string;
    publicKey?: string;
    authType?: number;
    witnessScript?: string;
    functionalArgs?: string[];
}
interface ISignDebugEvent {
    step: string;
    [key: string]: unknown;
}
interface ISignOptions {
    debug?: boolean | ((event: ISignDebugEvent) => void);
}
/**
 * Hint that unlocks signing of a partial-fill covenant cancel. Covenant
 * UTXOs on-chain are always AuthScript-v1 witness wrapped (consensus
 * `IsAssetScript` only accepts 25-byte P2PKH or 34-byte AuthScript-v1
 * prefixes before an OP_XNA_ASSET wrapper), so the covenant itself lives
 * in the spend WITNESS, not in the scriptPubKey. Callers must supply the
 * covenant bytes in `covenantScriptHex`; the library verifies that
 * `taggedHash("NeuraiAuthScript", 0x01 || 0x00 || SHA256(covenantScript))`
 * matches the 32-byte program in the prevout before signing.
 */
type BareScriptSigningHint = {
    kind: "covenant-cancel-legacy";
    covenantScriptHex: string;
} | {
    kind: "covenant-cancel-pq";
    covenantScriptHex: string;
};
interface IUTXO {
    address: string;
    assetName: string;
    txid: string;
    outputIndex: number;
    /**
     * scriptPubKey of the prevout as hex. For asset UTXOs this includes the
     * trailing `OP_XNA_ASSET <pushdata(payload)> OP_DROP` wrapper; the
     * library strips the wrapper internally when a covenant-cancel hint is
     * supplied.
     */
    script: string;
    satoshis: number;
    height?: number;
    value: number;
    /**
     * Optional signing hint for non-standard prevouts (currently: partial-fill
     * covenant cancel branches). Ignored for recognised legacy/PQ prevouts.
     */
    bareScriptHint?: BareScriptSigningHint;
}
declare function sign(network: SupportedNetwork, rawTransactionHex: string, UTXOs: Array<IUTXO>, privateKeys: Record<string, PrivateKeyInput>, options?: ISignOptions): string;
declare const Signer: {
    sign: typeof sign;
};

/**
 * Per-component byte sizes used across the Neurai stack for fee estimation.
 *
 * `*Vbytes` values are weight-adjusted (the unit miners actually use). `*Bytes`
 * values are raw serialized bytes (only useful for non-witness components).
 */
declare const VBYTES: {
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
declare function isPQAddress(address: string): boolean;
/**
 * Returns true when the hex-encoded scriptPubKey is an AuthScript-v1 output
 * (witness v1 with a 32-byte program). Asset-wrapped variants share the same
 * 34-byte prefix so they are also detected as PQ.
 */
declare function isPQScript(scriptHex: string): boolean;
/**
 * Estimate the vbytes contributed by spending a single UTXO. Uses the UTXO's
 * `script` if available (most accurate), otherwise falls back to its `address`.
 * Unknown prevouts are treated as legacy.
 */
declare function estimateInputVbytes(utxo: Pick<IUTXO, "script" | "address"> | {
    script?: string;
    address?: string;
}): number;
/**
 * Estimate the raw bytes contributed by an output, given either its address or
 * a `{ address }` descriptor. Outputs are non-witness, so vbytes equal bytes.
 */
declare function estimateOutputBytes(target: string | {
    address?: string;
}): number;
/**
 * Quick fee-estimation helper. Sums the per-input/per-output contributions for
 * an unsigned transaction described by its inputs (UTXO-like) and outputs
 * (address strings or `{address}`). Includes base overhead and segwit marker.
 *
 * For an exact size, prefer {@link estimateVirtualSize}.
 */
declare function estimateTransactionVbytes(inputs: ReadonlyArray<Pick<IUTXO, "script" | "address"> | {
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
declare function estimateVirtualSize(_network: SupportedNetwork, rawTransactionHex: string, utxos: ReadonlyArray<IUTXO>): number;

export { VBYTES, Signer as default, estimateInputVbytes, estimateOutputBytes, estimateTransactionVbytes, estimateVirtualSize, isPQAddress, isPQScript, sign };
export type { BareScriptSigningHint, IPQPrivateKeyInput, ISignDebugEvent, ISignOptions, IUTXO, PrivateKeyInput, SupportedNetwork };
