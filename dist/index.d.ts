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

export { Signer as default, sign };
export type { BareScriptSigningHint, IPQPrivateKeyInput, ISignDebugEvent, ISignOptions, IUTXO, PrivateKeyInput, SupportedNetwork };
