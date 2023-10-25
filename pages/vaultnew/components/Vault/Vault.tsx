import React, { useEffect, useState } from "react";
import styles from "./Vault.module.css";
import { TokenMetadata, UnifiedVault } from "../../../../utils/supabase";
import TokenImageContainer, { ImageMetadata } from "../../../../components/TokenImageContainer";
import dynamic from "next/dynamic";
import { ANNOTATIONS_CHART_OPTIONS, PRICE_CHART_OPTIONS, getChartAnnotations } from "../../../../constants";
import { ApexOptions } from "apexcharts";
import { L3UiBook } from "@ellipsis-labs/phoenix-sdk";
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
    ssr: false,
  });
  
export interface VaultProps {
    vaultData: UnifiedVault,
    baseTokenMetadata: TokenMetadata,
    quoteTokenMetadata: TokenMetadata,
    priceSeries: number[][],
    midPrice: number,
    l3UiBook: L3UiBook,
    priceChangeDirection: string,
    tokenImgWidth: number,
    tokenImgHeight: number
}

const Vault = ({ vaultData, baseTokenMetadata, quoteTokenMetadata, priceSeries, l3UiBook, midPrice, priceChangeDirection, tokenImgWidth, tokenImgHeight }: VaultProps) => {

    const [annotatedChartOptions, setAnnotatedChartOptions] = useState<ApexOptions>(ANNOTATIONS_CHART_OPTIONS);
    const [chartKey, setChartKey] = useState(0);

    useEffect(() => {
        let annotations = getChartAnnotations(l3UiBook);
        let newOptions = ANNOTATIONS_CHART_OPTIONS;

        newOptions.annotations = {
            yaxis: annotations
        };

        setAnnotatedChartOptions(prev => newOptions);
        setChartKey(key => key + 1);
    }, [l3UiBook]);
    
    return (
        <div className={styles.vaultContainer}>
            <div className={styles.levelOneContainer}>
                <div className={styles.vaultMetadataContainer}>
                    <div className={styles.vaultPairDataContainer}>
                        <div className={styles.vaultTokenImagesContainer}>
                            {
                                baseTokenMetadata && quoteTokenMetadata && baseTokenMetadata.img_url && quoteTokenMetadata.img_url ?
                                    <TokenImageContainer
                                        baseTokenImageMetadata={
                                            {
                                            url: baseTokenMetadata.img_url,
                                            width: tokenImgWidth,
                                            height: tokenImgHeight,
                                            alt: `Base token: ${baseTokenMetadata.ticker}`,
                                            } as ImageMetadata
                                        }
                                        quoteTokenImageMetadata={
                                            {
                                            url: quoteTokenMetadata.img_url,
                                            width: tokenImgWidth,
                                            height: tokenImgHeight,
                                            alt: `Quote token: ${quoteTokenMetadata.ticker}`,
                                            } as ImageMetadata
                                        }
                                    />
                                :
                                    <></>
                            }
                        </div>
                        <div className={styles.vaultPairNameContainer}>
                            {
                                baseTokenMetadata && quoteTokenMetadata && baseTokenMetadata.ticker && quoteTokenMetadata.ticker ?
                                    <div>
                                        <span className={styles.vaultPairName}>
                                            {`${baseTokenMetadata.ticker}`}
                                        </span>
                                        <span className={styles.vaultPairName}>
                                            {`${quoteTokenMetadata.ticker}`}
                                        </span>
                                    </div>
                                :
                                    <></>
                            }
                        </div>
                    </div>
                    <div className={styles.vaultExchangeDataContainer}>
                        {
                            vaultData && vaultData.exchange ?
                                <span className={styles.exchangeName}>{vaultData.exchange}</span>
                            :
                                <></>
                        }
                    </div>
                </div>
                <div className={styles.vaultPriceContainer}>
                    {
                        midPrice ?
                            <span className={styles.vaultPrice}
                                style={{
                                    color: priceChangeDirection === '▲' ? '#35c674' : '#ca3329'
                                }}
                            >
                                {`${midPrice}`}
                            </span>
                        :
                            <></>
                    }
                </div>
            </div>
            <div className={styles.levelTwoContainer}>
                <div className={styles.chartsContainer}>
                    <div className={styles.priceChartContainer}>
                        {
                            priceSeries && priceSeries.length > 0 ?
                            <ReactApexChart
                                type="area"
                                height={500}
                                options={PRICE_CHART_OPTIONS}
                                series={[
                                {
                                    data: priceSeries
                                }
                                ]}
                                className={`chart`}
                            />
                            :
                            <div className={styles.loadingPricesContainer}>
                                <span className={styles.loadingPricesText}>Loading prices...</span>
                            </div>
                        }
                    </div>
                    <div className={styles.annotationsContainer}>
                        {
                            priceSeries && priceSeries.length > 0 ?
                            <ReactApexChart
                                key={chartKey}
                                height={500}
                                options={annotatedChartOptions}
                                series={[
                                {
                                    data: priceSeries
                                }
                                ]}
                                className={`chart`}
                            />
                            :
                            <div className={styles.loadingPricesContainer}>
                                <span className={styles.loadingPricesText}>Loading orders...</span>
                            </div>
                        }
                    </div>
                </div>
                <div className={styles.liveTradingTitleContainer}>
                    <svg height="25" width="25" className={styles.blinking}>
                        <circle cx="10" cy="10" r="6" fill="#aaa" />
                        Sorry, your browser does not support inline SVG.  
                    </svg>
                    <div className={styles.liveTradingText}>
                        <span>Live trading</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Vault;