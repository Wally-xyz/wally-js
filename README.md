## Wally Connector

Install the library

```
$ npm install wally-sdk
--- or ---
$ yarn wally-sdk
```

Import the init() function from the Wally library, and configure it with your clientID (available in the Wally dashboard on your app’s page).

\_app.tsx

```js
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


You'll also need to make sure that the `worker.js` file is copied into a part of your application that can serve static files. In the demo, for example, we need to add this webpack plugin to our next.js config:

```js
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  // ...
  webpack: (config) => {
    config.plugins.push(
      new CopyPlugin({
        patterns: [
          {
            from: path.resolve(
              __dirname,
              'node_modules/wally-sdk/dist/worker.js'
            ),
            // this location will likely be different for your app
            to: path.resolve(__dirname, 'public/'),
          },
        ],
      })
    );
    return config;
  },
};
```

and add the project-dependent url to the `init()` options:

```js
init({
  clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
  // gets resolved to the public directory in next.js
  sharedWorkerUrl: '/worker.js',
});
```

Then, build the project and use the provider in the same manner you would use window.ethereum from metamask, or any other ethereum provider that matches the EIP-1193 spec. The most common way of connecting and getting started is by fetching the wallet address:

```js
import { getProvider } from 'wally';

const wallyProvider = getProvider();

wallyProvider.request({ method: 'eth_requestAccounts' }).then((res) => {
  setAddress(res[0]);
});
// ----- or ------
const web3 = new Web3(wallyProvider);
web3.eth.requestAccounts().then((res) => {
  setAddress(res[0]);
});
```

If not logged in to wally, this will automatically prompt the login window and resolve the promise with the result. This login flow will also happen with any other request. Alternatively, you can call `wallyProvider.login()` directly if you need more control over the login flow. See the `disableLoginOnRequest` option.

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

To watch:

`npm run watch`

...check out the `README` in demo/ folder for the demo instructions.

If the demo isn't picking up changes, you may need to run `yarn link` in this directory first.
