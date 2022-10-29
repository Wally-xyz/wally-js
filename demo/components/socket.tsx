import WallyConnector from 'public/sdk/wally-connector';
import React, { useState } from 'react';
import Web3 from 'web3';

interface Props {
  wally: WallyConnector;
  web3: Web3;
}

const Socket: React.FC<Props> = ({ wally, web3 }: Props) => {
  const [value, setValue] = useState('');

  const onWallyClick = () => {
    wally.on(value, (e) => console.log('wally.on() result:', { value, e }));
  };

  const onEthClick = () => {
    web3.eth.subscribe('pendingTransactions', (err, txn) => {
      console.log('web3.eth.subscribe() result:', { err, txn });
    });
  };

  const offClick = () => {
    wally.off();
  };

  return (
    <>
      <div>
        <label>
          <p>{'Event for wally.on():'}</p>
          <input value={value} onChange={(e) => setValue(e.target.value)} />
          <p>
            <small>{'e.g. block, pending'}</small>
          </p>
        </label>
        <button onClick={onWallyClick}>{'wally.on()'}</button>
        <button onClick={offClick}>{'Disconnect'}</button>
      </div>
      <hr />
      <div>
        <p>This is a call to eth.subscribe / eth_subscribe, which is broken</p>
        <button onClick={onEthClick}>{'web.eth.subscribe()'}</button>
      </div>
    </>
  );
};

export default Socket;
