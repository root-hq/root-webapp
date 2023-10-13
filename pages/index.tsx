import Head from 'next/head';
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <div className={styles.appContainer}>
      <Head>
        <title>Root - Automated trading strategies for providing liquidity on Solana</title>
        <link rel="icon" href="/images/root-logo.png" />
      </Head>
      Home page here
    </div>
  );
}
