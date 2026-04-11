const Signer = require("./dist/index.cjs");
const bitcoin = require("bitcoinjs-lib");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const pqFixtures = require("./mock/test_pq_fixtures.json");

test("Verify XNA sign transaction", () => {
  const testData = require("./mock/test_xna_transaction.json");
  const network = "xna-test";
  const UTXOs = testData.debug.xnaUTXOs;
  const privateKeys = testData.debug.privateKeys;
  const rawUnsignedTransaction = testData.debug.rawUnsignedTransaction;

  const expectedResult = testData.debug.signedTransaction;
  const asdf = Signer.sign(network, rawUnsignedTransaction, UTXOs, privateKeys);

  expect(asdf).toBe(expectedResult);
});

test("Verify XNA sign PQ transaction", () => {
  const pq = pqFixtures.pqInput;
  const tx = new bitcoin.Transaction();
  tx.version = 2;
  tx.addInput(Buffer.from("11".repeat(32), "hex").reverse(), 0);
  tx.addOutput(Buffer.from("76a91409f2017224efdaf3633d26b1cf11a1df418496f688ac", "hex"), 125000);

  const signedHex = Signer.sign(
    "xna-pq-test",
    tx.toHex(),
    [
      {
        address: "pq-input-1",
        assetName: "XNA",
        txid: "11".repeat(32),
        outputIndex: 0,
        script: pq.script,
        satoshis: 150000,
        value: 150000,
      },
    ],
    {
      "pq-input-1": {
        seedKey: pq.seedKey,
      },
    }
  );

  const signedTx = bitcoin.Transaction.fromHex(signedHex);
  const witness = signedTx.ins[0].witness;

  expect(signedHex).toBe(pq.signedTransaction);
  expect(signedTx.ins[0].script.length).toBe(0);
  expect(witness).toHaveLength(2);
  expect(witness[1].toString("hex")).toBe(pq.serializedPublicKey);
  expect(witness[0][witness[0].length - 1]).toBe(bitcoin.Transaction.SIGHASH_ALL);
});

test("Verify mixed legacy and PQ asset transaction", () => {
  const pq = pqFixtures.mixed;
  const tx = new bitcoin.Transaction();
  tx.version = 2;
  tx.addInput(Buffer.from("22".repeat(32), "hex").reverse(), 1);
  tx.addInput(Buffer.from("33".repeat(32), "hex").reverse(), 0);
  tx.addOutput(Buffer.from("76a9141239cd8e03d180a55b75763f9ef7424b7e2eee8f88ac", "hex"), 240000);

  const signedHex = Signer.sign(
    "xna-test",
    tx.toHex(),
    [
      {
        address: "mgRYHdMqD1gwm9QQqBRUPcDKdEZ9oVeChA",
        assetName: "XNA",
        txid: "22".repeat(32),
        outputIndex: 1,
        script: "76a91409f2017224efdaf3633d26b1cf11a1df418496f688ac",
        satoshis: 100000,
        value: 100000,
      },
      {
        address: "pq-asset-input",
        assetName: "BUTTER",
        txid: "33".repeat(32),
        outputIndex: 0,
        script: pq.script,
        satoshis: 200000,
        value: 200000,
      },
    ],
    {
      mgRYHdMqD1gwm9QQqBRUPcDKdEZ9oVeChA:
        "cVP9mzcDqMzWDhekiKMWKqEy739Cp6rKDT4tbG4wXXVfopMfTiBW",
      "pq-asset-input": {
        seedKey: pq.seedKey,
      },
    }
  );

  const signedTx = bitcoin.Transaction.fromHex(signedHex);
  const pqWitness = signedTx.ins[1].witness;

  expect(signedHex).toBe(pq.signedTransaction);
  expect(signedTx.ins[0].script.length).toBeGreaterThan(0);
  expect(signedTx.ins[0].witness).toHaveLength(0);
  expect(signedTx.ins[1].script.length).toBe(0);
  expect(pqWitness).toHaveLength(2);
  expect(pqWitness[1].toString("hex")).toBe(pq.serializedPublicKey);
});

test("Verify partial PQ signing preserves foreign legacy input", () => {
  const pq = pqFixtures.mixed;
  const partiallySignedTx = bitcoin.Transaction.fromHex(pq.signedTransaction);

  partiallySignedTx.setWitness(1, []);

  const signedHex = Signer.sign(
    "xna-pq-test",
    partiallySignedTx.toHex(),
    [
      {
        address: "pq-asset-input",
        assetName: "BUTTER",
        txid: "33".repeat(32),
        outputIndex: 0,
        script: pq.script,
        satoshis: 200000,
        value: 200000,
      },
    ],
    {
      "pq-asset-input": {
        seedKey: pq.seedKey,
      },
    }
  );

  expect(signedHex).toBe(pq.signedTransaction);
});

test("Verify debug events expose PQ signing path", () => {
  const pq = pqFixtures.mixed;
  const partiallySignedTx = bitcoin.Transaction.fromHex(pq.signedTransaction);
  const debugEvents = [];

  partiallySignedTx.setWitness(1, []);

  const signedHex = Signer.sign(
    "xna-pq-test",
    partiallySignedTx.toHex(),
    [
      {
        address: "pq-asset-input",
        assetName: "BUTTER",
        txid: "33".repeat(32),
        outputIndex: 0,
        script: pq.script,
        satoshis: 200000,
        value: 200000,
      },
    ],
    {
      "pq-asset-input": {
        seedKey: pq.seedKey,
      },
    },
    {
      debug: (event) => debugEvents.push(event),
    }
  );

  expect(signedHex).toBe(pq.signedTransaction);
  expect(debugEvents).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        step: "skip-missing-utxo",
        i: 0,
      }),
      expect.objectContaining({
        step: "script-type",
        i: 1,
        isPQ: true,
      }),
      expect.objectContaining({
        step: "pq-material",
        i: 1,
        address: "pq-asset-input",
        hasPrivateKeyEntry: true,
      }),
      expect.objectContaining({
        step: "witness-set",
        i: 1,
        witnessItems: 2,
      }),
      expect.objectContaining({
        step: "final-inputs",
        inputs: expect.arrayContaining([
          expect.objectContaining({ i: 0, witnessItems: 0 }),
          expect.objectContaining({ i: 1, witnessItems: 2 }),
        ]),
      }),
    ])
  );
});

test("Verify XNA sign ASSET transaction", () => {
  const testData = require("./mock/test_asset_transaction.json");
  const network = "xna-test";
  const UTXOs = testData.debug.xnaUTXOs.concat(testData.debug.assetUTXOs);

  const privateKeys = testData.debug.privateKeys;
  const rawUnsignedTransaction = testData.debug.rawUnsignedTransaction;

  const expectedResult = testData.debug.signedTransaction;
  const asdf = Signer.sign(network, rawUnsignedTransaction, UTXOs, privateKeys);

  expect(asdf).toBe(expectedResult);
});

test("Verify browser ESM entry exports sign", () => {
  const browserBundle = fs.readFileSync(path.join(__dirname, "dist/browser.js"), "utf8");

  expect(browserBundle).toContain("const Signer = {");
  expect(browserBundle).toContain("export { Signer as default, sign };");
});

test("Verify global bundle exposes NeuraiSignTransaction", () => {
  const bundle = fs.readFileSync(
    path.join(__dirname, "dist/NeuraiSignTransaction.global.js"),
    "utf8"
  );
  const context = {
    globalThis: {},
    window: {},
    self: {},
    console,
    Uint8Array,
    ArrayBuffer,
    DataView,
    TextEncoder,
    TextDecoder,
    crypto: globalThis.crypto,
  };

  vm.runInNewContext(bundle, context);

  expect(context.globalThis.NeuraiSignTransaction).toBeDefined();
  expect(typeof context.globalThis.NeuraiSignTransaction.sign).toBe("function");
});

test("Verify browser build does not contain Node require residuals", () => {
  const browserBundle = fs.readFileSync(path.join(__dirname, "dist/browser.js"), "utf8");
  const browserBundleWithoutComments = browserBundle
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "");

  expect(browserBundleWithoutComments).not.toMatch(/\brequire\((['"])(buffer|crypto|fs|path|stream)\1\)/);
  expect(browserBundle.includes("node:crypto")).toBe(false);
  expect(browserBundle.includes("node:fs")).toBe(false);
  expect(browserBundle.includes("node:path")).toBe(false);
  expect(browserBundle.includes("node:stream")).toBe(false);
});
