import React from 'react';
import { MetaMaskInpageProvider } from '@metamask/providers';

interface ConnectProps {
  provider: MetaMaskInpageProvider;
  setAddress(a: string): void;
}

const Connect: React.FC<ConnectProps> = ({ provider, setAddress }) => {
  if (!provider) {
    return null;
  }

  return (
    <button
      onClick={() => {
        provider.request({ method: 'eth_requestAccounts' }).then((res) => {
          console.log({ res });
          setAddress(res[0]);
        });
      }}
    >
      Connect with MetaMask
    </button>
  );
};

export default Connect;
