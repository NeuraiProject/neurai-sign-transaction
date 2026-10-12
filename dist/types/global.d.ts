import Signer from "./signer";
declare global {
    interface Window {
        NeuraiSignTransaction?: typeof Signer;
    }
    interface Global {
        NeuraiSignTransaction?: typeof Signer;
    }
}
