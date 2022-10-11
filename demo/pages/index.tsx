import Head from "next/head";
import { useEffect, useRef } from "react";

import { WallyConnector } from "../../dist";

import styles from "../styles/Home.module.css";

export default function Home() {
  const wallyConnector = useRef(
    new WallyConnector(
      process.env.NEXT_PUBLIC_CLIENT_ID, 
      {
        isDevelopment: process.env.NEXT_PUBLIC_IS_DEVELOPMENT === 'true',
      }
    )
  );

  useEffect(() => {
    if (wallyConnector.current.isRedirected()) {
      wallyConnector.current.handleRedirect()
    }
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Demo Page</title>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Wally Connector Demo</h1>
        <button
          onClick={() => {
            wallyConnector.current.loginWithEmail();
          }}
        >
          Login
        </button>
        <button
          onClick={async () => {
            console.log("stub");
            // const wallets = await wallyConnector.current.getWallets();
            // console.log("wallets = ", wallets);
          }}
        >
          Get Wallets
        </button>
      </main>
    </div>
  );
}
