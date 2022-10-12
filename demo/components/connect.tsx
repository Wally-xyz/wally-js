import React from 'react';
import { MetaMaskInpageProvider } from '@metamask/providers';

interface ConnectProps {
  provider: MetaMaskInpageProvider;
  setAddress(a: string): void;
}

function Connect({
  provider,
  setAddress,
}: ConnectProps) {
  if (!provider) {
    return null;
  }

  return (
    <button onClick={() => {
      provider.request({ method: 'eth_requestAccounts' }).then(res => {
        console.log({ res });
        setAddress(res[0]);
      })
    }}>Connect with MetaMask</button>
  );
}

export default Connect;
