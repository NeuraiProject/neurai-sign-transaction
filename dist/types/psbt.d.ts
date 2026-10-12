import type { ISignOptions, PrivateKeyInput, SignHashType, SupportedNetwork } from "./shared";
export interface ISignPsbtInput {
    /** Index of the input in the PSBT's transaction. */
    index: number;
    /**
     * Address whose key signs (key of `privateKeys`). It must be the address
     * the previous output pays to, except for a covenant cancel (input with a
     * partial-fill `witnessScript`), where it is the seller's wallet address.
     */
    address: string;
}
export interface ISignPsbtOptions {
    /** Inputs to sign. Every other input is left as it is. */
    inputs: ISignPsbtInput[];
    /** Sighash for inputs whose PSBT entry has no `sighashType`. Defaults to ALL. */
    hashType?: SignHashType;
    /** Per-input sighash, indexed by input position; must name inputs being signed. */
    inputHashTypes?: Record<number, SignHashType>;
    debug?: ISignOptions["debug"];
}
/**
 * Sign inputs of a PSBT (Neurai profile, see neurai-create-transaction).
 *
 * Every input to sign must carry its previous transaction. P2PKH and strict
 * ECDSA (AuthScript v3) inputs get a `partialSig` for the finalizer; inputs
 * the signer completes itself — a partial-fill covenant's cancel branch
 * (`witnessScript`), PQ (AuthScript v2) and generic AuthScript v1 — get a
 * `finalScriptWitness`. An input's `sighashType` is honoured; options that
 * contradict it are an error. Returns the PSBT as base64.
 */
export declare function signPsbt(network: SupportedNetwork, psbt: string, privateKeys: Record<string, PrivateKeyInput>, options: ISignPsbtOptions): string;
