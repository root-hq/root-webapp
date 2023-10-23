import React, { useEffect, useState } from 'react';
import styles from "./VaultPage.module.css";
import { Container, Row, Col } from 'react-bootstrap';
import { TokenMetadata, TokenPrice, UnifiedVault, getTokenMetadata, getVault } from '../../utils/supabase';
import Vault from './components/Vault/Vault';
import User from './components/User/User';
import { VaultBalance, getVaultBalance } from '../../utils/root/utils';
import { getTokenPrice } from '../../utils/token';
import { getTokenPriceDataWithDate } from '../../utils/supabase/tokenPrice';
import { getMarketMidPrice } from '../../utils/phoenix';

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

    const [priceSeries, setPriceSeries] = useState([] as number[]);
    const [newPrice, setNewPrice] = useState(0);
    const [previousPrice, setPreviousPrice] = useState(0);
    const [midPriceChangeDirection, setMidPriceChangeDirection] = useState('');  

    useEffect(() => {
        const refreshPriceData = async () => {
          try {
            const today = new Date();
            const newMidPrice = parseFloat((await getMarketMidPrice(vaultData.market_address)).toFixed(3));

            setNewPrice((prevPrice) => newMidPrice);

            if(newMidPrice >= previousPrice) {
              setMidPriceChangeDirection((previousChange) => '▲');
            }
            else {
              setMidPriceChangeDirection((previousChange) => '▼');
            }
    
            setPreviousPrice((prevPrice2) => newMidPrice);  
            if(priceSeries.length === 0) {
              const freshPrices = (await getTokenPriceDataWithDate(vaultData.market_address, today)).map((val: TokenPrice) => val.price);

              setPriceSeries((prevPrices) => [...freshPrices]);
            }
            else {
              setPriceSeries((prevPrices) => [...prevPrices.slice(1), newMidPrice]);
            }
          } catch (error) {
            console.error('Error fetching price data:', error);
          }
        };
    
        // Fetch price data initially
        refreshPriceData();
    
        // Set up an interval to fetch price data every 5 seconds (adjust as needed)
        const intervalId = setInterval(() => {
          refreshPriceData();
        }, 500);
    
        // Cleanup function to clear the interval when the component unmounts
        return () => clearInterval(intervalId);
    }, [previousPrice]); // Empty dependency array to run the effect only once on mount

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
                                midPrice={previousPrice}
                                priceSeries={priceSeries}
                                priceChangeDirection={midPriceChangeDirection}
                                tokenImgWidth={windowSize[0] > 425 ? 40 : 35}
                                tokenImgHeight={windowSize[0] > 425 ? 40 : 35}
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