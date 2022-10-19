import React, { useEffect } from 'react';
import { WallyConnector } from '../../../dist';

/*
This should probably be moved to the SDK,
with plain JS instead of React, so the consumer can
just drop it into any framework.

*/

const HandleRedirect: React.FC<null> = () => {
  useEffect(() => {
    WallyConnector.handleRedirect(process.env.NEXT_PUBLIC_CLIENT_ID).then(
      () => {
        window.setTimeout(window.close, 1000);
      }
    );
  }, []);

  return (
    <div>
      <img src="/logo.gif" style={{ width: '300px' }} />
      <p>Redirecting...</p>
    </div>
  );
};

export default HandleRedirect;
