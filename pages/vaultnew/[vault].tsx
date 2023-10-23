import React from 'react';
import styles from "./VaultPage.module.css";
import { Container, Row, Col } from 'react-bootstrap';

const VaultPage = () => {
    return(
        <div className={styles.vaultPageContainer}>
            <div className={styles.vaultDataContainer}>
                <span>Vault info comes here</span>
            </div>
            <div className={styles.userDataContainer}>
                <span>User info comes here</span>
            </div>
        </div>
    );
}

export default VaultPage;