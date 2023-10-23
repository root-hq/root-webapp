import React from "react";
import styles from "./Vault.module.css";
import { TokenMetadata, UnifiedVault } from "../../../../utils/supabase";
import TokenImageContainer, { ImageMetadata } from "../../../../components/TokenImageContainer";

export interface VaultProps {
    vaultData: UnifiedVault,
    baseTokenMetadata: TokenMetadata,
    quoteTokenMetadata: TokenMetadata,
    midPrice: number,
    priceChangeDirection: string,
    tokenImgWidth: number,
    tokenImgHeight: number
}

const Vault = ({ vaultData, baseTokenMetadata, quoteTokenMetadata, midPrice, priceChangeDirection, tokenImgWidth, tokenImgHeight }: VaultProps) => {
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
            </div>
        </div>
    )
}

export default Vault;