import React, { useCallback, useEffect, useState } from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import { MetaMaskInpageProvider } from '@metamask/providers';

import Web3 from 'web3';

import Connect from 'components/connect';
import Sign from 'components/sign';

import styles from 'styles/Home.module.css';

import { getProvider } from 'wally';

const Home: React.FC = () => {
  const [isUsingWally, setIsUsingWally] = useState(true);
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
    if (provider && provider.selectedAddress) {
      setAddress(provider.selectedAddress);
    }
  }, [provider]);

  const onChange = (e) => {
    setIsUsingWally(e.target.value === 'wally');
    setProvider(null);
    setAddress(null);
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
      </span>
      <br />
      {address ? (
        <Sign
          isUsingWally={isUsingWally}
          provider={provider}
          address={address}
          web3={web3}
        />
      ) : (
        <Connect setAddress={setAddress} web3={web3} />
      )}
    </>
  );
};

export default Home;
