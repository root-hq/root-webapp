import React from 'react';
import styles from './PairInfoRow.module.css';
import { TokenMetadata } from '../../../../utils/supabase';
import TokenImageContainer, { ImageMetadata } from '../../../../components/TokenImageContainer';

export interface PairInfoRow {
    baseTokenMetadata: TokenMetadata,
    quoteTokenMetadata: TokenMetadata,
    tokenImgWidth: number,
    tokenImgHeight: number,
}

const PairInfoRow = ({ baseTokenMetadata, quoteTokenMetadata, tokenImgWidth, tokenImgHeight }: PairInfoRow) => {
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
                    </>
                :
                    <></>
            }
        </div>
    );
}

export default PairInfoRow;