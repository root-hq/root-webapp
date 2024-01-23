import Head from "next/head";
import styles from "../styles/Home.module.css";
import Header from "../components/Header";
import { getAllTokenMetadata, getAllVaults } from "../utils/supabase";
import VaultContainer from "../components/VaultContainer";
import { UnifiedVault, TokenMetadata } from "../utils/supabase";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Home({ vaults, allTokenMetadata }: HomePageProps) {
  const router = useRouter();

  useEffect(() => {
    // Default address value
    const defaultAddress = "4DoNfFBfF7UokCC2FQzriy7yHK6DY6NVdYpuekQ5pRgg";

    // Redirect to the /market/[address] route with the default address
    router.replace(`/market/${defaultAddress}`);
  }, []);

  return (
    <div className={styles.appContainer}>
      <main>
        <h1 className={styles.h1Container}>Active strategies</h1>
        <div className={styles.vaultsContainer}>
          {vaults.length > 0 && allTokenMetadata.length > 0 ? (
            <>
              {vaults.map((vault: UnifiedVault) => {
                const baseTokenMetadata = allTokenMetadata.filter(
                  (info: TokenMetadata) =>
                    info.mint === vault.base_token_address,
                )[0];
                const quoteTokenMetadata = allTokenMetadata.filter(
                  (info: TokenMetadata) =>
                    info.mint === vault.quote_token_address,
                )[0];

                return (
                  <VaultContainer
                    vault={vault}
                    key={vault.vault_address}
                    baseToken={baseTokenMetadata}
                    quoteToken={quoteTokenMetadata}
                  />
                );
              })}
            </>
          ) : (
            <></>
          )}
        </div>
      </main>
    </div>
  );
}

export interface HomePageProps {
  vaults: UnifiedVault[];
  allTokenMetadata: TokenMetadata[];
}

export async function getServerSideProps() {
  const vaults = await getAllVaults();

  const allTokenMetadata = await getAllTokenMetadata();
  return {
    props: {
      vaults: vaults ? vaults : [],
      allTokenMetadata: allTokenMetadata ? allTokenMetadata : [],
    },
  };
}
