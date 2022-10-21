import React, { useEffect, useState } from 'react';
import { MetaMaskInpageProvider } from '@metamask/providers';
import Web3 from 'web3';

interface SignProps {
  address: string;
  provider: MetaMaskInpageProvider;
  web3: Web3;
  isUsingWally: boolean;
}

const Sign: React.FC<SignProps> = ({
  address,
  isUsingWally,
  provider,
  web3,
}) => {
  const [balance, setBalance] = useState(null);
  const [message, setMessage] = useState('');
  const [encrypted, setEncrypted] = useState('');
  const [messageAgain, setMessageAgain] = useState('');
  const [result, setResult] = useState(null);
  const [verified, setVerified] = useState(null);

  useEffect(() => {
    web3.eth.getBalance(address).then((res) => {
      if (typeof res !== 'string') {
        return;
      }
      setBalance(parseInt(res) / 1000000000000000000);
    });
  }, []);

  const onClick = () => {
    if (isUsingWally) {
      web3.eth.sign(message, address).then((res) => {
        setResult(res);
      });
    } else {
      // We need to manually call metamask's personal_sign
      // method, because web3's `sign` method uses eth_sign,
      // which has been deprecated by metamask.
      // Probably needs more investigation
      // https://docs.metamask.io/guide/signing-data.html#a-brief-history
      provider
        .request({
          method: 'personal_sign',
          params: [address, message],
        })
        .then((res) => {
          setResult(res);
        });
    }
  };

  const onVerify = () => {
    const decoded = web3.eth.accounts.recover(messageAgain, encrypted);
    setVerified(decoded);
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
