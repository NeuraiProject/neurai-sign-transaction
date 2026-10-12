import { sign } from "./shared";
import { signPsbt } from "./psbt";
declare const Signer: {
    sign: typeof sign;
    signPsbt: typeof signPsbt;
    SIGN_HASH_TYPES: Readonly<{
        readonly ALL: 1;
        readonly SINGLE_ANYONECANPAY: 131;
    }>;
};
export default Signer;
