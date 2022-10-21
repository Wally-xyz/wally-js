import React from 'react';
import Layout from 'components/layout';
import 'styles/globals.css';

interface LayoutProps {
  Component: React.JSXElementConstructor<any>;
  pageProps: any;
}

const MyApp: React.FC<LayoutProps> = ({ Component, pageProps }) => {
  if (typeof window !== 'undefined') {
    window.wally.init({
      clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
      isDevelopment: true,
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
