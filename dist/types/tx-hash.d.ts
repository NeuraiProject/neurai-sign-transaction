/**
 * NIP-042 mirror of Neurai's OP_TXHASH. The script pushes a two-byte LE mask;
 * the digest is SHA256(tag || tag || maskLE16 || selected fields), with
 * tag = SHA256("NeuraiTxHash"). Aggregate fields are double-SHA256 hashes.
 * Fields are serialized in ascending mask-bit order, including vrefin at bit 8.
 * Authority: Neurai-DePIN/src/script/interpreter.cpp, GetTxFieldHash().
 */
import * as bitcoin from "bitcoinjs-lib";
import { Buffer } from "buffer";
export declare const TXHASH_VERSION = 1;
export declare const TXHASH_LOCKTIME = 2;
export declare const TXHASH_INPUT_PREVOUTS = 4;
export declare const TXHASH_INPUT_SEQUENCES = 8;
export declare const TXHASH_OUTPUTS = 16;
export declare const TXHASH_CURRENT_PREVOUT = 32;
export declare const TXHASH_CURRENT_SEQUENCE = 64;
export declare const TXHASH_CURRENT_INDEX = 128;
export declare const TXHASH_REFINPUTS = 256;
export declare const TXHASH_ALL = 511;
/**
 * Bits (in ascending numeric order) whose contribution is a SHA-256d
 * sub-hash rather than raw bytes.
 */
declare const AGGREGATE_BITS: Set<number>;
export interface ComputeOpTxHashOptions {
    /**
     * Capture the pre-outer-hash preimage buffer for diagnostics. When
     * callers pass an array, it receives `{ bit, contribution }` entries in
     * processing order. Useful for debugging a consensus mismatch without
     * re-instrumenting the library.
     */
    diagnostics?: Array<{
        bit: number;
        contribution: Buffer;
    }>;
    /** Raw concatenation of 36-byte vrefin outpoints for a v3 transaction. */
    refInputs?: Buffer;
}
/**
 * Compute the 32-byte value consensus would push via `OP_TXHASH(selector)`
 * when the current input being validated is at `inIndex`.
 *
 * `selector` is a nonzero nine-bit mask. Consensus requires its two-byte LE
 * encoding on the script stack. `options.refInputs` supplies the serialized
 * vrefin outpoints for bit 8; non-v3 transactions contribute hash256(empty).
 */
export declare function computeOpTxHash(tx: bitcoin.Transaction, selector: number, inIndex: number, options?: ComputeOpTxHashOptions): Buffer;
export { AGGREGATE_BITS };
