import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Header from '../components/Header';
import { getAllVaults } from '../utils/supabase';

export default function Home() {
  return (
    <div className={styles.appContainer}>
      <Head>
        <title>Root - Automated trading strategies for providing liquidity on Solana</title>
        <link rel="icon" href="/images/root-logo.png" />
      </Head>

      <div className={styles.headerContainer}>
        <Header />
      </div>

      <main>
        <h1
          className={styles.h1Container}
        >
          Active strategies
        </h1>
      </main>

      <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta2/css/all.min.css"
            integrity="sha512-YWzhKL2whUzgiheMoBFwW8CKV4qpHQAEuvilg9FAn5VJUDwKZZxkJNuGM4XkWuk94WCrrwslk8yWNGmY1EduTA=="
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
      />
    </div>
  );
}

export async function getServerSideProps() {
  const response = await getAllVaults();
  if(response !== null) {
    return {
      props: {
        vaults: response
      }
    }
  }
  else {
    return {
      props: {
        vaults: null
      }
    }
  }
}