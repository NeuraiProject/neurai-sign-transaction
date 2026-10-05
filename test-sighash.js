// Independent sponsor-digest oracle and public-package tests. TEST keys only.
const bitcoin = require("bitcoinjs-lib");
const CT = require("@neuraiproject/neurai-create-transaction");
const Key = require("@neuraiproject/neurai-key");
const ecc = require("@bitcoinerlab/secp256k1");
const { createHash } = require("node:crypto");
const fs = require("node:fs");
const vm = require("node:vm");
const Signer = require("./dist/index.cjs");
test("public mode constants cannot be mutated to change signing defaults", () => {
  expect(Object.isFrozen(Signer.SIGN_HASH_TYPES)).toBe(true);
  expect(() => Object.defineProperty(Signer.SIGN_HASH_TYPES, "ALL", { value: 0x83 })).toThrow(TypeError);
  expect(Signer.SIGN_HASH_TYPES.ALL).toBe(1);
});
const MNEMONIC = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
const KEYS = {
  legacy: Key.getAddressPair("xna-legacy-test", MNEMONIC, 0, 0).external,
  pq: Key.getPQAddress("xna-pq-test", MNEMONIC, 0, 0),
  ecdsa: Key.getAddressByPath("xna-test", Key.getHDKey("xna-test", MNEMONIC), "m/84'/1'/0'/0/0"),
};
const SPKS = {
  legacy: Buffer.from(bitcoin.payments.p2pkh({ pubkey: Buffer.from(KEYS.legacy.publicKey, "hex") }).output).toString("hex"),
  pq: "5220" + KEYS.pq.commitment,
  ecdsa: "5320" + KEYS.ecdsa.commitment,
};
const cat = (...xs) => Buffer.concat(xs);
const sha = x => createHash("sha256").update(x).digest();
const H = x => sha(sha(x));
function u32(n) { const b = Buffer.alloc(4); b.writeUInt32LE(n); return b; }
function u64(n) { const b = Buffer.alloc(8); b.writeBigUInt64LE(BigInt(n)); return b; }
function compact(n) { return n < 253 ? Buffer.from([n]) : cat(Buffer.from([253]), Buffer.from([n & 255, n >> 8])); }
const point = i => cat(Buffer.from(i.txid, "hex").reverse(), u32(i.vout));
const out = o => { const s = Buffer.from(o.scriptPubKeyHex, "hex"); return cat(u64(o.valueSats), compact(s.length), s); };

function template(version = 3, refs = [], index = 2) {
  return {
    version, locktime: 37, vrefin: refs,
    inputs: Array.from({ length: index + 1 }, (_, i) => ({ txid: (i + 1).toString(16).padStart(2, "0").repeat(32), vout: i, sequence: 0xffffffff, scriptSigHex: "" })),
    outputs: Array.from({ length: index + 1 }, () => ({ valueSats: 190000000n, scriptPubKeyHex: SPKS.legacy })),
  };
}
function oracle(tx, index, family, script, amount, type) {
  const refs = cat(...tx.vrefin.map(point));
  const single = type === 0x83;
  if (family === "legacy") {
    const ins = single ? [tx.inputs[index]] : tx.inputs;
    const parts = [u32(tx.version), compact(ins.length)];
    for (const i of ins) {
      const code = i === tx.inputs[index] ? Buffer.from(script, "hex") : Buffer.alloc(0);
      parts.push(point(i), compact(code.length), code, u32(i.sequence));
    }
    parts.push(compact(single ? index + 1 : tx.outputs.length));
    for (let j = 0; j < (single ? index + 1 : tx.outputs.length); j++)
      parts.push(single && j !== index ? cat(Buffer.alloc(8, 255), Buffer.from([0])) : out(tx.outputs[j]));
    if (tx.version === 3) parts.push(compact(tx.vrefin.length), refs);
    return H(cat(...parts, u32(tx.locktime), u32(type)));
  }
  const i = tx.inputs[index];
  const prev = single ? Buffer.alloc(32) : H(cat(...tx.inputs.map(point)));
  const seq = single ? Buffer.alloc(32) : H(cat(...tx.inputs.map(i => u32(i.sequence))));
  const outs = H(single ? out(tx.outputs[index]) : cat(...tx.outputs.map(out)));
  return H(cat(u32(tx.version), prev, seq, point(i), Buffer.from([1, 0x51]), u64(amount), u32(i.sequence), outs,
    ...(tx.version === 3 ? [H(refs)] : []), u32(tx.locktime), Buffer.from(family === "pq" ? [2, 1] : [3, 2]), u32(type)));
}
function signed(tx, family, options = {}, api = Signer) {
  const index = tx.inputs.length - 1, i = tx.inputs[index], key = KEYS[family];
  const events = [];
  const utxo = { address: key.address, txid: i.txid, outputIndex: i.vout, assetName: "XNA", script: SPKS[family], value: 200000000n, satoshis: 200000000n };
  const wire = api.sign("xna-test", CT.serializeTransaction(tx), [utxo], { [key.address]: key }, { ...options, debug: e => events.push(e) });
  const parsed = CT.parseTransaction(wire), input = parsed.inputs[index];
  const chunks = input.witness?.length ? input.witness.map(x => Buffer.from(x, "hex")) : bitcoin.script.decompile(Buffer.from(input.scriptSigHex, "hex"));
  const sig = Buffer.from(chunks[input.witness?.length ? 1 : 0]);
  const pub = Buffer.from(chunks[input.witness?.length ? 2 : 1]);
  return { wire, parsed, sig, pub, digest: events.find(e => e.i === index && e.sighashHex)?.sighashHex };
}

describe.each(["legacy", "pq", "ecdsa"])("public sponsor API: %s", family => {
  test.each([2, 3])("default ALL and opt-in 0x83 verify with tx v%s", async version => {
    const { ml_dsa44 } = await import("@noble/post-quantum/ml-dsa.js");
    const tx = template(version, version === 3 ? [{ txid: "ef".repeat(32), vout: 9 }] : []);
    for (const type of [1, 0x83]) {
      const result = signed(tx, family, type === 1 ? {} : { inputHashTypes: { 2: type } });
      const digest = oracle(tx, 2, family, SPKS[family], 200000000n, type);
      expect(result.digest).toBe(digest.toString("hex"));
      expect(result.sig.at(-1)).toBe(type);
      const verified = family === "pq"
        ? ml_dsa44.verify(result.sig.subarray(0, -1), digest, result.pub.subarray(1))
        : ecc.verify(digest, result.pub, bitcoin.script.signature.decode(result.sig).signature);
      expect(verified).toBe(true);
      expect(result.parsed.vrefin).toEqual(tx.vrefin);
    }
    expect(signed(tx, family).wire).toBe(signed(tx, family, { hashType: 1 }).wire);
    expect(signed(tx, family, { hashType: 0x83, inputHashTypes: { 0: 1, 1: 1 } }).wire).toBe(signed(tx, family, { inputHashTypes: { 2: 0x83 } }).wire);
    expect(signed(template(version, [], 0), family, { hashType: 0x83 }).sig.at(-1)).toBe(0x83);
  });
  test("references bind even with ANYONECANPAY, including empty and CompactSize boundary", () => {
    for (const count of [0, 1, 253]) {
      const refs = Array.from({ length: count }, (_, i) => ({ txid: "ef".repeat(32), vout: i }));
      const tx = template(3, refs);
      expect(signed(tx, family, { inputHashTypes: { 2: 0x83 } }).digest).toBe(oracle(tx, 2, family, SPKS[family], 200000000n, 0x83).toString("hex"));
    }
  });
  test("paired output is required, even when a signature/key is missing", () => {
    const tx = template(); tx.outputs.pop();
    expect(() => signed(tx, family, { inputHashTypes: { 2: 0x83 } })).toThrow(/SINGLE requires a paired output/);
    expect(() => Signer.sign("xna-test", CT.serializeTransaction(tx), [], {}, { inputHashTypes: { 2: 0x83 } })).toThrow(/paired output/);
  });
});

test("Legacy SINGLE serialization handles a CompactSize output-count boundary", () => {
  const tx = template(3, [], 253);
  expect(signed(tx, "legacy", { inputHashTypes: { 253: 0x83 } }).digest).toBe(oracle(tx, 253, "legacy", SPKS.legacy, 200000000n, 0x83).toString("hex"));
});

test("input overrides leave other signatures at ALL and preserve supplied witnesses", () => {
  const tx = template();
  tx.inputs[0].witness = ["00", "51"];
  const key = KEYS.legacy;
  const utxos = [1, 2].map(i => ({ address: key.address, assetName: "XNA", txid: tx.inputs[i].txid, outputIndex: i, script: SPKS.legacy, value: 200000000n, satoshis: 200000000n }));
  const parsed = CT.parseTransaction(Signer.sign("xna-test", CT.serializeTransaction(tx), utxos, { [key.address]: key }, { debug: false, inputHashTypes: { 2: 0x83 } }));
  expect(parsed.inputs[0].witness).toEqual(["00", "51"]);
  for (const [i, type] of [[1, 1], [2, 0x83]]) {
    const sig = bitcoin.script.decompile(Buffer.from(parsed.inputs[i].scriptSigHex, "hex"))[0];
    expect(bitcoin.script.signature.decode(sig).hashType).toBe(type);
  }
});

test.each([null, "131", 0, 2, 3, 0x81, 0x82, 0x183, -1, 1.5, NaN])("rejects unsupported hashType %s", type => {
  expect(() => signed(template(), "legacy", { hashType: type })).toThrow(/hashType must/);
  expect(() => signed(template(), "legacy", { inputHashTypes: { 2: type } })).toThrow(/hashType must/);
});
test.each([null, [], "2", { "02": 0x83 }, { "-1": 0x83 }, { "1.5": 0x83 }, { "3": 0x83 }, { "NaN": 0x83 }])("rejects invalid inputHashTypes %j", overrides => {
  expect(() => signed(template(), "legacy", { inputHashTypes: overrides })).toThrow(/inputHashTypes/);
});
test("advanced signing cannot silently skip a missing UTXO or key", () => {
  const tx = template(), raw = CT.serializeTransaction(tx);
  expect(() => Signer.sign("xna-test", raw, [], {}, { inputHashTypes: { 2: 0x83 } })).toThrow(/prevout UTXO/);
  const utxo = { address: "missing", assetName: "XNA", txid: tx.inputs[2].txid, outputIndex: 2, script: SPKS.legacy, value: 200000000, satoshis: 200000000 };
  expect(() => Signer.sign("xna-test", raw, [utxo], {}, { inputHashTypes: { 2: 0x83 } })).toThrow(/private key/);
  utxo.script = "5120" + "42".repeat(32);
  expect(() => Signer.sign("xna-test", raw, [utxo], { missing: KEYS.legacy }, { inputHashTypes: { 2: 0x83 } })).toThrow(/only supports P2PKH and strict/);
});

test("ESM, browser ESM and global bundle expose and sign with the same API", async () => {
  const esm = await import("./dist/index.mjs");
  const browser = await import("./dist/browser.mjs");
  const context = { console, TextEncoder, TextDecoder, Uint8Array, ArrayBuffer };
  vm.createContext(context); vm.runInContext(fs.readFileSync("./dist/NeuraiSignTransaction.global.js", "utf8"), context);
  for (const api of [esm, browser, context.NeuraiSignTransaction]) {
    expect(api.SIGN_HASH_TYPES.SINGLE_ANYONECANPAY).toBe(0x83);
    for (const family of ["legacy", "pq", "ecdsa"]) {
      const result = signed(template(), family, { inputHashTypes: { 2: 0x83 } }, api);
      expect(result.digest).toBe(oracle(template(), 2, family, SPKS[family], 200000000n, 0x83).toString("hex"));
    }
  }
});
