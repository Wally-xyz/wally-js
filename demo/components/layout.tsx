import React from 'react';
import Head from 'next/head';

import styles from 'styles/Home.module.css';

interface LayoutProps {
  children: any;
}

const Layout: React.FC<LayoutProps> = (props: LayoutProps) => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Demo Page</title>
      </Head>
      <main className={styles.main}>{props.children}</main>
    </div>
  );
};

export default Layout;
