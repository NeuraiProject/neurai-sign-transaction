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
interface IUTXO {
    address: string;
    assetName: string;
    txid: string;
    outputIndex: number;
    script: string;
    satoshis: number;
    height?: number;
    value: number;
}
declare function sign(network: SupportedNetwork, rawTransactionHex: string, UTXOs: Array<IUTXO>, privateKeys: Record<string, PrivateKeyInput>, options?: ISignOptions): string;
declare const Signer: {
    sign: typeof sign;
};

export { Signer as default, sign };
export type { IPQPrivateKeyInput, ISignDebugEvent, ISignOptions, IUTXO, PrivateKeyInput, SupportedNetwork };
