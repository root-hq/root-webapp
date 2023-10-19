import React from 'react';
import styles from './VaultInfoRow.module.css';
import { Container, Row, Col } from 'react-bootstrap';
import FundsColumn from '../FundsColumn';
import { TokenMetadata } from '../../../../utils/supabase';
import FundsManagerColumn from '../FundsManagerColumn';
import { L3UiBook } from '@ellipsis-labs/phoenix-sdk';
import L3UiBookDisplay from '../../../../components/L3UiBookDisplay';

export interface VaultInfoRow {
    baseTokenMetadata: TokenMetadata,
    quoteTokenMetadata: TokenMetadata,
    baseTokenPrice: number,
    baseTokenBalance: number,
    quoteTokenPrice: number,
    quoteTokenBalance: number,
    l3UiBook: L3UiBook
}

const VaultInfoRow = ({
    baseTokenMetadata,
    quoteTokenMetadata,
    baseTokenPrice,
    baseTokenBalance,
    quoteTokenPrice,
    quoteTokenBalance,
    l3UiBook
}: VaultInfoRow) => {
    return (
        <Container>
            <Row className={styles.vaultInfoRowContainer}>
                <Col className={`${styles.vaultInfoColumn} ${styles.leftVaultContainer}`}>
                    {
                        baseTokenMetadata && baseTokenBalance && quoteTokenMetadata && quoteTokenBalance ?
                            <>
                                <div className={styles.fundsDisplayContainer}>
                                    <FundsColumn
                                        baseTokenTicker = {baseTokenMetadata.ticker}
                                        quoteTokenTicker = {quoteTokenMetadata.ticker}
                                        baseTokenPrice = {baseTokenPrice}
                                        baseTokenBalance = {baseTokenBalance}
                                        quoteTokenPrice = {quoteTokenPrice}
                                        quoteTokenBalance = {quoteTokenBalance}                        
                                    />
                                </div>
                                <div className={styles.fundsManagerContainer}>
                                    <FundsManagerColumn
                                        baseTokenMetadata = {baseTokenMetadata}
                                        quoteTokenMetadata = {quoteTokenMetadata}
                                    />
                                </div>
                            </>
                        :
                            <></>
                    }
                </Col>
                <Col className={`${styles.vaultInfoColumn} ${styles.rightVaultContainer}`}>
                    <div className={styles.bookContainer}>
                        <L3UiBookDisplay l3UiBook = {l3UiBook} />
                    </div>
                </Col>
            </Row>
        </Container>
    );
}

export default VaultInfoRow;