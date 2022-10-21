import React from 'react';

const HandleRedirect: React.FC = () => {
  if (typeof window !== 'undefined') {
    window.wally.handleRedirect({
      closeWindow: true,
      appendContent: true,
    });
  }

  return null;
};

export default HandleRedirect;
