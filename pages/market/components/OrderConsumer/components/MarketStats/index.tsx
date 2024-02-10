import React, { useEffect, useRef, useState } from "react";
import styles from "./MarketStats.module.css";
import { makeApiRequest } from "../../../../../../utils/birdeye/helpers";
import { EnumeratedMarketToMetadata } from "pages/market/[market]";
import { decimalPlacesFromTickSize, formatWithCommas, toScientificNotation } from "utils";
import {
  MARKET_STATS_REFRESH_FREQUENCY_IN_MS,
} from "constants/";
import { useRootState } from "components/RootStateContextType";

export interface MarketStatsProps {
  enumeratedMarket: EnumeratedMarketToMetadata;
  showOrderBook: boolean;
}

const MarketStats = ({ enumeratedMarket, showOrderBook }: MarketStatsProps) => {
  const { midPrice, instantaneousPriceIncrease } = useRootState();

  const [dailyHigh, setDailyHigh] = useState<number>(0.0);
  const [dailyLow, setDailyLow] = useState<number>(0.0);
  const [dailyVolumeBase, setDailyVolumeBase] = useState<number>(0.0);
  const [dailyVolumeQuote, setDailyVolumeQuote] = useState<number>(0.0);

  useEffect(() => {
    const refreshMarketStats = async () => {
      if (!enumeratedMarket) {
        return;
      }

      try {
        const currentTimeMillis = Date.now();
        const oneSecondBefore = Math.floor((currentTimeMillis - 1000) / 1000);
        const oneDayBefore = Math.floor(
          (currentTimeMillis - 24 * 60 * 60 * 1000) / 1000,
        );

        const freshStatsData = await makeApiRequest(
          `defi/ohlcv/base_quote?base_address=${enumeratedMarket.baseTokenMetadata.mint}&quote_address=${enumeratedMarket.quoteTokenMetadata.mint}&type=1D&time_from=${oneDayBefore}&time_to=${oneSecondBefore}`,
        );

        if (freshStatsData.success) {
          const data = freshStatsData.data.items[0];
          setDailyHigh((_) => data.h);
          setDailyLow((_) => data.l);
          setDailyVolumeBase((_) => data.vBase);
          setDailyVolumeQuote((_) => data.vQuote);
        }
      }
      catch(err) {
        console.log(`Error refreshing market stats: `, err);
      }
    };

    refreshMarketStats();

    const intervalId = setInterval(() => {
      refreshMarketStats();
    }, MARKET_STATS_REFRESH_FREQUENCY_IN_MS);

    return () => clearInterval(intervalId);
  }, [enumeratedMarket]);

  const [isMobile, setIsMobile] = useState(false);
  const [windowWidth, setWindowWidth] = useState<number>(0.0);
  const [windowHeight, setWindowHeight] = useState<number>(0.0);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(_ => window.innerWidth);
      setWindowHeight(_ => window.innerHeight);
      setIsMobile(window.innerWidth <= 700); // Adjust the max-width according to your preference
    };

    handleResize(); // Call it initially

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className={styles.marketStatsContainer}>
      <div className={styles.currentPriceContainer}
        
      >
        <div
          className={styles.currentPrice}
          style={{
            color: instantaneousPriceIncrease ? `#3DE383` : "#e33d3d",
            fontSize: windowWidth < 400 ? `0.95rem` : ``,
          }}
        >
          {
            !isMobile ?
              <>{midPrice.current.toFixed(decimalPlacesFromTickSize(enumeratedMarket ? enumeratedMarket.spotGridMarket.tick_size : `0.001`))}</>
            :
              <>
              {
                decimalPlacesFromTickSize(enumeratedMarket ? enumeratedMarket.spotGridMarket.tick_size : `0.001`) >= 5 ?
                  <>{toScientificNotation(midPrice.current)}</>
                :
                  <>{midPrice.current.toFixed(decimalPlacesFromTickSize(enumeratedMarket ? enumeratedMarket.spotGridMarket.tick_size : `0.001`))}</>
              }
              </>
          }
        </div>
      </div>
      <div className={styles.marketStat}>
        <div className={styles.statKey}>24h High</div>
        <div className={styles.statValue}>{dailyHigh.toFixed(decimalPlacesFromTickSize(enumeratedMarket ? enumeratedMarket.spotGridMarket.tick_size : `0.001`))}</div>
      </div>
      <div className={styles.marketStat}>
        <div className={styles.statKey}>24h Low</div>
        <div className={styles.statValue}>{dailyLow.toFixed(decimalPlacesFromTickSize(enumeratedMarket ? enumeratedMarket.spotGridMarket.tick_size : `0.001`))}</div>
      </div>
      <div className={styles.marketStat}>
        <div className={styles.statKey}>24h volume({`${enumeratedMarket ? enumeratedMarket.quoteTokenMetadata.ticker : ``}`})</div>
        <div className={styles.statValue}>
          {formatWithCommas(((dailyVolumeBase * (dailyHigh + dailyLow / 2.0)) + dailyVolumeQuote).toFixed(2))}
        </div>
      </div>
    </div>
  );
};

export default MarketStats;
