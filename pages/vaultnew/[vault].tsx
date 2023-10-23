import React, { useEffect, useState } from 'react';
import styles from "./VaultPage.module.css";
import { Container, Row, Col } from 'react-bootstrap';
import { TokenMetadata, UnifiedVault, getTokenMetadata, getVault } from '../../utils/supabase';
import Vault from './components/Vault/Vault';
import User from './components/User/User';
import { VaultBalance, getVaultBalance } from '../../utils/root/utils';
import { getTokenPrice } from '../../utils/token';

export interface VaultPageProps {
    vaultData: UnifiedVault;
    baseTokenMetadata: TokenMetadata;
    quoteTokenMetadata: TokenMetadata;
    baseTokenPrice: number;
    baseTokenBalance: number;
    quoteTokenPrice: number;
    quoteTokenBalance: number;
}
  

const VaultPage = ({
    vaultData,
    baseTokenMetadata,
    quoteTokenMetadata,
    baseTokenPrice,
    baseTokenBalance,
    quoteTokenPrice,
    quoteTokenBalance,
  
}: VaultPageProps) => {

    const [windowSize, setWindowSize] = useState([0, 0]);

    // UseEffect to handle windowSizing for custom CSS
    // when window size changes
    useEffect(() => {
        const handleWindowResize = () => {
        setWindowSize([window.innerWidth, window.innerHeight]);
        };

        window.addEventListener("resize", handleWindowResize);

        return () => {
        window.removeEventListener("resize", handleWindowResize);
        };
    }, []);

    return(
        <div className={styles.vaultPageContainer}>
            {
                vaultData ?
                    <>
                        <div className={styles.vaultDataContainer}>
                            <Vault
                                vaultData={vaultData}
                                baseTokenMetadata={baseTokenMetadata}
                                quoteTokenMetadata={quoteTokenMetadata}
                                tokenImgWidth={windowSize[0] > 425 ? 40 : 30}
                                tokenImgHeight={windowSize[0] > 425 ? 40 : 30}
                            />
                        </div>
                        <div className={styles.userDataContainer}>
                            <User />
                        </div>
                    </>
                :
                    <>
                    </>
            }
        </div>
    );
}

export async function getServerSideProps({ params }) {
    const { vault } = params;

    const vaultData = await getVault(vault);
    let baseTokenMetadata: TokenMetadata = null;
    let quoteTokenMetadata: TokenMetadata = null;
    let vaultBalance: VaultBalance = null;
    let baseTokenPrice: number = null;
    let quoteTokenPrice: number = null;
  
    if (
        vaultData &&
        vaultData.base_token_address &&
        vaultData.quote_token_address
    ) {
        [baseTokenMetadata, quoteTokenMetadata, vaultBalance] = await Promise.all([
          getTokenMetadata(vaultData.base_token_address),
          getTokenMetadata(vaultData.quote_token_address),
          getVaultBalance(vault),
        ]);
    
        if (baseTokenMetadata && baseTokenMetadata.ticker) {
          baseTokenPrice = await getTokenPrice(baseTokenMetadata.ticker, "USD");
        }
    
        if (quoteTokenMetadata && quoteTokenMetadata.ticker) {
          quoteTokenPrice = await getTokenPrice(quoteTokenMetadata.ticker, "USD");
        }
    }
  
    return {
        props: {
            vaultData: vaultData ? vaultData : null,
            baseTokenMetadata: baseTokenMetadata ? baseTokenMetadata : null,
            quoteTokenMetadata: quoteTokenMetadata ? quoteTokenMetadata : null,
            baseTokenPrice: baseTokenPrice ? baseTokenPrice : null,
            baseTokenBalance: vaultBalance.baseTokenBalance
              ? vaultBalance.baseTokenBalance
              : null,
            quoteTokenPrice: quoteTokenPrice ? quoteTokenPrice : null,
            quoteTokenBalance: vaultBalance.quoteTokenBalance
              ? vaultBalance.quoteTokenBalance
              : null,
        }
    };  
}

export default VaultPage;