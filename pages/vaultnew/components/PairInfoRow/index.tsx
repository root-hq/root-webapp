import React from 'react';
import styles from './PairInfoRow.module.css';

export interface PairInfoRow {

}

const PairInfoRow = ({ }: PairInfoRow) => {
    return (
        <div className={styles.pairInfoRowContainer}>
            <span className={styles.text}>aaaa</span>
        </div>
    );
}

export default PairInfoRow;