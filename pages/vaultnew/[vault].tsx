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
}

const NewVaultPage = ({ vaultData, baseTokenMetadata, quoteTokenMetadata, baseTokenPrice, baseTokenBalance, quoteTokenPrice, quoteTokenBalance }: NewVaultPageProps) => {    
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
                            vaultData = {vaultData}
                            baseTokenMetadata={baseTokenMetadata}
                            quoteTokenMetadata={quoteTokenMetadata}
                            baseTokenPrice = {baseTokenPrice}
                            baseTokenBalance = {baseTokenBalance}
                            quoteTokenPrice = {quoteTokenPrice}
                            quoteTokenBalance = {quoteTokenBalance}
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
    
    if(vaultData && vaultData.base_token_address && vaultData.quote_token_address) {
        [
            baseTokenMetadata,
            quoteTokenMetadata,
            vaultBalance,
        ] = await Promise.all([
            getTokenMetadata(vaultData.base_token_address),
            getTokenMetadata(vaultData.quote_token_address),
            getVaultBalance(vault),
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
        }
    }
}

export default NewVaultPage;