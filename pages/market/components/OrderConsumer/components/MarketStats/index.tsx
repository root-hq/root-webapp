import React, { useEffect, useRef, useState } from "react";
import styles from "./MarketStats.module.css";
import { makeApiRequest } from "../../../../../../utils/birdeye/helpers";
import { EnumeratedMarketToMetadata } from "pages/market/[market]";
import { formatWithCommas } from "utils";
import { MARKET_STATS_REFRESH_FREQUENCY_IN_MS, PRICE_REFRESH_FREQUENCY_IN_MS } from "constants/";

export interface MarketStatsProps {
    enumeratedMarket: EnumeratedMarketToMetadata;
}

const MarketStats = ({
    enumeratedMarket
}: MarketStatsProps) => {
    
    const currentPrice = useRef<number>(0.0);
    const [instantaneousPriceIncrease, setInstantaneousPriceIncrease] = useState<boolean>(true);
    const [dailyHigh, setDailyHigh] = useState<number>(0.0);
    const [dailyLow, setDailyLow] = useState<number>(0.0);
    const [dailyVolumeBase, setDailyVolumeBase] = useState<number>(0.0);
    const [dailyVolumeQuote, setDailyVolumeQuote] = useState<number>(0.0);

    useEffect(() => {
        const refreshMarketStats = async() => {
            if(!enumeratedMarket) {
                return;
            }

            const currentTimeMillis = Date.now();
            const oneSecondBefore = Math.floor((currentTimeMillis - 1000) / 1000);
            const oneDayBefore = Math.floor((currentTimeMillis - (24 * 60 * 60 * 1000)) / 1000);

            const freshStatsData = await makeApiRequest(`defi/ohlcv/base_quote?base_address=${enumeratedMarket.baseTokenMetadata.mint}&quote_address=${enumeratedMarket.quoteTokenMetadata.mint}&type=1D&time_from=${oneDayBefore}&time_to=${oneSecondBefore}`);

            if(freshStatsData.success) {
                const data = freshStatsData.data.items[0];
                setDailyHigh(_ => data.h);
                setDailyLow(_ => data.l);
                setDailyVolumeBase(_ => data.vBase);
                setDailyVolumeQuote(_ => data.vQuote);
            }
        }

        refreshMarketStats();

        const intervalId = setInterval(() => {
            refreshMarketStats();
          }, MARKET_STATS_REFRESH_FREQUENCY_IN_MS);
      
          return () => clearInterval(intervalId);
    }, [enumeratedMarket]);


    useEffect(() => {
        const refreshLatestPrice = async() => {
            if(!enumeratedMarket) {
                return;
            }

            const currentTimeMillis = Date.now();
            const oneSecondBefore = Math.floor((currentTimeMillis - 1_000) / 1000);
            const oneMinuteBefore = Math.floor((currentTimeMillis - 60_000) / 1000);

            const freshStatsData = await makeApiRequest(`defi/ohlcv/base_quote?base_address=${enumeratedMarket.baseTokenMetadata.mint}&quote_address=${enumeratedMarket.quoteTokenMetadata.mint}&type=1m&time_from=${oneMinuteBefore}&time_to=${oneSecondBefore}`);

            if(freshStatsData.success) {
                const data = freshStatsData.data.items[0];
                let newPrice = (data.o + data.c) / 2.0;

                if(newPrice > currentPrice.current) {
                    setInstantaneousPriceIncrease(_ => true);
                }
                else if(currentPrice.current > newPrice) {
                    setInstantaneousPriceIncrease(_ => false);
                }

                currentPrice.current = newPrice;
            }
        }

        refreshLatestPrice();

        const intervalId = setInterval(() => {
            refreshLatestPrice();
          }, PRICE_REFRESH_FREQUENCY_IN_MS);
      
          return () => clearInterval(intervalId);
    }, [enumeratedMarket]);

    return (
        <div className={styles.marketStatsContainer}>
            <div className={styles.currentPriceContainer}>
                <div
                    className={styles.currentPrice}
                    style= {{
                        color: instantaneousPriceIncrease ? `#3DE383` : '#e33d3d'
                    }}
                >
                    {currentPrice.current.toFixed(4)}
                </div>
            </div>
            <div className={styles.marketStat}>
                <div className={styles.statKey}>
                    24h High
                </div>
                <div className={styles.statValue}>
                    {dailyHigh.toFixed(4)}
                </div>
            </div>
            <div className={styles.marketStat}>
                <div className={styles.statKey}>
                    24h Low
                </div>
                <div className={styles.statValue}>
                    {dailyLow.toFixed(4)}
                </div>
            </div>
            <div className={styles.marketStat}>
                <div className={styles.statKey}>
                    24h Volume(SOL)
                </div>
                <div className={styles.statValue}>
                    {formatWithCommas(dailyVolumeBase.toFixed(2))}
                </div>
            </div>
            <div className={styles.marketStat}>
                <div className={styles.statKey}>
                    24h Volume(USDC)
                </div>
                <div className={styles.statValue}>
                    {formatWithCommas(dailyVolumeQuote.toFixed(2))}
                </div>
            </div>
        </div>
    )
}

export default MarketStats;