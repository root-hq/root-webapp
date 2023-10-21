import React from 'react';
import styles from './PairInfoRow.module.css';
import { TokenMetadata, UnifiedVault } from '../../../../utils/supabase';
import TokenImageContainer, { ImageMetadata } from '../../../../components/TokenImageContainer';
import KeyValueComponent, { KeyValueJustification } from '../../../../components/KeyValueComponent';

export interface PairInfoRow {
    vaultData: UnifiedVault,
    baseTokenMetadata: TokenMetadata,
    quoteTokenMetadata: TokenMetadata,
    baseTokenBalance: number,
    quoteTokenBalance: number,
    baseTokenDepositsValue: number,
    quoteTokenDepositsValue: number,
    tokenImgWidth: number,
    tokenImgHeight: number,
}

const PairInfoRow = ({ vaultData, baseTokenMetadata, quoteTokenMetadata, baseTokenBalance, quoteTokenBalance, baseTokenDepositsValue, quoteTokenDepositsValue, tokenImgWidth, tokenImgHeight }: PairInfoRow) => {
    return (
        <div className={styles.pairInfoContainer}>
            {
                baseTokenMetadata && 
                quoteTokenMetadata && 
                baseTokenMetadata.img_url && 
                quoteTokenMetadata.img_url &&
                baseTokenMetadata.ticker &&
                quoteTokenMetadata.ticker ?
                    <div className={styles.vaultDetailsContainer}>                        
                        <div className={styles.vaultBasicDetailsContainer}>
                            <div className={styles.vaultPairDetailsContainer}>
                                <div className={styles.pairImageContainer}>
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
                                </div>
                                <div>
                                    <span className={styles.pairNameContainer}>{`${baseTokenMetadata.ticker}`}</span>
                                    <span className={styles.pairNameContainer}>{`${quoteTokenMetadata.ticker}`}</span>
                                </div>
                            </div>
                            <div className={styles.vaultStatusDetailsContainer}>
                                <div className={`${styles.exchangeContainer} ${styles.vaultDetail}`}>
                                    <KeyValueComponent
                                        keyElement={<span>{`Exchange`}</span>}
                                        keyElementStyle={{
                                            color: '#888',
                                            fontWeight: 'bold'
                                        }}
                                        valueElement={<span>{`${vaultData.exchange}`}</span>}
                                        valueElementStyle={{
                                            color: 'white',
                                            fontWeight: 'bold'
                                        }}
                                        justification={KeyValueJustification.SpaceBetween}
                                    />
                                </div>
                                <div className={`${styles.baseTokenDepositsContainer} ${styles.vaultDetail}`}>
                                    <KeyValueComponent
                                        keyElement={<span>{`${baseTokenMetadata.ticker} balance`}</span>}
                                        keyElementStyle={{
                                            color: '#888',
                                            fontWeight: 'bold'
                                        }}
                                        valueElement={<span>{`${baseTokenBalance.toFixed(3)} ($${baseTokenDepositsValue.toFixed(3)})`}</span>}
                                        valueElementStyle={{
                                            color: 'white',
                                            fontWeight: 'bold'
                                        }}
                                        justification={KeyValueJustification.SpaceBetween}
                                    />
                                </div>
                                <div className={`${styles.quoteTokenDepositsContainer} ${styles.vaultDetail}`}>
                                    <KeyValueComponent
                                        keyElement={<span>{`${quoteTokenMetadata.ticker} balance`}</span>}
                                        keyElementStyle={{
                                            color: '#888',
                                            fontWeight: 'bold'
                                        }}
                                        valueElement={<span>{`${quoteTokenBalance.toFixed(3)} ($${quoteTokenDepositsValue.toFixed(3)})`}</span>}
                                        valueElementStyle={{
                                            color: 'white',
                                            fontWeight: 'bold',
                                        }}
                                        justification={KeyValueJustification.SpaceBetween}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={styles.vaultPriceChartContainer}>
                            <span>yo</span>
                        </div>
                    </div>
                :
                    <></>
            }
        </div>
    );
}

export default PairInfoRow;