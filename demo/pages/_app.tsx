import React from 'react';
import Layout from 'components/layout';
import 'styles/globals.css';

interface LayoutProps {
  Component: React.JSXElementConstructor<any>;
  pageProps: any;
}

const MyApp: React.FC<LayoutProps> = ({ Component, pageProps }) => {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
};

export default MyApp;
