const Signer = require("./dist/index.cjs");
const bitcoin = require("bitcoinjs-lib");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const PQ_SIMPLE = {
  seedKey: "0707070707070707070707070707070707070707070707070707070707070707",
  script: "51203c5c93248148e2b005ddb351bb506f0b830cec149a1b03791949c983d4336a76",
  serializedPublicKey:
    "05224c619220720e1a170540ab01a770a466d3975ffe006bffc9c9aa18a7d165caaded4b21613ce8cfbf97f6d2c2d1560e1dae8eb89cc55addcee02b997fb9f4ccf7ea26bc9ffd8a17158f32e5da5597be2deeb0d0667547b6df36e24b7cd845df44d75ab8085f57b792932c466afcbdbfd16e3a272a8fd99fad9782b28fc210dc499a425f668b0204221fbe4883397e79818710d6add1822f71f53291e842677be80639a346302eee89c67246479e676609ec57e075a4c72d0f4f4e0fbcc35c26b893edc307c446cc06d02c61614ad137400e9b93e272734d98d407efd0cd2f2e4119749476f2fc81e5ad28027cdab005f667b1274c1b2e4e662be0814b097a4eff9fabc196928b2ecacf84db5ce8d910b0f50df75ca0ef5c838a5e1a87e12e5d01f2c6a74deff83265dbc2fba744aaad622e4784d4b6e29d5e477e47dfd11d4d30ba5bc4edbd312593a74bde5326b5a6abe87e36eb463872e1b6f8f7461975de613803b08da3469f2d41b23b3d97d23f3893191d99f7299e22f5c1c2b8138a7f3d9bbdc65d6ca894859399b5a5a75d6b8b44227f81f6ccbf8ca4f51d5435816f241ed3acfb817349ca7bc02ce1e70d12d9725f6f69ac04e023a11f96cb6c7d748f4d618a33a694c5b273b6f512832dd4deb452a393ea5ee0c25537361e78bade7894079d819597c30fe5b3e0cb750953840bf3cd3ea5d764748dade95383b743321ac2f211a7e4c7e363666712e0c4fdd90a0d522e62919cbd3c86124329cda46d01871b685c14ae119899e809549e0f0ef8fbf4d000cc1a988c3614477849ff4a042bed52357c98eb6ccbef7c4f5f11829878dbd5185ec5b935515a94aca02e006afcdd7004e729aaada294f02246f2c334a531f440a322d49b9f816a483d4d58d64192f5faf98719e2f81036c229e5644e780ff2ad90408599d8934312255ef0ce2baa2f4e0cc5600b436e7e7b26018236d934c7d28aeccc220f5c9d74fe68dee189ec922db22d5deefdd53896b68bc62dcc56d139abdfac12dc5dcb915972a9d9069070c6251e87310218082531b03cc1529fea52dd28a0b05680dab320d7fb46a2fcca5a7441faa90cd7e2467476b7f8867a3d8d845171aec90f2c5783cae573e52717c4f8deed31f9cf8937cfdaf4792a20c2b82a336607e887f004b2ff91f15af3e98b6552ac224ee08a2d2cea92f98fc90d547a7df7287325bbced147bc93c776651adb4bc0fcdbd83e61298d6796b59aa667005a6391b6876e153b4dcf7e2c73f9b280d0b4b64c3656bf1bdd73aeb02834e1631efa8a48003eda7eed0b6fff6d84183708abc552c1a5afd5136cfe378143299efec0ab5e36f30eade085b8b0e1cef0f2c06b4c899fe91b64c3f44d139fd88f687ae343ef58ff3ae21c32910a55a57e7d701393a964cd0671d08971425245117330ad9697f848a2539e05594572a30903a6ad12cf687628d16560d1fc8e837136f6278cae3725d4105f5cc330d513d3f0ed58d221dd1cae602834ee94649ff55455789c6f821bed82e699ff5a360d65ec2f2c77b4cc285a70953007089247b2937b9c7da3a7dc67de9e8f6517e57910389f6a449e42a42adb6eb46472ff7b18f036c03978c42f816f3302c2db7ec1923ba07aed1f93e0d06517901c3c2ac91ee60e4a1a4a67e554efa639c3c13027e8b7f5a7ce84acefdc3d75769d0a5626931cfb2bbcffba794cd588a662029a3735f7ded6784714e360a7c638c7495c888315ea4aa93ad919c7f88dd8f0477c5d15b6505774b06c37c9de0758a1b8b3ee2301be76cb8744c6ac123be21f7b1e694083b5eeb8cfa66b709747c3b9359621740981ede0046c2432c6f6",
};

const NOAUTH_SIMPLE = {
  script: "5120a6c181fcd8137e65528a30e4e2d457b51778238441b8f5dd8911c2084a17ee7b",
};

const NOAUTH_COVENANT = {
  witnessScript: "527551",
  script: "5120fbb0979eccf0690dbd2a2438e40e7c7b351d5e0cb0554c55309f9d30b1206f44",
};

const LEGACY_AUTHSCRIPT = {
  WIF: "cVP9mzcDqMzWDhekiKMWKqEy739Cp6rKDT4tbG4wXXVfopMfTiBW",
  script: "51204f3bf4e4647e4d567df289c131a999c67734819cd0901e77569af660d3d17adf",
  pubkey: "02666e9b6aacfa34715c1050e890fa8f07a5e73c70f23abdca585f1506514d81a0",
};

const LEGACY_AUTHSCRIPT_COVENANT = {
  WIF: "cVP9mzcDqMzWDhekiKMWKqEy739Cp6rKDT4tbG4wXXVfopMfTiBW",
  witnessScript: "527551",
  script: "51204bc0ba6c8c838e25fdcfd028828c523540463065d976f5b78f44065a8ac95618",
  pubkey: "02666e9b6aacfa34715c1050e890fa8f07a5e73c70f23abdca585f1506514d81a0",
};

const PQ_COVENANT = {
  seedKey: "0707070707070707070707070707070707070707070707070707070707070707",
  witnessScript: "527551",
  script: "5120a4ee262f75321960cc90d9bb4c4a2b1db6f945a6b0afe3d4fa7e3a046fa366b6",
  serializedPublicKey: PQ_SIMPLE.serializedPublicKey,
};

const PQ_ASSET = {
  seedKey: "0909090909090909090909090909090909090909090909090909090909090909",
  script: "5120f58c1feb865f6127897834ad6f3b7ac8cff224cdbfa21d96c59b944c3311104ac002beef75",
  serializedPublicKey:
    "0561907fb0bdd3bbc3433851a933515bb97cbba4a91550418d99f04f90243f82c8e1085c1a05fe0c04cc2ac4759ba358e7467cb386b13318e15ba49b67a6fbffa704c6b107f77c4386706f755808f51e02e6ef1dccb385ac3f809dd3420d77832099238ed4666042572473c53abc149798f0bf5ef9d325d1c0088b2b201770e669da085cbc96c7d6dad2cfb934aaf765bfd4e6500e19b8b18f7d4fd8cecac039cb22133c4d0498f955739e1c9169401f46d7dc75b7dd6ce3e0ec217de775cb10d3b1c4f8e591ae2ce17d4fc677476d34a70e12c3f6253ce85f1aecc087e7a8cd9ed641ac022203ea6e5138ba89e4b4dd9f6e5154ac3004b4c44cc7f317ce39800447072cf3106c29e7de42cd0ad50202d329cf9ccc85290c5798cc619ce132e23f9000ecdb59dc581e4fbbaaedd8893f74aa1d25a715e41260192d5105f1268b8aa5bdb071cd9a5c78661a7996a3ac2fd421f01c1964568320dd65a30b035b9dcfb7b1f8116e2596b0827cddeae055ea03df5569419b31787f01be81036b7cbd3a5375f64359bacfc20b19d603cc4507bd62c563883fa09dfbcfc7f0e7db1ea6ca1e4b4ae9eb6476699406803f504777221665f8195788b9954cbc25d216b87c782e96bc4f13b0e8305fb76fe5dce572f4ebf72041c0661fc9a117e254465269005e3cc75f807e019001fe6bfa194799c3e76a8487239dc926a2458b53212626c60810f4f08bc7d2daf17060495c1853db1f9eff9a47692240ce7c6cdeb320787c87f354031988475c64df16dd2f81cdc6a9fbfc96ab98598e9b4797c168a01fb9f2c805192fff941046cc60cecbf03eae42b648ca7fedd98a3115466f3b5d41756a7bd626887fcca0d2a1f164aba6bbbc99d502b9cb3624030c22a95fd9dd32eeb50230f41a4c118aa5232d7d4f2ddb1019422a998b47cd780c8c3485c406ffa5be1367adeeb4e6e04dbb5329a64ce8c9ff51bae5eac9e36c43ebc7f55d6cf30cbb8c8ff93b19cbfe07eb2b83b708977f01dca642d3c33b3814a7d3129353a8ef8773e47e684c0a60c85937ab6cae98ce735e11a13f64ae0e3295b55766d2b91c621c98c9e79a3deb81ed652b3e30b664fc3de7d7507dcbbb1a97ccf8e34b931e22fb0a414e5a8f55efeb2033027a7601e75059e0626ffb0718c9834a8bf4c9522e45da893250de3a5ab02f83c273afd631f3d34e7c3ebe3ea0c30f87db66cdafde936bab8609e7e09addc2288750c4aa1e9521d1cc8ec40c15b78a19487ee32ca2e38b5db02168426cecc00b79b39b96332a084ff6ddd4b6ec16c0adddcc681e28684d5d66ad30897e77054a7808933206e3939217c429dd64a5fb6ff52cc8124950b9ef7b0ef3b0b4711a7b535bc69bd2d96f22d956394d9e53b4ba2ae9b10864094d77b122022c9290dc6eb02fe38f04fb64c47c32bc98370dc98eb610a26b3c8c48f09bf6e70761fe2a188ebbe11c7e93d72729731d8743213f4c5c7982707644ad975a1b04465b64d0e92f2f9ba93c2a9d66e0a647e3ed9988a5e42efbfbdad0044972b90a5f519c756e2e88be4498c2452b2aedb70701d9179b95a763879b0ed8d60987cc1a4d922a2d815b3b940b26a0526a7daa0304bdc68d67ce13ef6cef7be46d003a4f7e93f9987e9412f63eb81b1fc1737ea3a16b6a97c9c3a15da5f77b2f438c2016ec7fd0e561540e6a9620b7f83eab9b70b34757bc214fa27c568b93830d690fe0f78ec0e1f458189ccbb5277705a956e58486be5231f9a91a3a9ba19719f3c4d3a559ab6f2a6deb95854c1d5487e8e476d58e2c76e21eb070bc99c5fb0450cb2e430915d1a98d48f2a23211e08eb3bb5b9c8430ec4cde1b0e",
};

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

test("Verify XNA sign PQ AuthScript transaction", () => {
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
        script: PQ_SIMPLE.script,
        satoshis: 150000,
        value: 150000,
      },
    ],
    {
      "pq-input-1": {
        seedKey: PQ_SIMPLE.seedKey,
      },
    }
  );

  const signedTx = bitcoin.Transaction.fromHex(signedHex);
  const witness = signedTx.ins[0].witness;

  expect(signedTx.ins[0].script.length).toBe(0);
  expect(witness).toHaveLength(4);
  expect(witness[0].equals(Buffer.from([0x01]))).toBe(true);
  expect(witness[1][witness[1].length - 1]).toBe(bitcoin.Transaction.SIGHASH_ALL);
  expect(witness[2].toString("hex")).toBe(PQ_SIMPLE.serializedPublicKey);
  expect(witness[3].equals(Buffer.from([bitcoin.opcodes.OP_TRUE]))).toBe(true);
});

test("Verify mixed legacy and PQ AuthScript asset transaction", () => {
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
        script: PQ_ASSET.script,
        satoshis: 200000,
        value: 200000,
      },
    ],
    {
      mgRYHdMqD1gwm9QQqBRUPcDKdEZ9oVeChA:
        "cVP9mzcDqMzWDhekiKMWKqEy739Cp6rKDT4tbG4wXXVfopMfTiBW",
      "pq-asset-input": {
        seedKey: PQ_ASSET.seedKey,
      },
    }
  );

  const signedTx = bitcoin.Transaction.fromHex(signedHex);
  const pqWitness = signedTx.ins[1].witness;

  expect(signedTx.ins[0].script.length).toBeGreaterThan(0);
  expect(signedTx.ins[0].witness).toHaveLength(0);
  expect(signedTx.ins[1].script.length).toBe(0);
  expect(pqWitness).toHaveLength(4);
  expect(pqWitness[0].equals(Buffer.from([0x01]))).toBe(true);
  expect(pqWitness[2].toString("hex")).toBe(PQ_ASSET.serializedPublicKey);
  expect(pqWitness[3].equals(Buffer.from([bitcoin.opcodes.OP_TRUE]))).toBe(true);
});

test("Verify partial PQ signing preserves foreign legacy input", () => {
  const tx = new bitcoin.Transaction();
  tx.version = 2;
  tx.addInput(Buffer.from("22".repeat(32), "hex").reverse(), 1);
  tx.addInput(Buffer.from("33".repeat(32), "hex").reverse(), 0);
  tx.addOutput(Buffer.from("76a9141239cd8e03d180a55b75763f9ef7424b7e2eee8f88ac", "hex"), 240000);

  const fullySignedHex = Signer.sign(
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
        script: PQ_ASSET.script,
        satoshis: 200000,
        value: 200000,
      },
    ],
    {
      mgRYHdMqD1gwm9QQqBRUPcDKdEZ9oVeChA:
        "cVP9mzcDqMzWDhekiKMWKqEy739Cp6rKDT4tbG4wXXVfopMfTiBW",
      "pq-asset-input": {
        seedKey: PQ_ASSET.seedKey,
      },
    }
  );

  const partiallySignedTx = bitcoin.Transaction.fromHex(fullySignedHex);
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
        script: PQ_ASSET.script,
        satoshis: 200000,
        value: 200000,
      },
    ],
    {
      "pq-asset-input": {
        seedKey: PQ_ASSET.seedKey,
      },
    }
  );

  expect(signedHex).toBe(fullySignedHex);
});

test("Verify debug events expose PQ AuthScript signing path", () => {
  const tx = new bitcoin.Transaction();
  tx.version = 2;
  tx.addInput(Buffer.from("22".repeat(32), "hex").reverse(), 1);
  tx.addInput(Buffer.from("33".repeat(32), "hex").reverse(), 0);
  tx.addOutput(Buffer.from("76a9141239cd8e03d180a55b75763f9ef7424b7e2eee8f88ac", "hex"), 240000);

  const fullySignedHex = Signer.sign(
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
        script: PQ_ASSET.script,
        satoshis: 200000,
        value: 200000,
      },
    ],
    {
      mgRYHdMqD1gwm9QQqBRUPcDKdEZ9oVeChA:
        "cVP9mzcDqMzWDhekiKMWKqEy739Cp6rKDT4tbG4wXXVfopMfTiBW",
      "pq-asset-input": {
        seedKey: PQ_ASSET.seedKey,
      },
    }
  );

  const partiallySignedTx = bitcoin.Transaction.fromHex(fullySignedHex);
  const debugEvents = [];
  partiallySignedTx.setWitness(1, []);

  Signer.sign(
    "xna-pq-test",
    partiallySignedTx.toHex(),
    [
      {
        address: "pq-asset-input",
        assetName: "BUTTER",
        txid: "33".repeat(32),
        outputIndex: 0,
        script: PQ_ASSET.script,
        satoshis: 200000,
        value: 200000,
      },
    ],
    {
      "pq-asset-input": {
        seedKey: PQ_ASSET.seedKey,
      },
    },
    {
      debug: (event) => debugEvents.push(event),
    }
  );

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
        step: "authscript-template",
        i: 1,
        authType: 1,
        witnessScriptHex: "51",
      }),
      expect.objectContaining({
        step: "witness-set",
        i: 1,
        witnessItems: 4,
      }),
      expect.objectContaining({
        step: "final-inputs",
        inputs: expect.arrayContaining([
          expect.objectContaining({ i: 0, witnessItems: 0 }),
          expect.objectContaining({ i: 1, witnessItems: 4 }),
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

test("Verify NoAuth (authType=0x00) signing with OP_TRUE", () => {
  const tx = new bitcoin.Transaction();
  tx.version = 2;
  tx.addInput(Buffer.from("44".repeat(32), "hex").reverse(), 0);
  tx.addOutput(Buffer.from("76a91409f2017224efdaf3633d26b1cf11a1df418496f688ac", "hex"), 90000);

  const signedHex = Signer.sign(
    "xna-pq-test",
    tx.toHex(),
    [
      {
        address: "noauth-vault",
        assetName: "XNA",
        txid: "44".repeat(32),
        outputIndex: 0,
        script: NOAUTH_SIMPLE.script,
        satoshis: 100000,
        value: 100000,
      },
    ],
    {
      "noauth-vault": {
        authType: 0,
      },
    }
  );

  const signedTx = bitcoin.Transaction.fromHex(signedHex);
  const witness = signedTx.ins[0].witness;

  expect(signedTx.ins[0].script.length).toBe(0);
  expect(witness).toHaveLength(2);
  expect(witness[0].equals(Buffer.from([0x00]))).toBe(true);
  expect(witness[1].equals(Buffer.from([bitcoin.opcodes.OP_TRUE]))).toBe(true);
});

test("Verify NoAuth (authType=0x00) signing with covenant witnessScript and functionalArgs", () => {
  const tx = new bitcoin.Transaction();
  tx.version = 2;
  tx.addInput(Buffer.from("55".repeat(32), "hex").reverse(), 0);
  tx.addOutput(Buffer.from("76a91409f2017224efdaf3633d26b1cf11a1df418496f688ac", "hex"), 90000);

  const signedHex = Signer.sign(
    "xna-pq-test",
    tx.toHex(),
    [
      {
        address: "covenant-output",
        assetName: "XNA",
        txid: "55".repeat(32),
        outputIndex: 0,
        script: NOAUTH_COVENANT.script,
        satoshis: 100000,
        value: 100000,
      },
    ],
    {
      "covenant-output": {
        authType: 0,
        witnessScript: NOAUTH_COVENANT.witnessScript,
        functionalArgs: ["deadbeef"],
      },
    }
  );

  const signedTx = bitcoin.Transaction.fromHex(signedHex);
  const witness = signedTx.ins[0].witness;

  expect(signedTx.ins[0].script.length).toBe(0);
  expect(witness).toHaveLength(3);
  expect(witness[0].equals(Buffer.from([0x00]))).toBe(true);
  expect(witness[1].equals(Buffer.from("deadbeef", "hex"))).toBe(true);
  expect(witness[2].toString("hex")).toBe(NOAUTH_COVENANT.witnessScript);
});

test("Verify Legacy AuthScript (authType=0x02) signing with OP_TRUE", () => {
  const tx = new bitcoin.Transaction();
  tx.version = 2;
  tx.addInput(Buffer.from("66".repeat(32), "hex").reverse(), 0);
  tx.addOutput(Buffer.from("76a91409f2017224efdaf3633d26b1cf11a1df418496f688ac", "hex"), 90000);

  const signedHex = Signer.sign(
    "xna-test",
    tx.toHex(),
    [
      {
        address: "legacy-authscript-addr",
        assetName: "XNA",
        txid: "66".repeat(32),
        outputIndex: 0,
        script: LEGACY_AUTHSCRIPT.script,
        satoshis: 100000,
        value: 100000,
      },
    ],
    {
      "legacy-authscript-addr": {
        WIF: LEGACY_AUTHSCRIPT.WIF,
        authType: 2,
      },
    }
  );

  const signedTx = bitcoin.Transaction.fromHex(signedHex);
  const witness = signedTx.ins[0].witness;

  expect(signedTx.ins[0].script.length).toBe(0);
  expect(witness).toHaveLength(4);
  expect(witness[0].equals(Buffer.from([0x02]))).toBe(true);
  expect(witness[1][witness[1].length - 1]).toBe(bitcoin.Transaction.SIGHASH_ALL);
  expect(witness[2].toString("hex")).toBe(LEGACY_AUTHSCRIPT.pubkey);
  expect(witness[3].equals(Buffer.from([bitcoin.opcodes.OP_TRUE]))).toBe(true);
});

test("Verify Legacy AuthScript (authType=0x02) signing with covenant witnessScript", () => {
  const tx = new bitcoin.Transaction();
  tx.version = 2;
  tx.addInput(Buffer.from("77".repeat(32), "hex").reverse(), 0);
  tx.addOutput(Buffer.from("76a91409f2017224efdaf3633d26b1cf11a1df418496f688ac", "hex"), 90000);

  const signedHex = Signer.sign(
    "xna-test",
    tx.toHex(),
    [
      {
        address: "legacy-covenant-addr",
        assetName: "XNA",
        txid: "77".repeat(32),
        outputIndex: 0,
        script: LEGACY_AUTHSCRIPT_COVENANT.script,
        satoshis: 100000,
        value: 100000,
      },
    ],
    {
      "legacy-covenant-addr": {
        WIF: LEGACY_AUTHSCRIPT_COVENANT.WIF,
        authType: 2,
        witnessScript: LEGACY_AUTHSCRIPT_COVENANT.witnessScript,
        functionalArgs: ["cafe"],
      },
    }
  );

  const signedTx = bitcoin.Transaction.fromHex(signedHex);
  const witness = signedTx.ins[0].witness;

  expect(signedTx.ins[0].script.length).toBe(0);
  expect(witness).toHaveLength(5);
  expect(witness[0].equals(Buffer.from([0x02]))).toBe(true);
  expect(witness[1][witness[1].length - 1]).toBe(bitcoin.Transaction.SIGHASH_ALL);
  expect(witness[2].toString("hex")).toBe(LEGACY_AUTHSCRIPT_COVENANT.pubkey);
  expect(witness[3].equals(Buffer.from("cafe", "hex"))).toBe(true);
  expect(witness[4].toString("hex")).toBe(LEGACY_AUTHSCRIPT_COVENANT.witnessScript);
});

test("Verify mixed transaction: Legacy P2PKH + NoAuth + PQ AuthScript", () => {
  const tx = new bitcoin.Transaction();
  tx.version = 2;
  tx.addInput(Buffer.from("22".repeat(32), "hex").reverse(), 1);
  tx.addInput(Buffer.from("44".repeat(32), "hex").reverse(), 0);
  tx.addInput(Buffer.from("11".repeat(32), "hex").reverse(), 0);
  tx.addOutput(Buffer.from("76a9141239cd8e03d180a55b75763f9ef7424b7e2eee8f88ac", "hex"), 300000);

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
        address: "noauth-vault",
        assetName: "XNA",
        txid: "44".repeat(32),
        outputIndex: 0,
        script: NOAUTH_SIMPLE.script,
        satoshis: 100000,
        value: 100000,
      },
      {
        address: "pq-input-1",
        assetName: "XNA",
        txid: "11".repeat(32),
        outputIndex: 0,
        script: PQ_SIMPLE.script,
        satoshis: 150000,
        value: 150000,
      },
    ],
    {
      mgRYHdMqD1gwm9QQqBRUPcDKdEZ9oVeChA:
        "cVP9mzcDqMzWDhekiKMWKqEy739Cp6rKDT4tbG4wXXVfopMfTiBW",
      "noauth-vault": {
        authType: 0,
      },
      "pq-input-1": {
        seedKey: PQ_SIMPLE.seedKey,
      },
    }
  );

  const signedTx = bitcoin.Transaction.fromHex(signedHex);

  // Input 0: Legacy P2PKH
  expect(signedTx.ins[0].script.length).toBeGreaterThan(0);
  expect(signedTx.ins[0].witness).toHaveLength(0);

  // Input 1: NoAuth
  expect(signedTx.ins[1].script.length).toBe(0);
  expect(signedTx.ins[1].witness).toHaveLength(2);
  expect(signedTx.ins[1].witness[0].equals(Buffer.from([0x00]))).toBe(true);

  // Input 2: PQ AuthScript
  expect(signedTx.ins[2].script.length).toBe(0);
  expect(signedTx.ins[2].witness).toHaveLength(4);
  expect(signedTx.ins[2].witness[0].equals(Buffer.from([0x01]))).toBe(true);
});

test("Verify PQ AuthScript signing with covenant witnessScript and functionalArgs", () => {
  const tx = new bitcoin.Transaction();
  tx.version = 2;
  tx.addInput(Buffer.from("88".repeat(32), "hex").reverse(), 0);
  tx.addOutput(Buffer.from("76a91409f2017224efdaf3633d26b1cf11a1df418496f688ac", "hex"), 90000);

  const signedHex = Signer.sign(
    "xna-pq-test",
    tx.toHex(),
    [
      {
        address: "pq-covenant-addr",
        assetName: "XNA",
        txid: "88".repeat(32),
        outputIndex: 0,
        script: PQ_COVENANT.script,
        satoshis: 100000,
        value: 100000,
      },
    ],
    {
      "pq-covenant-addr": {
        seedKey: PQ_COVENANT.seedKey,
        witnessScript: PQ_COVENANT.witnessScript,
        functionalArgs: ["abcd1234"],
      },
    }
  );

  const signedTx = bitcoin.Transaction.fromHex(signedHex);
  const witness = signedTx.ins[0].witness;

  expect(signedTx.ins[0].script.length).toBe(0);
  expect(witness).toHaveLength(5);
  expect(witness[0].equals(Buffer.from([0x01]))).toBe(true);
  expect(witness[1][witness[1].length - 1]).toBe(bitcoin.Transaction.SIGHASH_ALL);
  expect(witness[2].toString("hex")).toBe(PQ_COVENANT.serializedPublicKey);
  expect(witness[3].equals(Buffer.from("abcd1234", "hex"))).toBe(true);
  expect(witness[4].toString("hex")).toBe(PQ_COVENANT.witnessScript);
});

test("Verify unsupported authType throws error", () => {
  const tx = new bitcoin.Transaction();
  tx.version = 2;
  tx.addInput(Buffer.from("44".repeat(32), "hex").reverse(), 0);
  tx.addOutput(Buffer.from("76a91409f2017224efdaf3633d26b1cf11a1df418496f688ac", "hex"), 90000);

  expect(() =>
    Signer.sign(
      "xna-pq-test",
      tx.toHex(),
      [
        {
          address: "bad-auth-addr",
          assetName: "XNA",
          txid: "44".repeat(32),
          outputIndex: 0,
          script: NOAUTH_SIMPLE.script,
          satoshis: 100000,
          value: 100000,
        },
      ],
      {
        "bad-auth-addr": {
          authType: 5,
        },
      }
    )
  ).toThrow("Unsupported authType 0x05");
});

test("Verify AuthScript commitment mismatch throws error", () => {
  const tx = new bitcoin.Transaction();
  tx.version = 2;
  tx.addInput(Buffer.from("44".repeat(32), "hex").reverse(), 0);
  tx.addOutput(Buffer.from("76a91409f2017224efdaf3633d26b1cf11a1df418496f688ac", "hex"), 90000);

  // Use PQ_SIMPLE script but provide NoAuth key — commitment won't match
  expect(() =>
    Signer.sign(
      "xna-pq-test",
      tx.toHex(),
      [
        {
          address: "mismatch-addr",
          assetName: "XNA",
          txid: "44".repeat(32),
          outputIndex: 0,
          script: PQ_SIMPLE.script,
          satoshis: 100000,
          value: 100000,
        },
      ],
      {
        "mismatch-addr": {
          authType: 0,
        },
      }
    )
  ).toThrow("AuthScript commitment mismatch");
});

test("Verify NoAuth signing is deterministic", () => {
  const tx = new bitcoin.Transaction();
  tx.version = 2;
  tx.addInput(Buffer.from("44".repeat(32), "hex").reverse(), 0);
  tx.addOutput(Buffer.from("76a91409f2017224efdaf3633d26b1cf11a1df418496f688ac", "hex"), 90000);

  const utxos = [
    {
      address: "noauth-vault",
      assetName: "XNA",
      txid: "44".repeat(32),
      outputIndex: 0,
      script: NOAUTH_SIMPLE.script,
      satoshis: 100000,
      value: 100000,
    },
  ];
  const keys = { "noauth-vault": { authType: 0 } };

  const hex1 = Signer.sign("xna-pq-test", tx.toHex(), utxos, keys);
  const hex2 = Signer.sign("xna-pq-test", tx.toHex(), utxos, keys);

  expect(hex1).toBe(hex2);
});

test("Verify Legacy AuthScript signing is deterministic", () => {
  const tx = new bitcoin.Transaction();
  tx.version = 2;
  tx.addInput(Buffer.from("66".repeat(32), "hex").reverse(), 0);
  tx.addOutput(Buffer.from("76a91409f2017224efdaf3633d26b1cf11a1df418496f688ac", "hex"), 90000);

  const utxos = [
    {
      address: "legacy-det",
      assetName: "XNA",
      txid: "66".repeat(32),
      outputIndex: 0,
      script: LEGACY_AUTHSCRIPT.script,
      satoshis: 100000,
      value: 100000,
    },
  ];
  const keys = { "legacy-det": { WIF: LEGACY_AUTHSCRIPT.WIF, authType: 2 } };

  const hex1 = Signer.sign("xna-test", tx.toHex(), utxos, keys);
  const hex2 = Signer.sign("xna-test", tx.toHex(), utxos, keys);

  expect(hex1).toBe(hex2);
});

test("Verify mixed transaction: Legacy P2PKH + NoAuth + PQ + Legacy AuthScript (all 4 types)", () => {
  const tx = new bitcoin.Transaction();
  tx.version = 2;
  tx.addInput(Buffer.from("22".repeat(32), "hex").reverse(), 1); // Legacy P2PKH
  tx.addInput(Buffer.from("44".repeat(32), "hex").reverse(), 0); // NoAuth
  tx.addInput(Buffer.from("11".repeat(32), "hex").reverse(), 0); // PQ AuthScript
  tx.addInput(Buffer.from("66".repeat(32), "hex").reverse(), 0); // Legacy AuthScript
  tx.addOutput(Buffer.from("76a9141239cd8e03d180a55b75763f9ef7424b7e2eee8f88ac", "hex"), 400000);

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
        address: "noauth-vault",
        assetName: "XNA",
        txid: "44".repeat(32),
        outputIndex: 0,
        script: NOAUTH_SIMPLE.script,
        satoshis: 100000,
        value: 100000,
      },
      {
        address: "pq-input-1",
        assetName: "XNA",
        txid: "11".repeat(32),
        outputIndex: 0,
        script: PQ_SIMPLE.script,
        satoshis: 150000,
        value: 150000,
      },
      {
        address: "legacy-authscript-addr",
        assetName: "XNA",
        txid: "66".repeat(32),
        outputIndex: 0,
        script: LEGACY_AUTHSCRIPT.script,
        satoshis: 100000,
        value: 100000,
      },
    ],
    {
      mgRYHdMqD1gwm9QQqBRUPcDKdEZ9oVeChA:
        "cVP9mzcDqMzWDhekiKMWKqEy739Cp6rKDT4tbG4wXXVfopMfTiBW",
      "noauth-vault": {
        authType: 0,
      },
      "pq-input-1": {
        seedKey: PQ_SIMPLE.seedKey,
      },
      "legacy-authscript-addr": {
        WIF: LEGACY_AUTHSCRIPT.WIF,
        authType: 2,
      },
    }
  );

  const signedTx = bitcoin.Transaction.fromHex(signedHex);

  // Input 0: Legacy P2PKH — scriptSig set, no witness
  expect(signedTx.ins[0].script.length).toBeGreaterThan(0);
  expect(signedTx.ins[0].witness).toHaveLength(0);

  // Input 1: NoAuth — empty scriptSig, witness [0x00, witnessScript]
  expect(signedTx.ins[1].script.length).toBe(0);
  expect(signedTx.ins[1].witness).toHaveLength(2);
  expect(signedTx.ins[1].witness[0].equals(Buffer.from([0x00]))).toBe(true);

  // Input 2: PQ AuthScript — empty scriptSig, witness [0x01, sig, pubkey, witnessScript]
  expect(signedTx.ins[2].script.length).toBe(0);
  expect(signedTx.ins[2].witness).toHaveLength(4);
  expect(signedTx.ins[2].witness[0].equals(Buffer.from([0x01]))).toBe(true);

  // Input 3: Legacy AuthScript — empty scriptSig, witness [0x02, sig, pubkey, witnessScript]
  expect(signedTx.ins[3].script.length).toBe(0);
  expect(signedTx.ins[3].witness).toHaveLength(4);
  expect(signedTx.ins[3].witness[0].equals(Buffer.from([0x02]))).toBe(true);
  expect(signedTx.ins[3].witness[2].toString("hex")).toBe(LEGACY_AUTHSCRIPT.pubkey);
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

// ─────────────────────────────────────────────────────────────────────────
// Covenant-cancel-legacy (partial-fill sell order, v2 plan Fase B.1)
// ─────────────────────────────────────────────────────────────────────────

const NeuraiScripts = require("@neuraiproject/neurai-scripts");
const ecpairMod = require("ecpair");
const ECPairFactoryCancel = ecpairMod.ECPairFactory || ecpairMod.default.ECPairFactory;
const eccCancel = require("@bitcoinerlab/secp256k1");
const ECPairCancel = ECPairFactoryCancel(eccCancel);

// Neurai testnet params (mirrors src/coins/xna.ts testnet).
const XNA_TESTNET = {
  messagePrefix: "\x16Neurai Signed Message:\n",
  bech32: "",
  bip32: { public: 0x043587cf, private: 0x04358394 },
  pubKeyHash: 127,
  scriptHash: 196,
  wif: 239,
};

function hash160Node(buffer) {
  return bitcoin.crypto.hash160(buffer);
}

function encodeAssetPayloadHex(assetName, amountRaw) {
  const name = Buffer.from(assetName, "ascii");
  const nameLen = Buffer.from([name.length]);
  const amt = Buffer.alloc(8);
  amt.writeBigUInt64LE(BigInt(amountRaw), 0);
  return Buffer.concat([
    Buffer.from([0x72, 0x76, 0x6e, 0x74]), // "rvn" + transfer marker
    nameLen,
    name,
    amt,
  ]).toString("hex");
}

function encodeWrappedSpkHex(prefixHex, payloadHex) {
  const payloadBuf = Buffer.from(payloadHex, "hex");
  if (payloadBuf.length > 0x4b) {
    throw new Error("payload too long for short push in test helper");
  }
  return (
    prefixHex +
    "c0" + // OP_XNA_ASSET
    payloadBuf.length.toString(16).padStart(2, "0") +
    payloadHex +
    "75" // OP_DROP
  );
}

function buildCancelFixture(opts) {
  const sellerKeyPair = opts.sellerKeyPair;
  const sellerPubkey = Buffer.from(sellerKeyPair.publicKey);
  const sellerPKH = hash160Node(sellerPubkey);

  // Build partial-fill covenant script (bare, no wrapper).
  // paymentAddress must be the seller's own P2PKH address — encode it
  // from the PKH using the xna-test network byte.
  const sellerP2PKHAddr = bitcoin.address.toBase58Check(sellerPKH, XNA_TESTNET.pubKeyHash);
  const covenantHex = NeuraiScripts.buildPartialFillScriptHex({
    sellerAddress: sellerP2PKHAddr,
    tokenId: "CAT",
    unitPriceSats: 100000000n,
  });

  // Wrap with asset payload.
  const payloadHex = encodeAssetPayloadHex("TREST", 10000000000n);
  const wrappedSpkHex = encodeWrappedSpkHex(covenantHex, payloadHex);

  // Build unsigned tx: 1 input from covenant UTXO, 1 output back to seller
  // with the same asset transfer wrapping a P2PKH (a minimal cancel shape).
  const prevTxid = Buffer.from("33".repeat(32), "hex");
  const unsignedTx = new bitcoin.Transaction();
  unsignedTx.version = 2;
  unsignedTx.locktime = 0;
  unsignedTx.addInput(prevTxid, 0, 0xfffffffe, Buffer.alloc(0));

  const sellerP2PKHSpk = bitcoin.script.compile([
    bitcoin.opcodes.OP_DUP,
    bitcoin.opcodes.OP_HASH160,
    sellerPKH,
    bitcoin.opcodes.OP_EQUALVERIFY,
    bitcoin.opcodes.OP_CHECKSIG,
  ]);
  const refundWrapped = Buffer.from(
    encodeWrappedSpkHex(sellerP2PKHSpk.toString("hex"), payloadHex),
    "hex"
  );
  unsignedTx.addOutput(refundWrapped, 1000);

  const rawUnsignedTx = unsignedTx.toHex();

  const sellerAddressLabel = "covenant-seller";
  return {
    network: "xna-test",
    rawUnsignedTx,
    covenantWrappedSpkHex: wrappedSpkHex,
    covenantPrefixHex: covenantHex,
    sellerAddressLabel,
    sellerKeyPair,
    sellerPubkey,
    sellerPKH,
    sellerP2PKHAddr,
    utxo: {
      address: sellerAddressLabel,
      assetName: "TREST",
      txid: prevTxid.reverse().toString("hex"),
      outputIndex: 0,
      script: wrappedSpkHex,
      satoshis: 10000000000,
      value: 10000000000,
      bareScriptHint: { kind: "covenant-cancel-legacy" },
    },
    privateKeys: { [sellerAddressLabel]: sellerKeyPair.toWIF() },
  };
}

test("Covenant cancel legacy — happy path", () => {
  const sellerKeyPair = ECPairCancel.makeRandom({ network: XNA_TESTNET });
  const fx = buildCancelFixture({ sellerKeyPair });

  const signedHex = Signer.sign(fx.network, fx.rawUnsignedTx, [fx.utxo], fx.privateKeys);
  const signedTx = bitcoin.Transaction.fromHex(signedHex);

  // scriptSig must decode to [sig, pubkey, OP_1]
  expect(signedTx.ins).toHaveLength(1);
  expect(signedTx.ins[0].witness).toHaveLength(0);
  const chunks = bitcoin.script.decompile(signedTx.ins[0].script);
  expect(chunks).not.toBeNull();
  expect(chunks).toHaveLength(3);
  const [sigChunk, pubChunk, opOne] = chunks;
  expect(Buffer.isBuffer(sigChunk)).toBe(true);
  expect(Buffer.isBuffer(pubChunk)).toBe(true);
  expect(pubChunk.equals(fx.sellerPubkey)).toBe(true);
  expect(opOne).toBe(bitcoin.opcodes.OP_1);

  // Signature must verify against the FULL wrapped scriptPubKey.
  const fullSpk = Buffer.from(fx.covenantWrappedSpkHex, "hex");
  const sighash = signedTx.hashForSignature(0, fullSpk, bitcoin.Transaction.SIGHASH_ALL);
  const sigDecoded = bitcoin.script.signature.decode(sigChunk);
  expect(sigDecoded.hashType).toBe(bitcoin.Transaction.SIGHASH_ALL);
  expect(sellerKeyPair.verify(sighash, sigDecoded.signature)).toBe(true);

  // Signing without the wrapper in the sighash must produce a different hash
  // → proves the wrapper bytes participate in sighash, per the plan §3.4.
  const sighashBare = signedTx.hashForSignature(
    0,
    Buffer.from(fx.covenantPrefixHex, "hex"),
    bitcoin.Transaction.SIGHASH_ALL
  );
  expect(sighash.equals(sighashBare)).toBe(false);
});

test("Covenant cancel legacy — rejects bare (non-wrapped) prevout", () => {
  const sellerKeyPair = ECPairCancel.makeRandom({ network: XNA_TESTNET });
  const fx = buildCancelFixture({ sellerKeyPair });
  const bareUtxo = { ...fx.utxo, script: fx.covenantPrefixHex };

  expect(() => Signer.sign(fx.network, fx.rawUnsignedTx, [bareUtxo], fx.privateKeys)).toThrow(
    /requires an asset-wrapped prevout/
  );
});

test("Covenant cancel legacy — rejects wrapper whose prefix is not a covenant", () => {
  const sellerKeyPair = ECPairCancel.makeRandom({ network: XNA_TESTNET });
  const fx = buildCancelFixture({ sellerKeyPair });

  // Build a prefix that is neither P2PKH (isLegacyScript) nor AuthScript
  // witness v1 (isPQScript) — starting with OP_IF like a covenant would,
  // but with a deliberately wrong body. This forces the hint branch to
  // run and `parsePartialFillScript` to fail.
  const malformedCovenantHex =
    "63" + // OP_IF
    "76a914" + fx.sellerPKH.toString("hex") + "88ac" + // dup hash160 <pkh> equalverify checksig
    "68"; // OP_ENDIF — missing the whole fill-branch body
  const wrappedBad = encodeWrappedSpkHex(
    malformedCovenantHex,
    encodeAssetPayloadHex("TREST", 10000000000n)
  );
  const badUtxo = { ...fx.utxo, script: wrappedBad };

  expect(() => Signer.sign(fx.network, fx.rawUnsignedTx, [badUtxo], fx.privateKeys)).toThrow(
    /not a recognized partial-fill covenant/
  );
});

test("Covenant cancel legacy — rejects when caller key does not match covenant sellerPKH", () => {
  const realSeller = ECPairCancel.makeRandom({ network: XNA_TESTNET });
  const fx = buildCancelFixture({ sellerKeyPair: realSeller });

  // Swap the WIF for a DIFFERENT random keypair but keep the address label
  // untouched — this simulates an attacker / misconfigured caller.
  const imposter = ECPairCancel.makeRandom({ network: XNA_TESTNET });
  const keys = { [fx.sellerAddressLabel]: imposter.toWIF() };

  expect(() => Signer.sign(fx.network, fx.rawUnsignedTx, [fx.utxo], keys)).toThrow(
    /does not match the covenant sellerPubKeyHash/
  );
});

test("Covenant cancel PQ hint — rejected as not implemented in 1.3.x", () => {
  const sellerKeyPair = ECPairCancel.makeRandom({ network: XNA_TESTNET });
  const fx = buildCancelFixture({ sellerKeyPair });
  const pqHintUtxo = {
    ...fx.utxo,
    bareScriptHint: { kind: "covenant-cancel-pq", txHashSelector: 0xff },
  };

  expect(() => Signer.sign(fx.network, fx.rawUnsignedTx, [pqHintUtxo], fx.privateKeys)).toThrow(
    /lands in @neuraiproject\/neurai-sign-transaction 1\.4\.0/
  );
});
