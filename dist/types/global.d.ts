import Signer from "./shared";
declare global {
    interface Window {
        NeuraiSignTransaction?: typeof Signer;
    }
    interface Global {
        NeuraiSignTransaction?: typeof Signer;
    }
}
