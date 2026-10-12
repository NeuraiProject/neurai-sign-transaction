import { sign, SIGN_HASH_TYPES } from "./shared";
import { signPsbt } from "./psbt";

const Signer = {
  sign,
  signPsbt,
  SIGN_HASH_TYPES,
};

export default Signer;
