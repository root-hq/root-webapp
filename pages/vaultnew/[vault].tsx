import React, { useEffect, useState } from 'react';
import styles from './NewVaultPage.module.css';
import { Col, Container, Row } from 'react-bootstrap';
import PairInfoRow from './components/PairInfoRow';
import VaultInfoRow from './components/VaultInfoRow';
import { TokenMetadata, UnifiedVault, getTokenMetadata, getVault } from '../../utils/supabase';
import TokenImageContainer, { ImageMetadata } from '../../components/TokenImageContainer';

export interface NewVaultPageProps {
    vaultData: UnifiedVault,
    baseTokenMetadata: TokenMetadata,
    quoteTokenMetadata: TokenMetadata,
}

const NewVaultPage = ({ vaultData, baseTokenMetadata, quoteTokenMetadata }: NewVaultPageProps) => {    
    const [windowSize, setWindowSize] = useState([0,0]);

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
                    <Row className={styles.vaultInfoContainer}>
                        <TokenImageContainer 
                            baseTokenImageMetadata={
                                {
                                    url: baseTokenMetadata.img_url,
                                    width: windowSize[0] > 425 ? 45 : 35,
                                    height: windowSize[0] > 425 ? 45 : 35,
                                    alt: `Base token: ${baseTokenMetadata.ticker}`
                                } as ImageMetadata
                            }
                            quoteTokenImageMetadata={
                                {
                                    url: quoteTokenMetadata.img_url,
                                    width: windowSize[0] > 425 ? 45 : 35,
                                    height: windowSize[0] > 425 ? 45 : 35,
                                    alt: `Quote token: ${quoteTokenMetadata.ticker}`
                                } as ImageMetadata
                            }
                        />
                        <span className={styles.vaultPairNameContainer}>{`${baseTokenMetadata.ticker}`}</span>
                        <span className={styles.vaultPairNameContainer}>{`${quoteTokenMetadata.ticker}`}</span>
                    </Row>
                    <Row><PairInfoRow /></Row>
                    <Row><VaultInfoRow /></Row>
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
    let baseTokenMetadata = null;
    let quoteTokenMetadata = null;
    
    if(vaultData && vaultData.base_token_address && vaultData.quote_token_address) {
        [
            baseTokenMetadata,
            quoteTokenMetadata,
        ] = await Promise.all([
            getTokenMetadata(vaultData.base_token_address),
            getTokenMetadata(vaultData.quote_token_address),
        ]);
    }

    return {
        props: {
            vaultData: vaultData ? vaultData : null,
            baseTokenMetadata: baseTokenMetadata ? baseTokenMetadata : null,
            quoteTokenMetadata: quoteTokenMetadata ? quoteTokenMetadata : null
        }
    }
}

export default NewVaultPage;