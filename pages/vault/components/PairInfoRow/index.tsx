import React, { useEffect, useState } from 'react';
import styles from './PairInfoRow.module.css';
import { TokenMetadata, UnifiedVault } from '../../../../utils/supabase';
import TokenImageContainer, { ImageMetadata } from '../../../../components/TokenImageContainer';
import KeyValueComponent, { KeyValueJustification } from '../../../../components/KeyValueComponent';
import { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';
import { PRICE_CHART_OPTIONS } from '../../../../constants/config';
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

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

    const [priceSeries, setPriceSeries] = useState([
        {
            data: [31, 40, 28, 51, 42, 109, 100]
        }
    ]);
    
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
                                <div className={styles.pairDetailsContainer}>
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
                                <div className={styles.aprDetailsContainer}>
                                    {/* <span className={styles.aprKey}>APR</span>
                                    <span className={styles.aprValue}>300%</span> */}
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
                                        valueElementContainerStyle={{
                                            textAlign: 'right'
                                        }}
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
                                        valueElementContainerStyle={{
                                            textAlign: 'right'
                                        }}
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
                                        valueElementContainerStyle={{
                                            textAlign: 'right'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={styles.vaultPriceChartContainer}>
                        <ReactApexChart type='area' height= {150} options={PRICE_CHART_OPTIONS} series={priceSeries} className={`chart`}/>
                        </div>
                    </div>
                :
                    <></>
            }
        </div>
    );
}

export default PairInfoRow;