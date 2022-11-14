import { WallyMethodName } from "./types";

export const APP_ROOT = 'https://api.wally.xyz/v1';
export const REDIRECT_CAPTION_ID = 'wally-redirect-caption';
export const SCRIM_ID = 'wally-scrim';
export const SCRIM_TEXT_ID = 'wally-scrim-text';

export const getScrimElement = (): HTMLElement => {
  const scrim = document.createElement('div');
  scrim.id = SCRIM_ID;
  scrim.style.position = 'absolute';
  scrim.style.top = '0';
  scrim.style.left = '0';
  scrim.style.width = '100%';
  scrim.style.height = '100%';
  scrim.style.background = '#9995';

  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.width = '256px';
  container.style.height = '128px';
  container.style.background = '#CCC';
  container.style.margin = 'auto';
  container.style.top = '0';
  container.style.left = '0';
  container.style.right = '0';
  container.style.bottom = '0';
  container.style.borderRadius = '5px';
  container.style.boxShadow = '0px 3px 24px 3px #222c';

  const text = document.createElement('p');
  text.id = SCRIM_TEXT_ID;
  text.innerText = 'Logging in to Wally...';
  text.style.color = '#222';
  text.style.fontWeight = 'bold';
  text.style.textAlign = 'center';
  text.style.marginTop = '48px';

  const closeBtn = document.createElement('button');
  closeBtn.innerText = '×';
  closeBtn.style.position = 'absolute';
  closeBtn.style.top = '4px';
  closeBtn.style.right = '4px';
  closeBtn.style.fontSize = '24px';
  closeBtn.onclick = window.wally.onScrimCloseButton;

  container.appendChild(text);
  container.appendChild(closeBtn);
  scrim.appendChild(container);
  return scrim;
};

export const getRedirectPage = (): HTMLElement => {
  const containerEl = document.createElement('div');
  containerEl.style.position = 'absolute';
  containerEl.style.top = '50%';
  containerEl.style.left = '50%';
  containerEl.style.transform = 'translate(-50%, -50%)';
  containerEl.style.textAlign = 'center';

  const el = document.createElement('h1');
  el.innerText = 'Logging In To Wally';

  const img = document.createElement('img');
  img.src = '/logo.gif';
  img.width = 150;

  const caption = document.createElement('p');
  caption.id = REDIRECT_CAPTION_ID;
  caption.innerText = 'Fetching token...';
  caption.style.fontStyle = 'italic';

  containerEl.appendChild(el);
  containerEl.appendChild(img);
  containerEl.appendChild(caption);

  return containerEl;
};

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
