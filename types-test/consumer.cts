// CommonJS consumer: resolves the `require` condition (dist/index.d.ts,
// CommonJS because the package has no "type": "module"). Every value export
// is used, so a missing declaration fails to compile.
import st = require("@neuraiproject/neurai-sign-transaction");

export const values = [
  st.VBYTES, st.default, st.estimateInputVbytes, st.estimateOutputBytes,
  st.estimateTransactionVbytes, st.estimateVirtualSize, st.getAddressKind, st.getScriptKind,
  st.isPQAddress, st.isPQScript, st.sign,
];
// require() returns the exports object: `default` is the Signer object.
export const signFromDefault: typeof st.sign = st.default.sign;
export const kind: st.AddressKind = st.getScriptKind("5320" + "00".repeat(32));
export type Utxo = st.IUTXO;
