const Signer = require("./dist/index.cjs");

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
test("Verify EVR sign transaction", () => {
  const testData = require("./mock/test_evr_transaction.json");
  const network = "evr";
  const UTXOs = testData.debug.UTXOs;

  const privateKeys = testData.debug.privateKeys;
  const rawUnsignedTransaction = testData.debug.rawUnsignedTransaction;

  const expectedResult = testData.debug.signedTransaction;
  const asdf = Signer.sign(network, rawUnsignedTransaction, UTXOs, privateKeys);

  expect(asdf).toBe(expectedResult);
});

test("Verify EVR sign ASSET transaction", () => {
  const testData = require("./mock/test_asset_transaction_evr.json");
  const network = "evr";
  const UTXOs = testData.debug.UTXOs;

  const privateKeys = testData.debug.privateKeys;
  const rawUnsignedTransaction = testData.debug.rawUnsignedTransaction;

  const expectedResult = testData.debug.signedTransaction;
  const asdf = Signer.sign(network, rawUnsignedTransaction, UTXOs, privateKeys);

  expect(asdf).toBe(expectedResult);
});
