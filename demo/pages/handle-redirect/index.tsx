import React from 'react';

import { handleRedirect } from 'wally';

const HandleRedirect: React.FC = () => {
  if (typeof window !== 'undefined') {
    handleRedirect({
      closeWindow: true,
      appendContent: true,
    });
  }

  return null;
};

export default HandleRedirect;
