import React from 'react';
import styles from './PairInfoRow.module.css';
import { TokenMetadata, UnifiedVault } from '../../../../utils/supabase';
import TokenImageContainer, { ImageMetadata } from '../../../../components/TokenImageContainer';
import KeyValueComponent, { KeyValueJustification } from '../../../../components/KeyValueComponent';

export interface PairInfoRow {
    vaultData: UnifiedVault,
    baseTokenMetadata: TokenMetadata,
    quoteTokenMetadata: TokenMetadata,
    tokenImgWidth: number,
    tokenImgHeight: number,
}

const PairInfoRow = ({ vaultData, baseTokenMetadata, quoteTokenMetadata, tokenImgWidth, tokenImgHeight }: PairInfoRow) => {
    return (
        <div className={styles.pairInfoRowContainer}>
            {
                baseTokenMetadata && 
                quoteTokenMetadata && 
                baseTokenMetadata.img_url && 
                quoteTokenMetadata.img_url &&
                baseTokenMetadata.ticker &&
                quoteTokenMetadata.ticker ?
                    <>
                        <div className={styles.pairInfoContainer}>
                            <TokenImageContainer 
                                baseTokenImageMetadata={
                                    {
                                        url: baseTokenMetadata.img_url,
                                        width: tokenImgWidth,
                                        height: tokenImgHeight,
                                        alt: `Base token: ${baseTokenMetadata.ticker}`
                                    } as ImageMetadata
                                }
                                quoteTokenImageMetadata={
                                    {
                                        url: quoteTokenMetadata.img_url,
                                        width: tokenImgWidth,
                                        height: tokenImgHeight,
                                        alt: `Quote token: ${quoteTokenMetadata.ticker}`
                                    } as ImageMetadata
                                }
                            />
                            <span className={styles.pairNameContainer}>{`${baseTokenMetadata.ticker}`}</span>
                            <span className={styles.pairNameContainer}>{`${quoteTokenMetadata.ticker}`}</span>
                        </div>
                        <div className={styles.exchangeTextContainer}>
                            <span
                                className={styles.exchangeTextKey}
                            >
                                {'Exchange'}
                            </span>
                            <span
                                className={styles.exchangeTextValue}
                            >
                                {vaultData.exchange.split('').join('')}
                            </span>
                        </div>
                    </>
                :
                    <></>
            }
        </div>
    );
}

export default PairInfoRow;