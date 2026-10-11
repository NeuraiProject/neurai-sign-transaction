// Live vectors for every Neurai address type against a throwaway regtest node
// (the strict AuthScript families are active on regtest). Keys come from
// neurai-key 5, transactions are built with neurai-create-transaction and
// SIGNED BY THIS LIBRARY; the node only funds the addresses and validates the
// spends with testmempoolaccept before mining them.
//
// Node resolution: Docker container NEURAI_REGTEST_CONTAINER with the binaries
// NEURAI_REGTEST_CONTAINER_NEURAID / NEURAI_REGTEST_CONTAINER_CLI, or local
// binaries NEURAID_BIN / NEURAI_CLI_BIN; otherwise the suite is skipped. The
// node must know the nc / pq / nq prefixes (Neurai-DePIN 00f9a3b or later).
//
//   NEURAI_REGTEST_CONTAINER=... npm run test:regtest
const { execFileSync } = require("child_process");
const fs = require("fs");
const bitcoin = require("bitcoinjs-lib");
const NeuraiKey = require("@neuraiproject/neurai-key");
const CT = require("@neuraiproject/neurai-create-transaction");
const Scripts = require("@neuraiproject/neurai-scripts");
const Signer = require("./dist/index.cjs");

const CONTAINER = process.env.NEURAI_REGTEST_CONTAINER || "";
const CONTAINER_NEURAID = process.env.NEURAI_REGTEST_CONTAINER_NEURAID || "/root/Neurai/src/neuraid";
const CONTAINER_CLI = process.env.NEURAI_REGTEST_CONTAINER_CLI || "/root/Neurai/src/neurai-cli";
const LOCAL_NEURAID = process.env.NEURAID_BIN || "";
const LOCAL_CLI = process.env.NEURAI_CLI_BIN || "";

function dockerAvailable() {
  if (!CONTAINER) return false;
  try {
    return (
      execFileSync("docker", ["inspect", "-f", "{{.State.Running}}", CONTAINER], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim() === "true"
    );
  } catch {
    return false;
  }
}

const MODE = dockerAvailable()
  ? "docker"
  : LOCAL_NEURAID && LOCAL_CLI && fs.existsSync(LOCAL_NEURAID) && fs.existsSync(LOCAL_CLI)
    ? "local"
    : "skip";

const RPC_PORT = 22000 + (process.pid % 9000);
const DATADIR = `/tmp/neurai-sign-regtest-${process.pid}`;
const NODE_ARGS = ["-regtest", `-datadir=${DATADIR}`, "-rpcuser=t", "-rpcpassword=t", `-rpcport=${RPC_PORT}`];
const FEE_RATE_SATS_PER_VBYTE = 1100n; // above the 0.01 XNA/kB relay minimum

function sh(args, allowFail = false) {
  const [bin, ...rest] = MODE === "docker" ? ["docker", "exec", CONTAINER, ...args] : args;
  try {
    return execFileSync(bin, rest, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  } catch (error) {
    if (allowFail) return "";
    throw error;
  }
}
const cli = (...args) => sh([MODE === "docker" ? CONTAINER_CLI : LOCAL_CLI, ...NODE_ARGS, ...args.map(String)]);
const cliJson = (...args) => JSON.parse(cli(...args));

const MNEMONIC = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
const WALLETS = {
  legacy: NeuraiKey.getAddressPair("xna-legacy-test", MNEMONIC, 0, 0).external,
  authscriptPQ: NeuraiKey.getPQAuthScriptAddress("xna-authscript-test", MNEMONIC, 0, 0),
  pq: NeuraiKey.getPQAddress("xna-pq-test", MNEMONIC, 0, 0),
  ecdsa: NeuraiKey.getAddressByPath("xna-test", NeuraiKey.getHDKey("xna-test", MNEMONIC), "m/84'/1'/0'/0/0"),
};
const PRIVATE_KEYS = Object.fromEntries(Object.values(WALLETS).map((w) => [w.address, w]));

function utxosOf(address, assetName) {
  const query = assetName ? { addresses: [address], assetName } : { addresses: [address] };
  return cliJson("getaddressutxos", JSON.stringify(query)).map((u) => ({
    address: u.address,
    assetName: u.assetName,
    txid: u.txid,
    outputIndex: u.outputIndex,
    script: u.script,
    satoshis: u.satoshis,
    value: u.satoshis,
  }));
}

function xnaUtxo(address) {
  const [utxo] = utxosOf(address).filter((u) => u.assetName === "XNA");
  if (!utxo) throw new Error(`no XNA utxo at ${address}`);
  return utxo;
}

function feeFor(rawTx, utxos) {
  return BigInt(Signer.estimateVirtualSize("xna-test", rawTx, utxos)) * FEE_RATE_SATS_PER_VBYTE;
}

// Build with a provisional fee, then rebuild with the fee for the estimated size.
function buildPayment(utxos, destination) {
  const total = utxos.reduce((sum, u) => sum + BigInt(u.satoshis), 0n);
  const make = (fee) =>
    CT.createPaymentTransaction({
      inputs: utxos.map((u) => ({ txid: u.txid, vout: u.outputIndex })),
      payments: [{ address: destination, valueSats: total - fee }],
    }).rawTx;
  return make(feeFor(make(100000n), utxos));
}

function signAndTest(rawTx, utxos) {
  const signedHex = Signer.sign("xna-test", rawTx, utxos, PRIVATE_KEYS);
  const [result] = cliJson("testmempoolaccept", JSON.stringify([signedHex]), "true");
  return { allowed: Boolean(result.allowed), reason: result["reject-reason"], hex: signedHex };
}

function sendAndMine(hex) {
  const txid = cli("sendrawtransaction", hex, "true");
  cli("generate", 1);
  return txid;
}

// ─── Partial-fill covenant helpers ──────────────────────────────────────────
// Covenant orders hold an asset in a NoAuth AuthScript v1 output whose
// witnessScript is the covenant. Fees are a flat 0.05 XNA: every transaction
// here is far below 5 kB, so it clears the 0.01 XNA/kB relay minimum.
const COIN = 100000000n;
const COVENANT_FEE = 5000000n;
const assetMarker = () => cliJson("getblockchaininfo").asset_marker;

function covenantAddress(covenantHex) {
  return NeuraiKey.getNoAuthAddress("xna-authscript-test", {
    witnessScript: Buffer.from(covenantHex, "hex"),
  }).address;
}

function topUp(address, xna = 20) {
  cli("sendtoaddress", address, xna);
  cli("generate", 1);
}

function assetUtxo(address, assetName, minRaw) {
  const utxo = utxosOf(address, assetName).find((u) => BigInt(u.satoshis) >= minRaw);
  if (!utxo) throw new Error(`no ${assetName} utxo >= ${minRaw} at ${address}`);
  return utxo;
}

function xnaUtxoAtLeast(address, minSats) {
  const utxo = utxosOf(address).find((u) => u.assetName === "XNA" && BigInt(u.satoshis) >= minSats);
  if (!utxo) throw new Error(`no XNA utxo >= ${minSats} at ${address}`);
  return utxo;
}

/** Lock `amountRaw` of `assetName` held by `seller` into a new covenant order. */
function fundOrder(seller, assetName, amountRaw, covenantHex) {
  const asset = assetUtxo(seller.address, assetName, amountRaw);
  const fees = xnaUtxoAtLeast(seller.address, COVENANT_FEE);
  const marker = assetMarker();
  const outputs = [CT.createAssetTransferOutput(covenantAddress(covenantHex), assetName, amountRaw, { assetMarker: marker })];
  const assetChange = BigInt(asset.satoshis) - amountRaw;
  if (assetChange > 0n) {
    outputs.push(CT.createAssetTransferOutput(seller.address, assetName, assetChange, { assetMarker: marker }));
  }
  outputs.push(CT.createXnaOutput(seller.address, BigInt(fees.satoshis) - COVENANT_FEE));
  const rawTx = CT.createUnsignedTransaction({
    inputs: [asset, fees].map((u) => ({ txid: u.txid, vout: u.outputIndex })),
    outputs,
  });
  const result = signAndTest(rawTx, [asset, fees]);
  if (!result.allowed) throw new Error(`fund reject: ${result.reason}`);
  const txid = sendAndMine(result.hex);
  const order = utxosOf(covenantAddress(covenantHex), assetName).find((u) => u.txid === txid);
  if (!order) throw new Error("funded order not found");
  return order;
}

/**
 * Build and sign a fill. `inputsBefore` lets a test place foreign inputs
 * ahead of the order; `orders` are the covenant inputs, each with the fill
 * amount its witness claims; `outputs` are the asset/XNA outputs in order,
 * before the buyer's change.
 */
function signFill({ inputsBefore = [], orders, covenantHex, buyer, outputs }) {
  const paid = outputs.reduce((sum, o) => sum + o.valueSats, 0n);
  const fees = xnaUtxoAtLeast(buyer.address, paid + COVENANT_FEE);
  const inputs = [...inputsBefore, ...orders.map((o) => o.utxo), fees];
  const change = BigInt(fees.satoshis) - paid - COVENANT_FEE;
  const rawTx = CT.createUnsignedTransaction({
    inputs: inputs.map((u) => ({ txid: u.txid, vout: u.outputIndex })),
    outputs: [...outputs, CT.createXnaOutput(buyer.address, change)],
  });
  // An order at input 0 is filled through the signer's covenant-fill hint.
  // The signer refuses any other index, so an order placed elsewhere (the
  // attacks below) gets its fill witness attached directly, as an attacker
  // with their own tooling would; the signer leaves that input untouched.
  const orderIndex = (k) => inputsBefore.length + k;
  const hintedOrders = orders
    .filter((_, k) => orderIndex(k) === 0)
    .map((o) => ({
      ...o.utxo,
      bareScriptHint: { kind: "covenant-fill", covenantScriptHex: covenantHex, amount: o.amount },
    }));
  const signed = bitcoin.Transaction.fromHex(
    Signer.sign("xna-test", rawTx, [...inputsBefore, ...hintedOrders, fees], PRIVATE_KEYS)
  );
  orders.forEach((o, k) => {
    if (orderIndex(k) === 0) return;
    const stack = Scripts.buildAuthScriptWitnessNoAuth({
      args: Scripts.buildFillWitnessStack(o.amount, BigInt(o.utxo.satoshis)),
      witnessScript: Buffer.from(covenantHex, "hex"),
    });
    signed.setWitness(orderIndex(k), stack.map((item) => Buffer.from(item)));
  });
  const signedHex = signed.toHex();
  const [result] = cliJson("testmempoolaccept", JSON.stringify([signedHex]), "true");
  return { allowed: Boolean(result.allowed), reason: result["reject-reason"], hex: signedHex };
}

describe.skipIf(MODE === "skip")("every address type, signed by this library, accepted by the node", () => {
  beforeAll(async () => {
    const neuraid = MODE === "docker" ? CONTAINER_NEURAID : LOCAL_NEURAID;
    sh(["rm", "-rf", DATADIR]);
    sh(["mkdir", "-p", DATADIR]);
    sh([neuraid, ...NODE_ARGS, "-daemon", "-server=1", "-listen=0", "-assetindex=1", "-addressindex=1", `-port=${RPC_PORT + 1}`]);
    let ready = false;
    for (let attempt = 0; attempt < 120 && !ready; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      try {
        cli("getblockcount");
        ready = true;
      } catch {
        // RPC not up yet
      }
    }
    if (!ready) throw new Error("neuraid did not come up");
    cli("generate", 120);
    for (const wallet of Object.values(WALLETS)) {
      const info = cliJson("validateaddress", wallet.address);
      if (!info.isvalid) throw new Error(`node rejects ${wallet.address}`);
      for (let i = 0; i < 3; i += 1) cli("sendtoaddress", wallet.address, 10);
    }
    cli("generate", 1);
  }, 180_000);

  afterAll(() => {
    try {
      cli("stop");
    } catch {
      // daemon already gone
    }
    sh(["rm", "-rf", DATADIR], true);
  });

  it.each(Object.keys(WALLETS))("spends a %s input on its own", (kind) => {
    const utxo = xnaUtxo(WALLETS[kind].address);
    const result = signAndTest(buildPayment([utxo], WALLETS.legacy.address), [utxo]);
    expect(result.allowed, `reject: ${result.reason}`).toBe(true);
    const decoded = cliJson("decoderawtransaction", result.hex);
    if (kind === "legacy") {
      expect(decoded.vin[0].txinwitness ?? []).toEqual([]);
    } else {
      expect(decoded.vin[0].txinwitness.length).toBe(4);
    }
    sendAndMine(result.hex);
  }, 60_000);

  it("spends P2PKH, AuthScript v1, PQ v2 and ECDSA v3 inputs together, within the size estimate", () => {
    const utxos = ["legacy", "authscriptPQ", "pq", "ecdsa"].map((kind) => xnaUtxo(WALLETS[kind].address));
    const rawTx = buildPayment(utxos, WALLETS.pq.address);
    const result = signAndTest(rawTx, utxos);
    expect(result.allowed, `reject: ${result.reason}`).toBe(true);
    const decoded = cliJson("decoderawtransaction", result.hex);
    const estimate = Signer.estimateVirtualSize("xna-test", rawTx, utxos);
    expect(estimate).toBeGreaterThanOrEqual(decoded.vsize);
    expect(estimate - decoded.vsize).toBeLessThanOrEqual(3);
    expect(decoded.vout[0].scriptPubKey.type).toBe("witness_v2_strict_pq");
    sendAndMine(result.hex);
  }, 60_000);

  it("moves an asset held by a strict ECDSA address to a strict PQ address", () => {
    cli("issue", "STRICTSIGN", 1000, WALLETS.ecdsa.address);
    cli("generate", 1);
    const [asset] = utxosOf(WALLETS.ecdsa.address, "STRICTSIGN");
    const fees = xnaUtxo(WALLETS.pq.address);
    const utxos = [asset, fees];
    const make = (fee) =>
      CT.createStandardAssetTransferTransaction({
        assetMarker: cliJson("getblockchaininfo").asset_marker,
        inputs: utxos.map((u) => ({ txid: u.txid, vout: u.outputIndex })),
        transfers: [
          { address: WALLETS.pq.address, assetName: "STRICTSIGN", amountRaw: 400n * 100000000n },
          { address: WALLETS.ecdsa.address, assetName: "STRICTSIGN", amountRaw: 600n * 100000000n },
        ],
        payments: [{ address: WALLETS.pq.address, valueSats: BigInt(fees.satoshis) - fee }],
      }).rawTx;
    const rawTx = make(feeFor(make(100000n), utxos));
    const result = signAndTest(rawTx, utxos);
    expect(result.allowed, `reject: ${result.reason}`).toBe(true);
    sendAndMine(result.hex);
    expect(cliJson("listassetbalancesbyaddress", WALLETS.pq.address).STRICTSIGN).toBe(400);
    expect(cliJson("listassetbalancesbyaddress", WALLETS.ecdsa.address).STRICTSIGN).toBe(600);

    // And back from the strict PQ asset output.
    const [pqAsset] = utxosOf(WALLETS.pq.address, "STRICTSIGN");
    const pqFees = xnaUtxo(WALLETS.ecdsa.address);
    const back = CT.createStandardAssetTransferTransaction({
      assetMarker: cliJson("getblockchaininfo").asset_marker,
      inputs: [pqAsset, pqFees].map((u) => ({ txid: u.txid, vout: u.outputIndex })),
      transfers: [{ address: WALLETS.authscriptPQ.address, assetName: "STRICTSIGN", amountRaw: 400n * 100000000n }],
      payments: [{ address: WALLETS.ecdsa.address, valueSats: BigInt(pqFees.satoshis) - 2000000n }],
    }).rawTx;
    const backResult = signAndTest(back, [pqAsset, pqFees]);
    expect(backResult.allowed, `reject: ${backResult.reason}`).toBe(true);
    sendAndMine(backResult.hex);
    expect(cliJson("listassetbalancesbyaddress", WALLETS.authscriptPQ.address).STRICTSIGN).toBe(400);
  }, 90_000);

  it("cancels a PQ covenant with the node's NIP-042 OP_TXHASH", () => {
    const pqKey = WALLETS.authscriptPQ;
    const serializedPubKey = Buffer.concat([
      Buffer.from([0x05]),
      Buffer.from(pqKey.publicKey, "hex"),
    ]);
    const pubKeyCommitment = bitcoin.crypto.sha256(serializedPubKey);
    const covenantHex = Scripts.buildPartialFillScriptPQHex({
      paymentAddress: WALLETS.legacy.address,
      pubKeyCommitment: new Uint8Array(pubKeyCommitment),
      tokenId: "CANCELTEST",
      unitPriceSats: 100000000n,
    });
    expect(covenantHex).toContain("8802ff01b5");
    const covenant = NeuraiKey.getNoAuthAddress("xna-authscript-test", {
      witnessScript: Buffer.from(covenantHex, "hex"),
    });
    cli("sendtoaddress", covenant.address, 2);
    cli("generate", 1);
    const [funded] = utxosOf(covenant.address);
    expect(funded).toBeDefined();
    const rawTx = CT.createPaymentTransaction({
      inputs: [{ txid: funded.txid, vout: funded.outputIndex }],
      payments: [{
        address: WALLETS.legacy.address,
        valueSats: BigInt(funded.satoshis) - 2000000n,
      }],
    }).rawTx;
    const signedHex = Signer.sign("xna-test", rawTx, [{
      ...funded,
      bareScriptHint: { kind: "covenant-cancel-pq", covenantScriptHex: covenantHex },
    }], { [covenant.address]: { seedKey: pqKey.seedKey } });
    const [result] = cliJson("testmempoolaccept", JSON.stringify([signedHex]), "true");
    expect(Boolean(result.allowed), `PQ cancel reject: ${result["reject-reason"]}`).toBe(true);
    sendAndMine(signedHex);
  }, 90_000);

  it("fills an asset-funded ECDSA-cancel order partially and cancels the remainder", () => {
    const seller = WALLETS.legacy;
    const buyer = WALLETS.pq;
    topUp(seller.address);
    topUp(buyer.address);
    cli("issue", "FILLTEST", 1000, seller.address);
    cli("generate", 1);
    const expiration = { mode: "mtp", value: BigInt(cliJson("getblockchaininfo").mediantime + 86400) };
    const covenantHex = Scripts.buildPartialFillScriptHex({
      sellerAddress: seller.address,
      tokenId: "FILLTEST",
      unitPriceSats: 1n,
      expiration,
    });
    const marker = assetMarker();
    const order = fundOrder(seller, "FILLTEST", 10n * COIN, covenantHex);

    // Partial fill: 3 units for 3 XNA, 7 units continue under the covenant.
    const fill = signFill({
      orders: [{ utxo: order, amount: 3n * COIN }],
      covenantHex,
      buyer,
      outputs: [
        CT.createXnaOutput(seller.address, 3n * COIN),
        CT.createAssetTransferOutput(buyer.address, "FILLTEST", 3n * COIN, { assetMarker: marker }),
        CT.createAssetTransferOutput(covenantAddress(covenantHex), "FILLTEST", 7n * COIN, { assetMarker: marker }),
      ],
    });
    expect(fill.allowed, `partial fill reject: ${fill.reason}`).toBe(true);
    const fillTxid = sendAndMine(fill.hex);
    expect(cliJson("listassetbalancesbyaddress", buyer.address).FILLTEST).toBe(3);

    // The seller cancels the 7-unit continuation with the covenant's ECDSA key.
    const remainder = utxosOf(covenantAddress(covenantHex), "FILLTEST").find((u) => u.txid === fillTxid);
    const fees = xnaUtxoAtLeast(seller.address, COVENANT_FEE);
    const rawTx = CT.createUnsignedTransaction({
      inputs: [remainder, fees].map((u) => ({ txid: u.txid, vout: u.outputIndex })),
      outputs: [
        CT.createAssetTransferOutput(seller.address, "FILLTEST", 7n * COIN, { assetMarker: marker }),
        CT.createXnaOutput(seller.address, BigInt(fees.satoshis) - COVENANT_FEE),
      ],
    });
    const cancel = signAndTest(rawTx, [
      {
        ...remainder,
        address: seller.address,
        bareScriptHint: { kind: "covenant-cancel-legacy", covenantScriptHex: covenantHex },
      },
      fees,
    ]);
    expect(cancel.allowed, `cancel reject: ${cancel.reason}`).toBe(true);
    sendAndMine(cancel.hex);
    expect(utxosOf(covenantAddress(covenantHex), "FILLTEST")).toEqual([]);
  }, 120_000);

  it("rejects a fill whose input 0 is a foreign asset UTXO instead of the order", () => {
    // The buyer holds 3 FILLTEST from the previous test. Placing them at
    // input 0 must not let the order at input 1 price the fill as 3 units.
    const seller = WALLETS.legacy;
    const buyer = WALLETS.pq;
    const covenantHex = Scripts.buildPartialFillScriptHex({
      sellerAddress: seller.address,
      tokenId: "FILLTEST",
      unitPriceSats: 1n,
    });
    const marker = assetMarker();
    const order = fundOrder(seller, "FILLTEST", 100n * COIN, covenantHex);
    const foreign = assetUtxo(buyer.address, "FILLTEST", 1n * COIN);
    const foreignRaw = BigInt(foreign.satoshis);
    const attack = signFill({
      inputsBefore: [foreign],
      orders: [{ utxo: order, amount: 100n * COIN }], // full-fill witness
      covenantHex,
      buyer,
      outputs: [
        CT.createXnaOutput(seller.address, foreignRaw), // pays for the foreign units only
        CT.createAssetTransferOutput(buyer.address, "FILLTEST", foreignRaw, { assetMarker: marker }),
        CT.createAssetTransferOutput(buyer.address, "FILLTEST", 100n * COIN, { assetMarker: marker }),
      ],
    });
    expect(attack.allowed, "the order was drained for the price of the foreign input").toBe(false);
    expect(attack.reason).toMatch(/OP_EQUALVERIFY/);
  }, 120_000);

  it("rejects one payment settling two identical orders of the same seller", () => {
    const seller = WALLETS.legacy;
    const buyer = WALLETS.pq;
    const covenantHex = Scripts.buildPartialFillScriptHex({
      sellerAddress: seller.address,
      tokenId: "FILLTEST",
      unitPriceSats: 1n,
    });
    const marker = assetMarker();
    const first = fundOrder(seller, "FILLTEST", 5n * COIN, covenantHex);
    const second = fundOrder(seller, "FILLTEST", 5n * COIN, covenantHex);
    const attack = signFill({
      orders: [
        { utxo: first, amount: 5n * COIN },
        { utxo: second, amount: 5n * COIN },
      ],
      covenantHex,
      buyer,
      outputs: [
        CT.createXnaOutput(seller.address, 5n * COIN), // one payment for 5 units
        CT.createAssetTransferOutput(buyer.address, "FILLTEST", 5n * COIN, { assetMarker: marker }),
        CT.createAssetTransferOutput(buyer.address, "FILLTEST", 5n * COIN, { assetMarker: marker }),
      ],
    });
    expect(attack.allowed, "two orders were taken for one payment").toBe(false);
    expect(attack.reason).toMatch(/OP_EQUALVERIFY/);
  }, 120_000);

  it("pays a strict ECDSA v3 seller at its own address and lets its key cancel", () => {
    const seller = WALLETS.ecdsa;
    const buyer = WALLETS.legacy;
    topUp(seller.address);
    topUp(buyer.address);
    cli("issue", "ECDSAORDER", 100, seller.address);
    cli("generate", 1);
    const covenantHex = Scripts.buildPartialFillScriptHex({
      paymentAddress: seller.address,
      sellerPubKeyHash: new Uint8Array(bitcoin.crypto.hash160(Buffer.from(seller.publicKey, "hex"))),
      tokenId: "ECDSAORDER",
      unitPriceSats: 2n,
    });
    const marker = assetMarker();

    // Full fill: 4 units for 8 XNA, paid to the seller's nq1r address.
    const sold = fundOrder(seller, "ECDSAORDER", 4n * COIN, covenantHex);
    const fill = signFill({
      orders: [{ utxo: sold, amount: 4n * COIN }],
      covenantHex,
      buyer,
      outputs: [
        CT.createXnaOutput(seller.address, 8n * COIN),
        CT.createAssetTransferOutput(buyer.address, "ECDSAORDER", 4n * COIN, { assetMarker: marker }),
      ],
    });
    expect(fill.allowed, `full fill reject: ${fill.reason}`).toBe(true);
    const fillTxid = sendAndMine(fill.hex);
    expect(utxosOf(seller.address).some((u) => u.txid === fillTxid && BigInt(u.satoshis) === 8n * COIN)).toBe(true);

    // A second order goes back to the seller, signed by the v3 wallet key.
    const open = fundOrder(seller, "ECDSAORDER", 6n * COIN, covenantHex);
    const fees = xnaUtxoAtLeast(seller.address, COVENANT_FEE);
    const rawTx = CT.createUnsignedTransaction({
      inputs: [open, fees].map((u) => ({ txid: u.txid, vout: u.outputIndex })),
      outputs: [
        CT.createAssetTransferOutput(seller.address, "ECDSAORDER", 6n * COIN, { assetMarker: marker }),
        CT.createXnaOutput(seller.address, BigInt(fees.satoshis) - COVENANT_FEE),
      ],
    });
    const cancel = signAndTest(rawTx, [
      {
        ...open,
        address: seller.address,
        bareScriptHint: { kind: "covenant-cancel-legacy", covenantScriptHex: covenantHex },
      },
      fees,
    ]);
    expect(cancel.allowed, `v3 cancel reject: ${cancel.reason}`).toBe(true);
    sendAndMine(cancel.hex);
    expect(cliJson("listassetbalancesbyaddress", seller.address).ECDSAORDER).toBe(96);
  }, 120_000);

  it("fills an asset-funded PQ order and cancels the remainder with the seller's ML-DSA key", () => {
    const seller = WALLETS.pq;
    const buyer = WALLETS.legacy;
    topUp(seller.address);
    topUp(buyer.address);
    cli("issue", "PQORDER", 100, seller.address);
    cli("generate", 1);
    const serializedPubKey = Buffer.concat([Buffer.from([0x05]), Buffer.from(seller.publicKey, "hex")]);
    const covenantHex = Scripts.buildPartialFillScriptPQHex({
      paymentAddress: seller.address,
      pubKeyCommitment: new Uint8Array(bitcoin.crypto.sha256(serializedPubKey)),
      tokenId: "PQORDER",
      unitPriceSats: 1n,
    });
    const marker = assetMarker();
    const order = fundOrder(seller, "PQORDER", 10n * COIN, covenantHex);

    const fill = signFill({
      orders: [{ utxo: order, amount: 4n * COIN }],
      covenantHex,
      buyer,
      outputs: [
        CT.createXnaOutput(seller.address, 4n * COIN),
        CT.createAssetTransferOutput(buyer.address, "PQORDER", 4n * COIN, { assetMarker: marker }),
        CT.createAssetTransferOutput(covenantAddress(covenantHex), "PQORDER", 6n * COIN, { assetMarker: marker }),
      ],
    });
    expect(fill.allowed, `partial fill reject: ${fill.reason}`).toBe(true);
    const fillTxid = sendAndMine(fill.hex);

    const remainder = utxosOf(covenantAddress(covenantHex), "PQORDER").find((u) => u.txid === fillTxid);
    const fees = xnaUtxoAtLeast(seller.address, COVENANT_FEE);
    const rawTx = CT.createUnsignedTransaction({
      inputs: [remainder, fees].map((u) => ({ txid: u.txid, vout: u.outputIndex })),
      outputs: [
        CT.createAssetTransferOutput(seller.address, "PQORDER", 6n * COIN, { assetMarker: marker }),
        CT.createXnaOutput(seller.address, BigInt(fees.satoshis) - COVENANT_FEE),
      ],
    });
    const cancel = signAndTest(rawTx, [
      {
        ...remainder,
        address: seller.address,
        bareScriptHint: { kind: "covenant-cancel-pq", covenantScriptHex: covenantHex },
      },
      fees,
    ]);
    expect(cancel.allowed, `PQ cancel reject: ${cancel.reason}`).toBe(true);
    sendAndMine(cancel.hex);
    expect(cliJson("listassetbalancesbyaddress", seller.address).PQORDER).toBe(96);
  }, 120_000);

  it("rejects a strict ECDSA spend signed with the generic v1 sighash", () => {
    const utxo = xnaUtxo(WALLETS.ecdsa.address);
    const rawTx = buildPayment([utxo], WALLETS.legacy.address);
    const good = signAndTest(rawTx, [utxo]);
    expect(good.allowed).toBe(true);
    // Re-sign the same digest without the witness version byte (v1 domain).
    const tx = bitcoin.Transaction.fromHex(good.hex);
    const u32 = (n) => { const b = Buffer.alloc(4); b.writeUInt32LE(n >>> 0, 0); return b; };
    const u64 = (n) => { const b = Buffer.alloc(8); b.writeBigUInt64LE(BigInt(n), 0); return b; };
    const h = (b) => Buffer.from(bitcoin.crypto.hash256(b));
    const outpoint = Buffer.concat([Buffer.from(tx.ins[0].hash), u32(tx.ins[0].index)]);
    const version = Buffer.alloc(4);
    version.writeInt32LE(tx.version, 0);
    const v1Digest = h(Buffer.concat([
      version, h(outpoint), h(u32(tx.ins[0].sequence)), outpoint, Buffer.from([1, 0x51]), u64(utxo.satoshis),
      u32(tx.ins[0].sequence),
      h(Buffer.concat(tx.outs.map((o) => Buffer.concat([u64(o.value), Buffer.from([o.script.length]), o.script])))),
      u32(tx.locktime), Buffer.from([0x02]), u32(1),
    ]));
    const { ECPairFactory } = require("ecpair");
    const keyPair = ECPairFactory(require("@bitcoinerlab/secp256k1")).fromWIF(WALLETS.ecdsa.WIF, {
      ...bitcoin.networks.testnet, wif: 239,
    });
    const badSig = bitcoin.script.signature.encode(Buffer.from(keyPair.sign(v1Digest)), 1);
    tx.ins[0].witness[1] = Buffer.from(badSig);
    const [result] = cliJson("testmempoolaccept", JSON.stringify([tx.toHex()]), "true");
    expect(Boolean(result.allowed)).toBe(false);
  }, 60_000);
});
