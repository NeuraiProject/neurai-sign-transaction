/**
 * neurai-key 5 network labels. The signer only needs the chain (for the WIF
 * version byte and the per-network NIP-025 rule): every mainnet label signs
 * with the mainnet WIF, every `-test` label with the testnet/regtest WIF.
 * The address type of each input comes from its prevout scriptPubKey, never
 * from the label.
 */
type SupportedNetwork = "xna" | "xna-test" | "xna-legacy" | "xna-legacy-test" | "xna-old-legacy" | "xna-pq" | "xna-pq-test" | "xna-authscript" | "xna-authscript-test";
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
 * Hint that unlocks spending of a partial-fill covenant branch. Covenant
 * UTXOs on-chain are always generic AuthScript-v1 witness wrapped (consensus
 * `IsAssetScript` only accepts 25-byte P2PKH or 34-byte AuthScript-v1
 * prefixes before an OP_XNA_ASSET wrapper), so the covenant itself lives
 * in the spend WITNESS, not in the scriptPubKey. Callers must supply the
 * covenant bytes in `covenantScriptHex`; the library verifies that
 * `taggedHash("NeuraiAuthScript", 0x01 || 0x00 || SHA256(covenantScript))`
 * matches the 32-byte program in the prevout before spending.
 *
 * `covenant-fill` needs no signature and therefore no private key. The
 * order total is NEVER taken from the caller: it is derived from the
 * prevout's transfer asset wrapper (`amountRaw`), the on-chain source of
 * truth, so the full/partial branch choice cannot be corrupted by a wrong
 * total. `amount` is the raw (satoshi-scaled) asset quantity to fill.
 */
type BareScriptSigningHint = {
    kind: "covenant-cancel-legacy";
    covenantScriptHex: string;
} | {
    kind: "covenant-cancel-pq";
    covenantScriptHex: string;
} | {
    kind: "covenant-fill";
    covenantScriptHex: string;
    amount: bigint;
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
    satoshis: number | bigint | string;
    height?: number;
    value: number | bigint | string;
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
 * Destination kind of an address or scriptPubKey, as neurai-create-transaction
 * decodes it: `p2pkh` (Base58), `authscript` (generic witness v1, `nc1p…`),
 * `pq` (strict witness v2, `pq1z…`), `ecdsa` (strict witness v3, `nq1r…`), or
 * `unknown` for anything else (invalid address, bare script, P2SH…).
 */
type AddressKind = "p2pkh" | "authscript" | "pq" | "ecdsa" | "unknown";
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
declare function getAddressKind(address: string): AddressKind;
/**
 * Destination kind of a hex scriptPubKey, ignoring a trailing asset wrapper.
 */
declare function getScriptKind(scriptHex: string): AddressKind;
/**
 * True for the addresses whose spend carries an ML-DSA-44 witness: strict PQ
 * v2 (`pq1z…` / `tpq1z…`) and generic AuthScript v1 (`nc1p…` / `tnc1p…`,
 * whose usual key is PQ).
 *
 * @deprecated Use `getAddressKind`. Since 3.0.0 `nq1…` / `tnq1…` addresses
 * are ECDSA witness v3 and return false.
 */
declare function isPQAddress(address: string): boolean;
/**
 * True for `OP_1` (generic AuthScript v1) and `OP_2` (strict PQ v2)
 * scriptPubKeys with a 32-byte program, asset-wrapped or not.
 *
 * @deprecated Use `getScriptKind`. `OP_3` (strict ECDSA v3) scripts return
 * false.
 */
declare function isPQScript(scriptHex: string): boolean;
/**
 * Estimate the vbytes contributed by spending a single UTXO. Uses the UTXO's
 * `script` if available (most accurate), otherwise falls back to its `address`.
 * Unknown prevouts are treated as legacy. Generic AuthScript v1 inputs are
 * sized as PQ spends with the default OP_TRUE witnessScript.
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

export { VBYTES, Signer as default, estimateInputVbytes, estimateOutputBytes, estimateTransactionVbytes, estimateVirtualSize, getAddressKind, getScriptKind, isPQAddress, isPQScript, sign };
export type { AddressKind, BareScriptSigningHint, IPQPrivateKeyInput, ISignDebugEvent, ISignOptions, IUTXO, PrivateKeyInput, SupportedNetwork };
