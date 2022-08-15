import Head from "next/head";
import { useRef } from "react";

import { WallyConnector } from "../../dist";

import styles from "../styles/Home.module.css";

export default function Home() {
  const wallyConnector = useRef(new WallyConnector());

  return (
    <div className={styles.container}>
      <Head>
        <title>Demo Page</title>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Wally Connector Demo</h1>
        <button
          onClick={() => {
            wallyConnector.current.authorise();
          }}
        >
          Login
        </button>
        <button
          onClick={async () => {
            const wallets = await wallyConnector.current.getWallets();
            console.log("wallets = ", wallets);
          }}
        >
          Get Wallets
        </button>
      </main>
    </div>
  );
}
