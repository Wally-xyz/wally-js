import { WallyMethodName } from "./types";

export const APP_ROOT = 'https://api.wally.xyz/v1';

// TODO: Figure out the difference between sign & personal sign.
// There might be some prefixing deal in the spec, but right now
// both of them do. Will probably come back once we test this out
// in some real dApps.
export const WALLY_ROUTES: Record<WallyMethodName, string> = {
  [WallyMethodName.ACCOUNTS]: 'me',
  [WallyMethodName.REQUEST_ACCOUNTS]: 'me',
  [WallyMethodName.SIGN]: 'wallet/sign-message',
  [WallyMethodName.PERSONAL_SIGN]: 'wallet/sign-message',
  [WallyMethodName.SIGN_TYPED]: 'wallet/sign-typed-data',
  [WallyMethodName.SIGN_TYPED_V4]: 'wallet/sign-typed-data',
  [WallyMethodName.SIGN_TRANSACTION]: 'wallet/sign-transaction',
  [WallyMethodName.SEND_TRANSACTION]: 'wallet/send-transaction',
}
