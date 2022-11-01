import React from 'react';
import Layout from 'components/layout';
import 'styles/globals.css';

import { init } from 'wally';

interface LayoutProps {
  Component: React.JSXElementConstructor<any>;
  pageProps: any;
}

const MyApp: React.FC<LayoutProps> = ({ Component, pageProps }) => {
  if (typeof window !== 'undefined') {
    init({
      clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
      isDevelopment: false,
      devUrl: process.env.NEXT_PUBLIC_DEV_URL,
    });
  }

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
};

export default MyApp;
