import React from 'react';
import { useRouter } from 'next/router';
import styles from './VaultPageContainer.module.css';
import { TokenMetadata, UnifiedVault, getTokenMetadata, getVault } from '../../utils/supabase';
import { getL3Book } from '../../utils/phoenix';
import { L3UiBook } from '@ellipsis-labs/phoenix-sdk';
import { DEFAULT_ORDERBOOK_VIEW_DEPTH } from '../../constants';
import { Col, Container, Row } from 'react-bootstrap';
import L3UiBookDisplay from '../../components/L3UiBookDisplay';

export interface VaultPageContainerProps {
    vaultData: UnifiedVault,
    baseTokenMetadata: TokenMetadata,
    quoteTokenMetadata: TokenMetadata,
    l3UiBook: L3UiBook
}

const VaultPageContainer = ({ vaultData, baseTokenMetadata, quoteTokenMetadata, l3UiBook }: VaultPageContainerProps) => {
    const router = useRouter();

    return(
        <Container className={styles.vaultPageContainer}>
            <Row className={styles.navigationContainer}>
                <span
                    className={styles.backLinkContainer}
                >
                    <a
                        href="/"
                        className={styles.backLink}
                    >
                        All Strategies
                    </a>
                </span>
                <span
                    className={styles.arrowContainer}
                >{`>`}</span>
                <span
                    className={styles.vaultAddressContainer}
                >{`${baseTokenMetadata.ticker}-${quoteTokenMetadata.ticker}`}</span>
            </Row>
            <Row className={styles.vaultAndBookContainer}>
                <Col md = {6} xs = {12} className={styles.vaultInfoColumn}>
                    <div className={styles.vaultInfoContainer}>
                    </div>
                </Col>
                <Col md = {6} xs = {12} className={styles.bookColumn}>
                    <div className={styles.bookContainer}>
                        <L3UiBookDisplay l3UiBook = {l3UiBook} />
                    </div>
                </Col>
            </Row>
        </Container>
    )
}

export async function getServerSideProps({ params }) {
    const { vaultAddress } = params;
    
    const vaultData = (await getVault(vaultAddress))[0];

    const baseTokenMetadata = (await getTokenMetadata(vaultData.base_token_address))[0];
    const quoteTokenMetadata = (await getTokenMetadata(vaultData.quote_token_address))[0];

    const l3UiBook = await getL3Book(vaultData.market_address, DEFAULT_ORDERBOOK_VIEW_DEPTH);

    return {
        props: {
            vaultData: vaultData ? vaultData : null,
            baseTokenMetadata: baseTokenMetadata ? baseTokenMetadata : null,
            quoteTokenMetadata: quoteTokenMetadata ? quoteTokenMetadata : null,
            l3UiBook: l3UiBook ? l3UiBook : null
        }
    }
}

export default VaultPageContainer;