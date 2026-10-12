import * as bitcoin from "bitcoinjs-lib";
import { Buffer } from "buffer";
import {
  classifyScriptPubKey,
  decodePsbt,
  encodeDestinationScript,
  getPsbtPreviousOutput,
  parseTransaction,
  serializeTransaction,
  updatePsbtInput,
  type DecodedPsbtInput,
  type PsbtInputUpdate,
  type PsbtPreviousOutput,
} from "@neuraiproject/neurai-create-transaction";
import { parsePartialFillScript, parsePartialFillScriptPQ } from "@neuraiproject/neurai-scripts";
import { sign, SIGN_HASH_TYPES } from "./shared";
import type {
  BareScriptSigningHint,
  ISignOptions,
  IUTXO,
  PrivateKeyInput,
  SignHashType,
  SupportedNetwork,
} from "./shared";

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

const OP_TRUE_HEX = "51";

function hexOf(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("hex");
}

/**
 * A partial-fill covenant is signed through its cancel branch. The covenant
 * comes from the PSBT's `witnessScript`; `sign()` checks that it hashes to
 * the previous output's AuthScript v1 commitment and that the key is the
 * covenant's cancel key.
 */
function covenantHint(input: DecodedPsbtInput, previous: PsbtPreviousOutput): BareScriptSigningHint | undefined {
  const script = input.witnessScript;
  if (script === undefined || classifyScriptPubKey(previous.scriptPubKeyHex).type !== "authscript") return undefined;
  try {
    parsePartialFillScript(script);
    return { kind: "covenant-cancel-legacy", covenantScriptHex: script };
  } catch {
    // not the ECDSA-cancel covenant
  }
  try {
    parsePartialFillScriptPQ(script);
    return { kind: "covenant-cancel-pq", covenantScriptHex: script };
  } catch {
    // not a covenant: an ordinary AuthScript v1 input, signed from its key entry
  }
  return undefined;
}

function resolveHashType(input: DecodedPsbtInput, index: number, options: ISignPsbtOptions): SignHashType {
  const requested = options.inputHashTypes?.[index] ?? options.hashType;
  if (input.sighashType === undefined) return requested ?? SIGN_HASH_TYPES.ALL;
  if (requested !== undefined && requested !== input.sighashType) {
    throw new Error(
      `PSBT input ${index} asks for sighash 0x${input.sighashType.toString(16).padStart(2, "0")}, ` +
        `but the options ask for 0x${requested.toString(16).padStart(2, "0")}`
    );
  }
  // sign() rejects types it does not support, or does not support for the input's family.
  return input.sighashType as SignHashType;
}

function requestedInputs(options: ISignPsbtOptions, inputCount: number): ISignPsbtInput[] {
  if (!options || !Array.isArray(options.inputs) || options.inputs.length === 0) {
    throw new Error("signPsbt: options.inputs must list the inputs to sign");
  }
  const seen = new Set<number>();
  for (const { index, address } of options.inputs) {
    if (!Number.isInteger(index) || index < 0 || index >= inputCount) {
      throw new Error(`signPsbt: the PSBT has no input ${index}`);
    }
    if (seen.has(index)) throw new Error(`signPsbt: input ${index} is listed twice`);
    if (typeof address !== "string" || address.length === 0) throw new Error(`signPsbt: input ${index} needs an address`);
    seen.add(index);
  }
  for (const key of Object.keys(options.inputHashTypes ?? {})) {
    if (!seen.has(Number(key))) throw new Error(`signPsbt: inputHashTypes[${key}] names an input that is not being signed`);
  }
  return options.inputs;
}

/** What one signed input adds to the PSBT. */
function signedFields(
  signedTxHex: string,
  index: number,
  previous: PsbtPreviousOutput,
  hint: BareScriptSigningHint | undefined
): PsbtInputUpdate {
  const signed = parseTransaction(signedTxHex).inputs[index];
  const witness = signed.witness ?? [];
  const kind = classifyScriptPubKey(previous.scriptPubKeyHex);
  if (hint || kind.type === "authscript" || kind.type === "pq") {
    // The signer completes these inputs itself (covenant cancel branch, PQ, generic AuthScript).
    if (witness.length === 0) throw new Error(`PSBT input ${index} was not signed`);
    return { finalScriptWitness: witness };
  }
  if (kind.type === "ecdsa") {
    // [authType 0x02, signature, pubkey, OP_TRUE]
    if (witness.length !== 4 || witness[3] !== OP_TRUE_HEX) throw new Error(`PSBT input ${index} was not signed`);
    return { partialSig: [{ pubkeyHex: witness[2], signatureHex: witness[1] }] };
  }
  const chunks = bitcoin.script.decompile(Buffer.from(signed.scriptSigHex, "hex"));
  if (!chunks || chunks.length !== 2 || typeof chunks[0] === "number" || typeof chunks[1] === "number") {
    throw new Error(`PSBT input ${index} was not signed`);
  }
  return { partialSig: [{ signatureHex: hexOf(chunks[0]), pubkeyHex: hexOf(chunks[1]) }] };
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
export function signPsbt(
  network: SupportedNetwork,
  psbt: string,
  privateKeys: Record<string, PrivateKeyInput>,
  options: ISignPsbtOptions
): string {
  const decoded = decodePsbt(psbt);
  const inputs = requestedInputs(options, decoded.inputs.length);
  const utxos: IUTXO[] = [];
  const inputHashTypes: Record<number, SignHashType> = {};
  const previousOutputs = new Map<number, { previous: PsbtPreviousOutput; hint?: BareScriptSigningHint }>();

  for (const { index, address } of inputs) {
    const input = decoded.inputs[index];
    if (input.finalScriptSig !== undefined || input.finalScriptWitness !== undefined) {
      throw new Error(`PSBT input ${index} is already finalized`);
    }
    if (input.previousTx === undefined) {
      throw new Error(`PSBT input ${index} has no previous transaction: the signer needs it to check what it spends`);
    }
    if (privateKeys[address] === undefined) throw new Error(`signPsbt: no private key for ${address} (input ${index})`);
    const previous = getPsbtPreviousOutput(decoded, index);
    const hint = covenantHint(input, previous);
    if (!hint) {
      const paidTo = Buffer.from(encodeDestinationScript(address)).toString("hex");
      if (!previous.scriptPubKeyHex.startsWith(paidTo)) throw new Error(`PSBT input ${index} is not paid to ${address}`);
    }
    inputHashTypes[index] = resolveHashType(input, index, options);
    const outpoint = decoded.unsignedTx.inputs[index];
    utxos.push({
      address,
      assetName: "",
      txid: outpoint.txid,
      outputIndex: outpoint.vout,
      script: previous.scriptPubKeyHex,
      satoshis: previous.valueSats,
      value: previous.valueSats,
      ...(hint ? { bareScriptHint: hint } : {}),
    });
    previousOutputs.set(index, { previous, hint });
  }

  const signedTxHex = sign(
    network,
    serializeTransaction(decoded.unsignedTx, { includeWitness: false }),
    utxos,
    privateKeys,
    { debug: options.debug, inputHashTypes }
  );

  let result = psbt;
  for (const { index } of inputs) {
    const { previous, hint } = previousOutputs.get(index)!;
    result = updatePsbtInput(result, index, signedFields(signedTxHex, index, previous, hint));
  }
  return result;
}
