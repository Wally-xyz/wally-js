import React, { useCallback, useEffect, useState } from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import { MetaMaskInpageProvider } from '@metamask/providers';

import Web3 from 'web3';

import Connect from 'components/connect';
import Sign from 'components/sign';

import Metamask from 'icons/Metamask';

import styles from 'styles/Home.module.css';

import { getProvider } from 'wally';

const Home: React.FC = () => {
  const [isUsingWally, setIsUsingWally] = useState(true);
  const [emailAddress, setEmailAddress] = useState('');
  const [provider, setProvider] = useState<MetaMaskInpageProvider | any>(null);
  const [address, setAddress] = useState(null);
  const [web3, setWeb3] = useState(null);

  const detectProvider = useCallback(() => {
    if (isUsingWally) {
      return Promise.resolve(getProvider());
    } else {
      return detectEthereumProvider();
    }
  }, [isUsingWally]);

  useEffect(() => {
    detectProvider().then((p) => {
      if (p) {
        setProvider(p);
        const web3 = new Web3(p);
        setWeb3(web3);
      }
    });
  }, [isUsingWally]);

  useEffect(() => {
    if (provider && provider.selectedAddress && setAddress) {
      setAddress(provider.selectedAddress || null);
    }
  }, [provider, setAddress]);

  return (
    <>
      <h1 className={styles.title}>EasySign Demo</h1>
      {address ? (
        <Sign
          isUsingWally={isUsingWally}
          provider={provider}
          address={address}
          web3={web3}
        />
      ) : (
        <>
          <input
            className={styles.emailInput}
            type="text"
            name="provider"
            value={emailAddress}
            onChange={(e) => {
              setEmailAddress(e.target.value);
              setIsUsingWally(true);
            }}
            placeholder="Email"
          />
          <Connect
            className={styles.button}
            setAddress={setAddress}
            web3={web3}
          >
            Sign Up
          </Connect>
          <div className={styles.dividerBlock}>
            <div className={styles.dividerContainer}>
              <div className={styles.divider}></div>
              <span>OR</span>
              <div className={styles.divider}></div>
            </div>
          </div>
          <Connect setAddress={setAddress} web3={web3}>
            <Metamask className={styles.walletLogo} />
          </Connect>
        </>
      )}
    </>
  );
};

export default Home;
