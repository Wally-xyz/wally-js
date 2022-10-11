import { useEffect, useRef, useState } from "react";

import { WallyConnector } from "../../dist";

import detectEthereumProvider from '@metamask/detect-provider';
import { MetaMaskInpageProvider } from '@metamask/providers';

import styles from "styles/Home.module.css";

const MetaMaskInfo = (props: any) => {

  const [provider, setProvider] = useState<MetaMaskInpageProvider>(null);
  const [addr, setAddr] = useState(null);

  useEffect(() => {
    detectEthereumProvider().then(p => {
      if (p) {
        setProvider(p as MetaMaskInpageProvider);
      }
    });
  }, [])

  useEffect(() => {
    if (provider && provider.selectedAddress) {
      setAddr(provider.selectedAddress);
    }
  }, [provider])

  if (!provider) {
    return null;
  }

  return (
    addr === null
      ? <button onClick={() => {
        provider.request({ method: 'eth_requestAccounts' }).then(res => {
          console.log({ res });
          setAddr(res[0]);
        })
      }}>Connect with MetaMask</button>
      : <h2>Connected at {addr}</h2>
  );
}

export default function Home() {
  const wallyConnector = useRef(
    new WallyConnector(
      process.env.NEXT_PUBLIC_CLIENT_ID,
      {
        isDevelopment: process.env.NEXT_PUBLIC_IS_DEVELOPMENT === 'true',
      }
    )
  );

  useEffect(() => {
    if (wallyConnector.current.isRedirected()) {
      wallyConnector.current.handleRedirect()
    }
  }, []);

  return (
    <>
      <h1 className={styles.title}>EasySign Demo</h1>
      {typeof window !== 'undefined' ? <MetaMaskInfo /> : null}
      <button
        onClick={() => {
          wallyConnector.current.loginWithEmail();
        }}
      >
        Login
      </button>
      <button
        onClick={async () => {
          console.log("stub");
          // const wallets = await wallyConnector.current.getWallets();
          // console.log("wallets = ", wallets);
        }}
      >
        Get Wallets
      </button>
    </>
  );
}
