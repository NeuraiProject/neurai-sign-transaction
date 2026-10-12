// signPsbt against sign(): the same inputs signed through a PSBT (Neurai
// profile, neurai-create-transaction) and finalized must give exactly the
// bytes sign() gives for the raw transaction. ECDSA (RFC 6979) and ML-DSA-44
// (no extra entropy) are deterministic, so any difference is a bug. Node
// acceptance of PSBT-signed transactions is covered by test-regtest.js.
const bitcoin = require("bitcoinjs-lib");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const NeuraiKey = require("@neuraiproject/neurai-key");
const CT = require("@neuraiproject/neurai-create-transaction");
const Scripts = require("@neuraiproject/neurai-scripts");
const Signer = require("./dist/index.cjs");

const MNEMONIC = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
const W = {
  legacy: NeuraiKey.getAddressPair("xna-legacy-test", MNEMONIC, 0, 0).external,
  legacy2: NeuraiKey.getAddressPair("xna-legacy-test", MNEMONIC, 0, 1).external,
  authscriptPQ: NeuraiKey.getPQAuthScriptAddress("xna-authscript-test", MNEMONIC, 0, 0),
  pq: NeuraiKey.getPQAddress("xna-pq-test", MNEMONIC, 0, 0),
  ecdsa: NeuraiKey.getAddressByPath("xna-test", NeuraiKey.getHDKey("xna-test", MNEMONIC), "m/84'/1'/0'/0/0"),
};
const KEYS = Object.fromEntries(Object.values(W).map((w) => [w.address, w]));
const COIN = 100000000n;
const MARKER = { assetMarker: "xna" };
const hex = (bytes) => Buffer.from(bytes).toString("hex");
const scriptOf = (address) => hex(CT.encodeDestinationScript(address));

let counter = 0;
/** A previous transaction (version `version`) with the given outputs. */
function previousTx(outputs, version = 2) {
  counter += 1;
  return CT.serializeTransaction({
    version,
    inputs: [{ txid: counter.toString(16).padStart(64, "0"), vout: 0, scriptSigHex: "", sequence: 0xffffffff }],
    outputs,
    vrefin: [],
    locktime: 0,
  });
}

/** Spend `spent` ([previousTx, vout]) to a P2PKH output. */
function spend(spent, { version = 2, vrefin = [], outputs } = {}) {
  return CT.serializeTransaction({
    version,
    inputs: spent.map(([prev, vout]) => ({ txid: CT.computeTxid(prev), vout, scriptSigHex: "", sequence: 0xffffffff })),
    outputs: outputs ?? [{ valueSats: 1n * COIN, scriptPubKeyHex: scriptOf(W.legacy2.address) }],
    vrefin,
    locktime: 0,
  });
}

function utxoOf(prev, vout, address, extra = {}) {
  const output = CT.parseTransaction(prev).outputs[vout];
  return {
    address,
    assetName: "",
    txid: CT.computeTxid(prev),
    outputIndex: vout,
    script: output.scriptPubKeyHex,
    satoshis: output.valueSats,
    value: output.valueSats,
    ...extra,
  };
}

const xnaOut = (address, sats = 5n * COIN) => ({ valueSats: sats, scriptPubKeyHex: scriptOf(address) });
const signDirect = (rawTx, utxos, options = {}) => Signer.sign("xna-test", rawTx, utxos, KEYS, { debug: false, ...options });
const signPsbt = (psbt, inputs, options = {}) => Signer.signPsbt("xna-test", psbt, KEYS, { inputs, debug: false, ...options });
const finalTx = (psbt, inputs) => CT.extractPsbtTransaction(CT.finalizePsbt(psbt, inputs ? { inputs } : {})).hex;
const psbtOf = (rawTx, prevs, fields = []) =>
  CT.createPsbt({ unsignedTx: rawTx, inputs: prevs.map((previousTx, i) => ({ previousTx, ...(fields[i] ?? {}) })) });

describe("signPsbt", () => {
  it.each(["legacy", "ecdsa", "pq", "authscriptPQ"])("signs a %s input like sign()", (kind) => {
    const prev = previousTx([xnaOut(W[kind].address)]);
    const rawTx = spend([[prev, 0]]);
    const signed = signPsbt(psbtOf(rawTx, [prev]), [{ index: 0, address: W[kind].address }]);
    const input = CT.decodePsbt(signed).inputs[0];
    if (kind === "legacy" || kind === "ecdsa") {
      expect(input.partialSig).toHaveLength(1);
      expect(input.finalScriptWitness).toBeUndefined();
    } else {
      expect(input.partialSig).toEqual([]);
      expect(input.finalScriptWitness.length).toBeGreaterThan(0);
    }
    expect(finalTx(signed)).toBe(signDirect(rawTx, [utxoOf(prev, 0, W[kind].address)]));
  });

  it("signs every family in one transaction, one signer per input, combined", () => {
    const kinds = ["legacy", "authscriptPQ", "pq", "ecdsa"];
    const prev = previousTx(kinds.map((kind) => xnaOut(W[kind].address)));
    const rawTx = spend(kinds.map((_, vout) => [prev, vout]));
    const psbt = psbtOf(rawTx, kinds.map(() => prev));
    const parts = kinds.map((kind, index) => signPsbt(psbt, [{ index, address: W[kind].address }]));
    const combined = CT.combinePsbts(psbt, ...parts);
    expect(finalTx(combined)).toBe(signDirect(rawTx, kinds.map((kind, vout) => utxoOf(prev, vout, W[kind].address))));
  });

  it("signs only the requested inputs and leaves the others untouched", () => {
    const prev = previousTx([xnaOut(W.legacy.address), xnaOut(W.ecdsa.address)]);
    const rawTx = spend([[prev, 0], [prev, 1]]);
    const signed = signPsbt(psbtOf(rawTx, [prev, prev]), [{ index: 1, address: W.ecdsa.address }]);
    const decoded = CT.decodePsbt(signed);
    expect(decoded.inputs[0].partialSig).toEqual([]);
    expect(decoded.inputs[1].partialSig).toHaveLength(1);
    const partial = CT.extractPsbtTransaction(CT.finalizePsbt(signed, { inputs: [1] }), { allowIncomplete: true });
    expect(partial.incomplete).toEqual([0]);
    expect(partial.hex).toBe(signDirect(rawTx, [utxoOf(prev, 1, W.ecdsa.address)]));
  });

  it("signs a version-3 transaction with vrefin whose previous transactions are version 3", () => {
    const prev = previousTx([xnaOut(W.legacy.address), xnaOut(W.ecdsa.address), xnaOut(W.pq.address)], 3);
    const reference = previousTx([xnaOut(W.legacy2.address)], 3);
    const rawTx = spend([[prev, 0], [prev, 1], [prev, 2]], { version: 3, vrefin: [{ txid: CT.computeTxid(reference), vout: 0 }] });
    const signed = signPsbt(psbtOf(rawTx, [prev, prev, prev]), [
      { index: 0, address: W.legacy.address },
      { index: 1, address: W.ecdsa.address },
      { index: 2, address: W.pq.address },
    ]);
    const hexTx = finalTx(signed);
    expect(CT.parseTransaction(hexTx).version).toBe(3);
    expect(hexTx).toBe(signDirect(rawTx, [W.legacy, W.ecdsa, W.pq].map((w, vout) => utxoOf(prev, vout, w.address))));
  });

  it("signs asset-carrying inputs", () => {
    const prev = previousTx([
      CT.createAssetTransferOutput(W.legacy.address, "PSBTTOKEN", 5n * COIN, MARKER),
      CT.createAssetTransferOutput(W.ecdsa.address, "PSBTTOKEN", 5n * COIN, MARKER),
      xnaOut(W.legacy.address),
    ]);
    const rawTx = spend([[prev, 0], [prev, 1], [prev, 2]], {
      outputs: [CT.createAssetTransferOutput(W.legacy2.address, "PSBTTOKEN", 10n * COIN, MARKER), xnaOut(W.legacy2.address, 4n * COIN)],
    });
    const inputs = [W.legacy, W.ecdsa, W.legacy].map((w, index) => ({ index, address: w.address }));
    const signed = signPsbt(psbtOf(rawTx, [prev, prev, prev]), inputs);
    expect(finalTx(signed)).toBe(signDirect(rawTx, inputs.map(({ address }, vout) => utxoOf(prev, vout, address))));
  });

  describe("partial-fill covenant cancel (witnessScript)", () => {
    const legacyCovenant = Scripts.buildPartialFillScriptHex({ sellerAddress: W.legacy.address, tokenId: "PSBTTOKEN", unitPriceSats: 1n });
    const ecdsaCovenant = Scripts.buildPartialFillScriptHex({
      paymentAddress: W.ecdsa.address,
      sellerPubKeyHash: new Uint8Array(bitcoin.crypto.hash160(Buffer.from(W.ecdsa.publicKey, "hex"))),
      tokenId: "PSBTTOKEN",
      unitPriceSats: 1n,
    });
    const pqCovenant = Scripts.buildPartialFillScriptPQHex({
      paymentAddress: W.pq.address,
      pubKeyCommitment: new Uint8Array(bitcoin.crypto.sha256(Buffer.concat([Buffer.from([0x05]), Buffer.from(W.pq.publicKey, "hex")]))),
      tokenId: "PSBTTOKEN",
      unitPriceSats: 1n,
    });
    const covenantAddress = (covenantHex) =>
      NeuraiKey.getNoAuthAddress("xna-authscript-test", { witnessScript: Buffer.from(covenantHex, "hex") }).address;

    function order(covenantHex, seller, kind) {
      const prev = previousTx([
        CT.createAssetTransferOutput(covenantAddress(covenantHex), "PSBTTOKEN", 7n * COIN, MARKER),
        xnaOut(seller.address),
      ]);
      const rawTx = spend([[prev, 0], [prev, 1]], {
        outputs: [CT.createAssetTransferOutput(seller.address, "PSBTTOKEN", 7n * COIN, MARKER), xnaOut(seller.address, 4n * COIN)],
      });
      const direct = signDirect(rawTx, [
        utxoOf(prev, 0, seller.address, { bareScriptHint: { kind, covenantScriptHex: covenantHex } }),
        utxoOf(prev, 1, seller.address),
      ]);
      return { prev, rawTx, direct, psbt: psbtOf(rawTx, [prev, prev], [{ witnessScript: covenantHex }]) };
    }

    it.each([
      ["P2PKH seller", () => legacyCovenant, () => W.legacy, "covenant-cancel-legacy"],
      ["ECDSA v3 seller", () => ecdsaCovenant, () => W.ecdsa, "covenant-cancel-legacy"],
      ["PQ seller", () => pqCovenant, () => W.pq, "covenant-cancel-pq"],
    ])("cancels an order of a %s like sign() with the hint", (_, covenant, seller, kind) => {
      const o = order(covenant(), seller(), kind);
      const signed = signPsbt(o.psbt, [
        { index: 0, address: seller().address },
        { index: 1, address: seller().address },
      ]);
      const decoded = CT.decodePsbt(signed);
      expect(decoded.inputs[0].finalScriptWitness.at(-1)).toBe(covenant());
      expect(finalTx(signed)).toBe(o.direct);
    });

    it("rejects a covenant cancel signed by another key", () => {
      const o = order(legacyCovenant, W.legacy, "covenant-cancel-legacy");
      expect(() => signPsbt(o.psbt, [{ index: 0, address: W.legacy2.address }])).toThrow(/does not match the covenant sellerPubKeyHash/);
    });

    it("rejects a witnessScript that is not the covenant of the previous output", () => {
      const o = order(legacyCovenant, W.legacy, "covenant-cancel-legacy");
      const other = psbtOf(o.rawTx, [o.prev, o.prev], [{ witnessScript: ecdsaCovenant }]);
      expect(() => signPsbt(other, [{ index: 0, address: W.ecdsa.address }])).toThrow(/commitment mismatch/);
      const noScript = psbtOf(o.rawTx, [o.prev, o.prev]);
      expect(() => signPsbt(noScript, [{ index: 0, address: W.legacy.address }])).toThrow(/is not paid to/);
    });

    it("rejects SINGLE|ANYONECANPAY on a covenant", () => {
      const o = order(legacyCovenant, W.legacy, "covenant-cancel-legacy");
      const psbt = psbtOf(o.rawTx, [o.prev, o.prev], [{ witnessScript: legacyCovenant, sighashType: 0x83 }]);
      expect(() => signPsbt(psbt, [{ index: 0, address: W.legacy.address }])).toThrow(/SINGLE\|ANYONECANPAY only supports/);
    });
  });

  describe("sighash policy", () => {
    const prev = previousTx([xnaOut(W.legacy.address), xnaOut(W.ecdsa.address)]);
    const rawTx = spend([[prev, 0], [prev, 1]], { outputs: [xnaOut(W.legacy2.address, 4n * COIN), xnaOut(W.legacy2.address, 4n * COIN)] });

    it("signs with the PSBT's sighashType", () => {
      const psbt = psbtOf(rawTx, [prev, prev], [{ sighashType: 0x83 }, { sighashType: 0x01 }]);
      const signed = signPsbt(psbt, [
        { index: 0, address: W.legacy.address },
        { index: 1, address: W.ecdsa.address },
      ]);
      const decoded = CT.decodePsbt(signed);
      expect(decoded.inputs[0].partialSig[0].signatureHex.slice(-2)).toBe("83");
      expect(decoded.inputs[1].partialSig[0].signatureHex.slice(-2)).toBe("01");
      expect(finalTx(signed)).toBe(
        signDirect(rawTx, [utxoOf(prev, 0, W.legacy.address), utxoOf(prev, 1, W.ecdsa.address)], { inputHashTypes: { 0: 0x83 } })
      );
    });

    it("uses the options when the PSBT has no sighashType, and rejects contradictions", () => {
      const psbt = psbtOf(rawTx, [prev, prev]);
      const signed = signPsbt(psbt, [{ index: 1, address: W.ecdsa.address }], { inputHashTypes: { 1: 0x83 } });
      expect(CT.decodePsbt(signed).inputs[1].partialSig[0].signatureHex.slice(-2)).toBe("83");

      const fixed = psbtOf(rawTx, [prev, prev], [{ sighashType: 0x01 }]);
      expect(() => signPsbt(fixed, [{ index: 0, address: W.legacy.address }], { hashType: 0x83 })).toThrow(
        /asks for sighash 0x01, but the options ask for 0x83/
      );
      expect(signPsbt(fixed, [{ index: 0, address: W.legacy.address }], { hashType: 0x01 })).toBe(
        signPsbt(fixed, [{ index: 0, address: W.legacy.address }])
      );
      expect(() => signPsbt(psbt, [{ index: 0, address: W.legacy.address }], { inputHashTypes: { 1: 0x83 } })).toThrow(
        /inputHashTypes\[1\] names an input that is not being signed/
      );
    });

    it("rejects modes the signer does not support", () => {
      const none = psbtOf(rawTx, [prev, prev], [{ sighashType: 0x02 }]);
      expect(() => signPsbt(none, [{ index: 0, address: W.legacy.address }])).toThrow(/hashType must be ALL/);
      const prevV1 = previousTx([xnaOut(W.authscriptPQ.address)]);
      const v1 = psbtOf(spend([[prevV1, 0]]), [prevV1], [{ sighashType: 0x83 }]);
      expect(() => signPsbt(v1, [{ index: 0, address: W.authscriptPQ.address }])).toThrow(/SINGLE\|ANYONECANPAY only supports/);
    });
  });

  describe("rejections", () => {
    const prev = previousTx([xnaOut(W.legacy.address), xnaOut(W.ecdsa.address)]);
    const rawTx = spend([[prev, 0], [prev, 1]]);
    const psbt = psbtOf(rawTx, [prev, prev]);

    it("needs the previous transaction of every input it signs", () => {
      const output = CT.parseTransaction(prev).outputs[0];
      const onlyWitnessUtxo = CT.createPsbt({ unsignedTx: rawTx, inputs: [{ witnessUtxo: output }] });
      expect(() => signPsbt(onlyWitnessUtxo, [{ index: 0, address: W.legacy.address }])).toThrow(/has no previous transaction/);
    });

    it("rejects an address the input is not paid to, and missing keys", () => {
      expect(() => signPsbt(psbt, [{ index: 0, address: W.ecdsa.address }])).toThrow(/input 0 is not paid to/);
      expect(() => Signer.signPsbt("xna-test", psbt, {}, { inputs: [{ index: 0, address: W.legacy.address }] })).toThrow(
        /no private key for/
      );
    });

    it("rejects bad input lists and finalized inputs", () => {
      expect(() => signPsbt(psbt, [])).toThrow(/must list the inputs to sign/);
      expect(() => signPsbt(psbt, [{ index: 2, address: W.legacy.address }])).toThrow(/has no input 2/);
      expect(() =>
        signPsbt(psbt, [
          { index: 0, address: W.legacy.address },
          { index: 0, address: W.legacy.address },
        ])
      ).toThrow(/listed twice/);
      const finalized = CT.finalizePsbt(signPsbt(psbt, [{ index: 0, address: W.legacy.address }]), { inputs: [0] });
      expect(() => signPsbt(finalized, [{ index: 0, address: W.legacy.address }])).toThrow(/already finalized/);
    });

    it("rejects a PSBT whose previous transaction does not match (profile)", () => {
      const other = previousTx([xnaOut(W.legacy.address)]);
      const forged = bitcoin.Psbt.fromBase64(psbt);
      forged.data.inputs[0].nonWitnessUtxo = Buffer.from(other, "hex");
      expect(() => signPsbt(forged.toBase64(), [{ index: 0, address: W.legacy.address }])).toThrow(/the previous transaction is/);
    });

    it("signing twice gives the same PSBT; a different signature for the key is a conflict", () => {
      const once = signPsbt(psbt, [{ index: 0, address: W.legacy.address }]);
      expect(signPsbt(once, [{ index: 1, address: W.ecdsa.address }])).toBe(
        CT.combinePsbts(once, signPsbt(psbt, [{ index: 1, address: W.ecdsa.address }]))
      );
      const other = signPsbt(CT.updatePsbtInput(psbt, 0, { sighashType: 0x83 }), [{ index: 0, address: W.legacy.address }]);
      expect(() => CT.combinePsbts(once, other)).toThrow(/conflict in input 0/);
    });
  });

  it("is exposed by the global bundle", () => {
    const source = fs.readFileSync(path.join(__dirname, "dist/NeuraiSignTransaction.global.js"), "utf8");
    const context = { globalThis: {}, console, Uint8Array, ArrayBuffer, DataView, TextEncoder, TextDecoder, crypto: globalThis.crypto };
    vm.runInNewContext(source, context);
    expect(typeof context.globalThis.NeuraiSignTransaction.signPsbt).toBe("function");
    expect(typeof Signer.default.signPsbt).toBe("function");
  });
});
