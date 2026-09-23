/**
 * neurai-key 5 network labels. The signer only needs the chain (for the WIF
 * version byte and the per-network NIP-025 rule): every mainnet label signs
 * with the mainnet WIF, every `-test` label with the testnet/regtest WIF.
 * The address type of each input comes from its prevout scriptPubKey, never
 * from the label.
 */
export type SupportedNetwork = "xna" | "xna-test" | "xna-legacy" | "xna-legacy-test" | "xna-old-legacy" | "xna-pq" | "xna-pq-test" | "xna-authscript" | "xna-authscript-test";
export type PrivateKeyInput = string | IPQPrivateKeyInput;
export interface IPQPrivateKeyInput {
    WIF?: string;
    seedKey?: string;
    privateKey?: string;
    secretKey?: string;
    publicKey?: string;
    authType?: number;
    witnessScript?: string;
    functionalArgs?: string[];
}
export interface ISignDebugEvent {
    step: string;
    [key: string]: unknown;
}
export interface ISignOptions {
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
export type BareScriptSigningHint = {
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
export interface IUTXO {
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
export declare function sign(network: SupportedNetwork, rawTransactionHex: string, UTXOs: Array<IUTXO>, privateKeys: Record<string, PrivateKeyInput>, options?: ISignOptions): string;
declare const Signer: {
    sign: typeof sign;
};
export default Signer;
