import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Header from '../components/Header';
import { getAllTokenMetadata, getAllVaults } from '../utils/supabase';
import VaultContainer from '../components/VaultContainer';
import { UnifiedVault, TokenMetadata } from '@squarerootlabs/root-db-utils/src/supabase';

export default function Home({ vaults, allTokenMetadata }: HomePageProps) {
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
        <div>
          {
            vaults.length > 0 && allTokenMetadata.length > 0 ?
              <>
                {
                  vaults.map((vault: UnifiedVault) => {
                    const baseTokenMetadata = allTokenMetadata.filter((info: TokenMetadata) => info.mint === vault.base_token_address)[0];
                    const quoteTokenMetadata = allTokenMetadata.filter((info: TokenMetadata) => info.mint === vault.quote_token_address)[0];
                    
                    return <VaultContainer vault={vault} key={vault.vault_address} baseToken = {baseTokenMetadata} quoteToken = {quoteTokenMetadata}/>;
                  }
                  )
                }
              </>
            :
              <>
              </>
          }
        </div>
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

export interface HomePageProps {
  vaults: UnifiedVault[],
  allTokenMetadata: TokenMetadata[]
}

export async function getServerSideProps() {
  const vaults = await getAllVaults();
  const allTokenMetadata = await getAllTokenMetadata();

  return {
    props: {
      vaults: vaults ? vaults : [],
      allTokenMetadata: allTokenMetadata ? allTokenMetadata : []
    }
  }
}