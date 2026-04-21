/**
 * JavaScript mirror of Neurai's `OP_TXHASH(selector)` consensus opcode.
 *
 * The algorithm follows the BIP143-style convention used by Bitcoin Core:
 * the "aggregate" selector bits (`INPUT_PREVOUTS`, `INPUT_SEQUENCES`,
 * `OUTPUTS`) are materialised as SHA-256d sub-hashes of the concatenated
 * per-input / per-output fields; the "scalar" bits contribute their raw
 * little-endian serialisation. The outer `buffer` is then SHA-256d'd to
 * produce the 32-byte value that the consensus interpreter pushes onto the
 * stack when `OP_TXHASH` runs.
 *
 * Authoritative reference: `blockchain/Neurai/src/script/interpreter.cpp`
 * (`case OP_TXHASH`). The plan that drives this file — with byte-exact
 * layout table per bit — is
 * `lib/plan-frente-b-covenant-cancel-v2.md §3.6`.
 *
 * Invariant: the bits are consumed in **ascending numeric order** (0x01,
 * 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80). Changing the order here —
 * even for bits that would otherwise commute — produces a different final
 * digest and therefore an invalid signature.
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
export declare const TXHASH_ALL = 255;
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
}
/**
 * Compute the 32-byte value consensus would push via `OP_TXHASH(selector)`
 * when the current input being validated is at `inIndex`.
 *
 * `selector` is an 8-bit mask. Bits are processed in ascending numeric
 * order; each set bit contributes its payload (raw scalar or BIP143-style
 * SHA-256d sub-hash) to the outer preimage, which is then SHA-256d'd.
 */
export declare function computeOpTxHash(tx: bitcoin.Transaction, selector: number, inIndex: number, options?: ComputeOpTxHashOptions): Buffer;
export { AGGREGATE_BITS };
