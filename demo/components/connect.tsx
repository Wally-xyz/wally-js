import React, { useCallback, useState } from 'react';
import Web3 from 'web3';

interface ConnectProps {
  setAddress(a: string): void;
  web3: Web3;
}

const Connect: React.FC<ConnectProps> = ({ setAddress, web3 }) => {
  if (!web3) {
    return null;
  }

  const [err, setErr] = useState(null);

  const onClick = useCallback(() => {
    web3.eth.requestAccounts().then(
      (res) => {
        setAddress(res[0]);
      },
      (err) => {
        console.error(err);
        setErr(err);
      }
    );
  }, [setAddress, web3]);

  return (
    <div style={{ textAlign: 'center' }}>
      <button onClick={onClick}>Request Account</button>
      {err ? (
        <p style={{ color: 'orangered' }}>Error fetching account</p>
      ) : null}
    </div>
  );
};

export default Connect;
