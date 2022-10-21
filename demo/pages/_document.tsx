import React from 'react';
import { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script';

const Document: React.FC = () => {
  return (
    <Html>
      <Head />
      <body>
        <Main />
        <NextScript />
        <Script src="sdk/index.js" strategy="beforeInteractive"></Script>
      </body>
    </Html>
  );
};

export default Document;
