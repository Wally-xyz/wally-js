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
  const [messageAgain, setMessageAgain] = useState('');
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
    const res = ethers.utils.verifyMessage(messageAgain, encrypted);
    setVerified(res);
  };

  return (
    <>
      <br />
      <b>Connected @ {address}</b>
      <b>Balance: {balance} Ether</b>
      <h3>Message:</h3>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={onClick}>Sign</button>
      <b>Result: {result}</b>
      <br />
      <h3>Verify:</h3>
      <label>
        Signed Hash{' '}
        <input
          type="text"
          value={encrypted}
          onChange={(e) => setEncrypted(e.target.value)}
        />
      </label>
      <label>
        Message{' '}
        <input
          type="text"
          value={messageAgain}
          onChange={(e) => setMessageAgain(e.target.value)}
        />
      </label>
      <button onClick={onVerify}>Get Address</button>
      <b>Address: {verified}</b>
    </>
  );
};

export default Sign;
