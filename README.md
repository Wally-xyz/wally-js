## Wally Connector

Install the library

```
$ npm install wally
--- or ---
$ yarn wally
```

Import the init() function from the Wally library, and configure it with your clientID (available in the Wally dashboard on your app’s page).

\_app.tsx

```
import { init } from 'wally';

const MyApp: React.FC<LayoutProps> = ({ Component, pageProps }) => {
 if (typeof window !== 'undefined') {
   init({
     clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
   });
 }

 return ...
};

export default MyApp;
```

You’ll also need to set up an empty page route (inside your app) that corresponds to the redirect url you’ve set up in the dashboard. The purpose of this page is to accept the token from Wally and turn it into an auth token. The handleRedirect generates a sweet lookin’ page that automatically closes, and if you have some special redirect logic you can do that too to return the user to their previous location within your app.

pages/redirect-page/index.tsx

```
...
import { handleRedirect } from 'wally';

const HandleRedirect: React.FC = () => {
 if (typeof window !== 'undefined') {
   handleRedirect({
     closeWindow: true,
     appendContent: true,
   });
 }

 return null;
};

export default HandleRedirect;
```

Then, use the provider in the same manner you would use window.ethereum from metamask, or any other ethereum provider that matches the EIP-1193 spec. The most common way of connecting and getting started is by fetching the wallet address:

```
import { getProvider } from 'wally';

const wallyProvider = getProvider();

wallyProvider.request({ method: 'eth_requestAccounts' })
  .then((res) => {
    setAddress(res[0]);
  });
// ----- or ------
const web3 = new Web3(wallyProvider);
web3.eth.requestAccounts().then((res) => {
  setAddress(res[0]);
});
```

This will automatically prompt the login window (if not logged in to wally) and resolve the promise with the result. This login flow will also happen with any other request.

Once your provider is configured, the rest of your app should work exactly the same way that it might work with Metamask or WalletConnect and no other changes should be necessary.

The Wally SDK gets you up to speed in a matter of minutes, and with the Wally API you have tons of flexibility to modify the flow and hide Wally further in the background as needed.

Happy hacking!

---

# For Development

### Install

`yarn`

### Build

To build the `dist/` dir:

`npm run build`

#### For the Demo Project

To build and put it in the demo's `public/` dir

`npm run build:demo`

To watch:
`npm run build:demo:watch`

...check out the `README` in demo/ for the demo instructions
