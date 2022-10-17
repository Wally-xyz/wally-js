import React, { useCallback, useEffect, useState } from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import { MetaMaskInpageProvider } from '@metamask/providers';

import { WallyConnector } from '../../dist';

import Connect from 'components/connect';
import Sign from 'components/sign';

import styles from 'styles/Home.module.css';

const Home: React.FC = () => {
  const [isUsingWally, setIsUsingWally] = useState(true);
  const [provider, setProvider] = useState<MetaMaskInpageProvider | any>(null);
  const [address, setAddress] = useState(null);
  const [isWallyLoggedIn, setIsWallyLoggedIn] = useState(false);

  const detectProvider = useCallback(() => {
    if (isUsingWally) {
      return Promise.resolve(
        new WallyConnector(process.env.NEXT_PUBLIC_CLIENT_ID, {
          isDevelopment: process.env.NEXT_PUBLIC_IS_DEVELOPMENT === 'true',
        })
      );
    } else {
      return detectEthereumProvider();
    }
  }, [isUsingWally]);

  useEffect(() => {
    detectProvider().then((p) => {
      if (p) {
        setProvider(p as MetaMaskInpageProvider);
      }
    });
  }, [isUsingWally]);

  useEffect(() => {
    if (provider && provider.selectedAddress) {
      setAddress(provider.selectedAddress);
    }
  }, [provider]);

  useEffect(() => {
    if (isUsingWally && provider && provider.isRedirected()) {
      provider.handleRedirect().then(() => {
        setIsWallyLoggedIn(true);
      });
    }
  }, [isUsingWally, provider]);

  useEffect(() => {
    if (
      isUsingWally &&
      provider &&
      provider.isLoggedIn &&
      provider.isLoggedIn()
    ) {
      setIsWallyLoggedIn(true);
    }
  }, [isUsingWally, provider]);

  const onWallyClick = () => {
    if (provider && provider.isLoggedIn && provider.isLoggedIn()) {
      setIsWallyLoggedIn(true);
    } else {
      provider.loginWithEmail();
    }
  };

  const onChange = (e) => {
    setIsUsingWally(e.target.value === 'wally');
    setProvider(null);
    setAddress(null);
    setIsWallyLoggedIn(false);
  };

  return (
    <>
      <h1 className={styles.title}>EasySign Demo</h1>
      <span>
        Use{' '}
        <input
          type="radio"
          name="provider"
          value="metamask"
          checked={!isUsingWally}
          onChange={onChange}
        />
        MetaMask
        <input
          type="radio"
          name="provider"
          value="wally"
          checked={isUsingWally}
          onChange={onChange}
        />
        Wally
        <br />
        {isUsingWally ? (
          isWallyLoggedIn ? (
            'Logged In'
          ) : (
            <button onClick={onWallyClick}>Login</button>
          )
        ) : null}
      </span>
      {address ? (
        <Sign provider={provider} address={address} />
      ) : (
        <Connect provider={provider} setAddress={setAddress} />
      )}
    </>
  );
};

export default Home;
