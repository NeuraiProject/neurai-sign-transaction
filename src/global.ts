import Signer, { sign } from "./shared";

declare global {
  interface Window {
    NeuraiSignTransaction?: typeof Signer;
  }

  interface Global {
    NeuraiSignTransaction?: typeof Signer;
  }
}

const globalTarget = globalThis as typeof globalThis & {
  NeuraiSignTransaction?: typeof Signer;
};

globalTarget.NeuraiSignTransaction = Signer;
void sign;
