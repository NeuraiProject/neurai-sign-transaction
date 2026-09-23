// Browser entry: `@neuraiproject/neurai-sign-transaction/browser` (ESM).
import Signer, { getScriptKind, type AddressKind } from "@neuraiproject/neurai-sign-transaction/browser";

export const signFromDefault = Signer.sign;
export const kind: AddressKind = getScriptKind("5220" + "00".repeat(32));
// @ts-expect-error getScriptKind is a named export, not a member of the default export
export const notOnDefault = Signer.getScriptKind;
