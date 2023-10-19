import React, { useEffect, useState } from 'react';
import styles from './NewVaultPage.module.css';
import { Col, Container, Row } from 'react-bootstrap';
import PairInfoRow from './components/PairInfoRow';
import VaultInfoRow from './components/VaultInfoRow';
import { TokenMetadata, UnifiedVault, getTokenMetadata, getVault } from '../../utils/supabase';
import TokenImageContainer, { ImageMetadata } from '../../components/TokenImageContainer';
import { VaultBalance, getVaultBalance } from '../../utils/root/utils';
import { getTokenPrice } from '../../utils/token';
import { L3UiBook } from '@ellipsis-labs/phoenix-sdk';
import { getL3Book } from '../../utils/phoenix';
import { DEFAULT_ORDERBOOK_VIEW_DEPTH } from '../../constants';

export interface NewVaultPageProps {
    vaultData: UnifiedVault,
    baseTokenMetadata: TokenMetadata,
    quoteTokenMetadata: TokenMetadata,
    baseTokenPrice: number,
    baseTokenBalance: number,
    quoteTokenPrice: number,
    quoteTokenBalance: number,
    l3UiBook: L3UiBook
}

const NewVaultPage = ({ vaultData, baseTokenMetadata, quoteTokenMetadata, baseTokenPrice, baseTokenBalance, quoteTokenPrice, quoteTokenBalance, l3UiBook }: NewVaultPageProps) => {    
    const [windowSize, setWindowSize] = useState([0,0]);

    // UseEffect to handle windowSizing for custom CSS
    // when window size changes
    useEffect(() => {
        const handleWindowResize = () => {
            setWindowSize([window.innerWidth, window.innerHeight]);
        };
    
        window.addEventListener('resize', handleWindowResize);
    
        return () => {
          window.removeEventListener('resize', handleWindowResize);
        };
    }, []);

    return(
        
            (vaultData && baseTokenMetadata && quoteTokenMetadata) ?
                <Container className={styles.vaultPageContainer}>
                    <Row>
                        <PairInfoRow
                            baseTokenMetadata={baseTokenMetadata}
                            quoteTokenMetadata={quoteTokenMetadata}
                            tokenImgWidth={windowSize[0] > 425 ? 40 : 35}
                            tokenImgHeight={windowSize[0] > 425 ? 40 : 35}
                        />
                    </Row>
                    <Row>
                        <VaultInfoRow
                            baseTokenMetadata={baseTokenMetadata}
                            quoteTokenMetadata={quoteTokenMetadata}
                            baseTokenPrice = {baseTokenPrice}
                            baseTokenBalance = {baseTokenBalance}
                            quoteTokenPrice = {quoteTokenPrice}
                            quoteTokenBalance = {quoteTokenBalance}
                            l3UiBook= {l3UiBook}
                        />
                    </Row>
                </Container>
            :
                <span className={styles.vaultNotFound}>
                    Could not find relevant vault
                </span>  
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
    let l3UiBook: L3UiBook = null;
    
    if(vaultData && vaultData.base_token_address && vaultData.quote_token_address) {
        [
            baseTokenMetadata,
            quoteTokenMetadata,
            vaultBalance,
            l3UiBook
        ] = await Promise.all([
            getTokenMetadata(vaultData.base_token_address),
            getTokenMetadata(vaultData.quote_token_address),
            getVaultBalance(vault),
            getL3Book(vaultData.market_address, DEFAULT_ORDERBOOK_VIEW_DEPTH)
        ]);

        if(baseTokenMetadata && baseTokenMetadata.ticker) {
            baseTokenPrice = await getTokenPrice(baseTokenMetadata.ticker, 'USD');
        }

        if(quoteTokenMetadata && quoteTokenMetadata.ticker) {
            quoteTokenPrice = await getTokenPrice(quoteTokenMetadata.ticker, 'USD');
        }
    }

    return {
        props: {
            vaultData: vaultData ? vaultData : null,
            baseTokenMetadata: baseTokenMetadata ? baseTokenMetadata : null,
            quoteTokenMetadata: quoteTokenMetadata ? quoteTokenMetadata : null,
            baseTokenPrice: baseTokenPrice ? baseTokenPrice : null,
            baseTokenBalance: vaultBalance.baseTokenBalance ? vaultBalance.baseTokenBalance : null,
            quoteTokenPrice: quoteTokenPrice ? quoteTokenPrice : null,
            quoteTokenBalance: vaultBalance.quoteTokenBalance ? vaultBalance.quoteTokenBalance : null,
            l3UiBook: l3UiBook ? l3UiBook : null
        }
    }
}

export default NewVaultPage;