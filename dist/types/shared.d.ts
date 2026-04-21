export type SupportedNetwork = "xna" | "xna-test" | "xna-legacy" | "xna-legacy-test" | "xna-pq" | "xna-pq-test";
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
 * Hint that unlocks signing of a bare-script prevout that is not a
 * recognised legacy P2PKH nor a Neurai AuthScript witness v1. The library
 * only honours hints for the two partial-fill covenant cancel branches —
 * every other shape is still rejected.
 */
export type BareScriptSigningHint = {
    kind: "covenant-cancel-legacy";
} | {
    kind: "covenant-cancel-pq";
    txHashSelector: number;
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
    satoshis: number;
    height?: number;
    value: number;
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
