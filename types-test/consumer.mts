// ESM consumer (.mts is ESM whatever package.json#type says), compiled by
// `npm run test:types` against the built package (dist/index.d.mts) the way
// an ESM application imports it, with skipLibCheck: false.
import Signer, {
  estimateVirtualSize,
  getAddressKind,
  sign,
  VBYTES,
  type AddressKind,
  type IUTXO,
  type PrivateKeyInput,
  type SupportedNetwork,
} from "@neuraiproject/neurai-sign-transaction";

const network: SupportedNetwork = "xna-authscript-test";
const utxos: IUTXO[] = [];
const keys: Record<string, PrivateKeyInput> = {};
export const signFromDefault: typeof sign = Signer.sign;
export const signed = (raw: string): string => sign(network, raw, utxos, keys, { debug: false });
export const size = (raw: string): number => estimateVirtualSize(network, raw, utxos);
export const kind: AddressKind = getAddressKind("tpq1z5age5p2v5q9w6qzadkjp4yep8gpr56q6mzd4fu6eus8ntulul6vq3q07pc");
export const ecdsaInput: number = VBYTES.ecdsaWitnessInputVbytes;
// The ESM default export is the Signer object, which only has `sign`: the
// other functions are named exports. With CommonJS declarations on the
// `import` condition (up to 3.0.0) this line compiled and failed at runtime.
// @ts-expect-error getAddressKind is not a member of the default export
export const notOnDefault = Signer.getAddressKind;
