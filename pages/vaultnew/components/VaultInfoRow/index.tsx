import React from 'react';
import styles from './VaultInfoRow.module.css';
import { Container, Row, Col } from 'react-bootstrap';
import FundsColumn from '../FundsColumn';
import { TokenMetadata } from '../../../../utils/supabase';

export interface VaultInfoRow {
    baseTokenMetadata: TokenMetadata,
    quoteTokenMetadata: TokenMetadata,
    baseTokenPrice: number,
    baseTokenBalance: number,
    quoteTokenPrice: number,
    quoteTokenBalance: number
}

const VaultInfoRow = ({
    baseTokenMetadata,
    quoteTokenMetadata,
    baseTokenPrice,
    baseTokenBalance,
    quoteTokenPrice,
    quoteTokenBalance
}: VaultInfoRow) => {
    return (
        <Container>
            <Row className={styles.vaultInfoRowContainer}>
                <Col className={`${styles.vaultInfoColumn} ${styles.leftVaultContainer}`}>
                    <FundsColumn
                        baseTokenTicker = {baseTokenMetadata.ticker}
                        quoteTokenTicker = {quoteTokenMetadata.ticker}
                        baseTokenPrice = {baseTokenPrice}
                        baseTokenBalance = {baseTokenBalance}
                        quoteTokenPrice = {quoteTokenPrice}
                        quoteTokenBalance = {quoteTokenBalance}                        
                    />
                </Col>
                <Col className={`${styles.vaultInfoColumn} ${styles.rightVaultContainer}`}>
                    b
                </Col>
            </Row>
        </Container>
    );
}

export default VaultInfoRow;