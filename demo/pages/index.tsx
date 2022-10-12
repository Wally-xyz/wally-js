import { useEffect, useRef, useState } from "react";
import detectEthereumProvider from '@metamask/detect-provider';
import { MetaMaskInpageProvider } from '@metamask/providers';

import { WallyConnector } from "../../dist";

import Connect from "components/connect";
import Sign from 'components/sign';

import styles from "styles/Home.module.css";


export default function Home() {
  const [provider, setProvider] = useState<MetaMaskInpageProvider>(null);
  const [address, setAddress] = useState(null);

  useEffect(() => {
    detectEthereumProvider().then(p => {
      if (p) {
        setProvider(p as MetaMaskInpageProvider);
      }
    });
  }, [])

  useEffect(() => {
    if (provider && provider.selectedAddress) {
      setAddress(provider.selectedAddress);
    }
  }, [provider])


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
      {address
        ? <Sign provider={provider} address={address}/>
        : <Connect
          provider={provider}
          setAddress={setAddress}
        />
      }
    </>
  );
}
