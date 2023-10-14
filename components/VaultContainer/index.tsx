import React from 'react';
import styles from './VaultContainer.module.css';

const VaultContainer = ({ vault }) => {
    return (
        <div
            className={styles.vaultContainer}
        >
            <p>{vault["vault_address"]}</p>
        </div>
    );
}

export default VaultContainer;