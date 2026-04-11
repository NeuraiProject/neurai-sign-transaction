export type SupportedNetwork = "xna" | "xna-test" | "xna-legacy" | "xna-legacy-test" | "xna-pq" | "xna-pq-test";
export type PrivateKeyInput = string | IPQPrivateKeyInput;
export interface IPQPrivateKeyInput {
    WIF?: string;
    seedKey?: string;
    privateKey?: string;
    secretKey?: string;
    publicKey?: string;
}
export interface ISignDebugEvent {
    step: string;
    [key: string]: unknown;
}
export interface ISignOptions {
    debug?: boolean | ((event: ISignDebugEvent) => void);
}
export interface IUTXO {
    address: string;
    assetName: string;
    txid: string;
    outputIndex: number;
    script: string;
    satoshis: number;
    height?: number;
    value: number;
}
export declare function sign(network: SupportedNetwork, rawTransactionHex: string, UTXOs: Array<IUTXO>, privateKeys: Record<string, PrivateKeyInput>, options?: ISignOptions): string;
declare const Signer: {
    sign: typeof sign;
};
export default Signer;
