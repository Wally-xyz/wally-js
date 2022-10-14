import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import { MetaMaskInpageProvider } from '@metamask/providers';

interface SignProps {
  address: string;
  provider: MetaMaskInpageProvider;
}

const Sign: React.FC<SignProps> = ({ address, provider }) => {
  const [balance, setBalance] = useState(null);
  const [message, setMessage] = useState('');
  const [encrypted, setEncrypted] = useState('');
  const [result, setResult] = useState(null);
  const [verified, setVerified] = useState(null);

  useEffect(() => {
    provider
      .request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      })
      .then((bal) => {
        if (typeof bal !== 'string') {
          return;
        }
        setBalance(parseInt(bal) / 1000000000000000000);
      });
  }, []);

  const onClick = () => {
    provider
      .request({
        method: 'personal_sign',
        params: [address, message],
      })
      .then((res) => {
        setResult(res);
      });
  };

  const onVerify = () => {
    const res = ethers.utils.verifyMessage(message, encrypted);
    console.log({ res });
    setVerified(res);
  };

  return (
    <>
      <h2>Connected @ {address}</h2>
      <h2>Balance: {balance} Ether</h2>
      Message:{' '}
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={onClick}>Sign</button>
      <h3>Result: {result}</h3>
      <br></br>
      Verify:{' '}
      <input
        type="text"
        value={encrypted}
        onChange={(e) => setEncrypted(e.target.value)}
      />
      <button onClick={onVerify}>Get Address</button>
      <h3>Address: {verified}</h3>
    </>
  );
};

export default Sign;
