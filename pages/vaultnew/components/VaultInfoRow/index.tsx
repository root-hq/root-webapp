import React from 'react';
import styles from './VaultInfoRow.module.css';
import { Container, Row, Col } from 'react-bootstrap';

export interface VaultInfoRow {

}

const VaultInfoRow = ({ }: VaultInfoRow) => {
    return (
        <Container>
            <Row className={styles.vaultInfoRowContainer}>
                <Col className={`${styles.vaultInfoColumn} ${styles.userVaultContainer}`}>
                    a
                </Col>
                <Col className={`${styles.vaultInfoColumn} ${styles.vaultTradingContainer}`}>
                    b
                </Col>
            </Row>
        </Container>
    );
}

export default VaultInfoRow;