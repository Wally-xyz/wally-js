import React, { useEffect } from 'react';

const HandleRedirect: React.FC = () => {
  useEffect(() => {
    window.wally.handleRedirect({
      closeWindow: true,
      appendContent: true,
    });
  }, []);

  return null;
};

export default HandleRedirect;
