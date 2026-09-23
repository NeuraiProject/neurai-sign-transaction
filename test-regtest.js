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
