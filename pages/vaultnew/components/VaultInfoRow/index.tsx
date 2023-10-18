import React from 'react';
import styles from './VaultInfoRow.module.css';

export interface VaultInfoRow {

}

const VaultInfoRow = ({ }: VaultInfoRow) => {
    return (
        <div className={styles.vaultInfoRowContainer}>
            <span className={styles.text}>bbbb</span>
        </div>
    );
}

export default VaultInfoRow;