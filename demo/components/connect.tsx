import React, { useCallback } from 'react';
import Web3 from 'web3';

interface ConnectProps {
  setAddress(a: string): void;
  web3: Web3;
}

const Connect: React.FC<ConnectProps> = ({ setAddress, web3 }) => {
  if (!web3) {
    return null;
  }

  const onClick = useCallback(() => {
    web3.eth.requestAccounts().then((res) => {
      setAddress(res[0]);
    });
  }, [setAddress, web3]);

  return <button onClick={onClick}>Connect</button>;
};

export default Connect;
