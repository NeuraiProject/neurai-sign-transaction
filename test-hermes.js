// Signing under Hermes (React Native) semantics. There, `subarray()` of a
// Buffer from the `buffer` package bundled here returns a plain Uint8Array
// (Hermes builds the result with the default constructor), so `Buffer#equals`
// receives a non-Buffer and throws "Argument must be a Buffer", and plain
// arrays have no `equals` at all. Seen in NeuraiWallet cancelling an order.
// Every family must sign the same bytes as under Node.
const NeuraiKey = require("@neuraiproject/neurai-key");
const CT = require("@neuraiproject/neurai-create-transaction");
const Scripts = require("@neuraiproject/neurai-scripts");
const bitcoin = require("bitcoinjs-lib");
const Signer = require("./dist/index.cjs");

const nodeSubarray = Uint8Array.prototype.subarray;
function hermesSubarray(start, end) {
  const view = nodeSubarray.call(this, start, end);
  return new Uint8Array(view.buffer, view.byteOffset, view.length);
}
/** Run `fn` with Hermes' `subarray`, and without the `Uint8Array#equals` NeuraiWallet's shim adds. */
function underHermes(fn) {
  Uint8Array.prototype.subarray = hermesSubarray;
  try {
    return fn();
  } finally {
    Uint8Array.prototype.subarray = nodeSubarray;
  }
}

const MNEMONIC = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
const W = {
  legacy: NeuraiKey.getAddressPair("xna-legacy-test", MNEMONIC, 0, 0).external,
  authscriptPQ: NeuraiKey.getPQAuthScriptAddress("xna-authscript-test", MNEMONIC, 0, 0),
  pq: NeuraiKey.getPQAddress("xna-pq-test", MNEMONIC, 0, 0),
  ecdsa: NeuraiKey.getAddressByPath("xna-test", NeuraiKey.getHDKey("xna-test", MNEMONIC), "m/84'/1'/0'/0/0"),
};
const KEYS = Object.fromEntries(Object.values(W).map((w) => [w.address, w]));
const COIN = 100000000n;
const MARKER = { assetMarker: "xna" };
const scriptOf = (address) => Buffer.from(CT.encodeDestinationScript(address)).toString("hex");

function previousTx(outputs) {
  return CT.serializeTransaction({
    version: 2,
    inputs: [{ txid: "77".repeat(32), vout: 0, scriptSigHex: "", sequence: 0xffffffff }],
    outputs,
    vrefin: [],
    locktime: 0,
  });
}
function spend(prev, vouts, outputs) {
  return CT.serializeTransaction({
    version: 2,
    inputs: vouts.map((vout) => ({ txid: CT.computeTxid(prev), vout, scriptSigHex: "", sequence: 0xffffffff })),
    outputs,
    vrefin: [],
    locktime: 0,
  });
}
function utxo(prev, vout, address, extra = {}) {
  const output = CT.parseTransaction(prev).outputs[vout];
  return { address, assetName: "", txid: CT.computeTxid(prev), outputIndex: vout, script: output.scriptPubKeyHex, satoshis: output.valueSats, value: output.valueSats, ...extra };
}
const sign = (rawTx, utxos) => Signer.sign("xna-legacy-test", rawTx, utxos, KEYS, { debug: false });

describe("signing under Hermes semantics (subarray returns a plain Uint8Array)", () => {
  it("the emulation is the one NeuraiWallet hits", () => {
    // A Uint8Array subclass, like the bundled Buffer: under Node subarray keeps the subclass.
    class Subclass extends Uint8Array {}
    const bytes = new Subclass([1, 2, 3, 4, 5]);
    expect(bytes.subarray(1, 3) instanceof Subclass).toBe(true);
    underHermes(() => {
      const view = bytes.subarray(1, 3);
      expect(view instanceof Subclass).toBe(false);
      expect(Object.getPrototypeOf(view) === Uint8Array.prototype).toBe(true);
    });
  });

  it.each(["legacy", "ecdsa", "pq", "authscriptPQ"])("signs a %s input as under Node", (kind) => {
    const prev = previousTx([{ valueSats: 5n * COIN, scriptPubKeyHex: scriptOf(W[kind].address) }]);
    const rawTx = spend(prev, [0], [{ valueSats: 4n * COIN, scriptPubKeyHex: scriptOf(W.legacy.address) }]);
    const utxos = [utxo(prev, 0, W[kind].address)];
    expect(underHermes(() => sign(rawTx, utxos))).toBe(sign(rawTx, utxos));
  });

  const covenantAddress = (covenantHex) =>
    NeuraiKey.getNoAuthAddress("xna-authscript-test", { witnessScript: Buffer.from(covenantHex, "hex") }).address;
  const legacyOrder = Scripts.buildPartialFillScriptHex({
    paymentAddress: W.legacy.address,
    sellerPubKeyHash: new Uint8Array(bitcoin.crypto.hash160(Buffer.from(W.legacy.publicKey, "hex"))),
    tokenId: "HERMES",
    unitPriceSats: 1n,
  });
  const pqOrder = Scripts.buildPartialFillScriptPQHex({
    paymentAddress: W.pq.address,
    pubKeyCommitment: new Uint8Array(bitcoin.crypto.sha256(Buffer.concat([Buffer.from([0x05]), Buffer.from(W.pq.publicKey, "hex")]))),
    tokenId: "HERMES",
    unitPriceSats: 1n,
  });

  it.each([
    ["ECDSA", () => legacyOrder, () => W.legacy, "covenant-cancel-legacy"],
    ["PQ", () => pqOrder, () => W.pq, "covenant-cancel-pq"],
  ])("cancels an order with its %s key as under Node (asset AuthScript input, NIP-025 check)", (_, order, seller, kind) => {
    const prev = previousTx([
      CT.createAssetTransferOutput(covenantAddress(order()), "HERMES", 7n * COIN, MARKER),
      { valueSats: 2n * COIN, scriptPubKeyHex: scriptOf(seller().address) },
    ]);
    const rawTx = spend(prev, [0, 1], [
      CT.createAssetTransferOutput(seller().address, "HERMES", 7n * COIN, MARKER),
      { valueSats: 2n * COIN - 5000000n, scriptPubKeyHex: scriptOf(seller().address) },
    ]);
    const utxos = [
      utxo(prev, 0, seller().address, { bareScriptHint: { kind, covenantScriptHex: order() } }),
      utxo(prev, 1, seller().address),
    ];
    expect(underHermes(() => sign(rawTx, utxos))).toBe(sign(rawTx, utxos));
  });

  it("signs an order cancellation through a PSBT as under Node", () => {
    const prev = previousTx([
      CT.createAssetTransferOutput(covenantAddress(legacyOrder), "HERMES", 7n * COIN, MARKER),
      { valueSats: 2n * COIN, scriptPubKeyHex: scriptOf(W.legacy.address) },
    ]);
    const rawTx = spend(prev, [0, 1], [
      CT.createAssetTransferOutput(W.legacy.address, "HERMES", 7n * COIN, MARKER),
      { valueSats: 2n * COIN - 5000000n, scriptPubKeyHex: scriptOf(W.legacy.address) },
    ]);
    const psbt = CT.createPsbt({ unsignedTx: rawTx, inputs: [{ previousTx: prev, witnessScript: legacyOrder }, { previousTx: prev }] });
    const signPsbt = () =>
      Signer.signPsbt("xna-legacy-test", psbt, KEYS, {
        inputs: [{ index: 0, address: W.legacy.address }, { index: 1, address: W.legacy.address }],
        debug: false,
      });
    expect(underHermes(signPsbt)).toBe(signPsbt());
  });
});
