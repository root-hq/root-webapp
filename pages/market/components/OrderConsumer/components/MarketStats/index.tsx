import React, { useEffect, useRef, useState } from "react";
import styles from "./MarketStats.module.css";
import { makeApiRequest } from "../../../../../../utils/birdeye/helpers";
import { EnumeratedMarketToMetadata } from "pages/market/[market]";
import {
  decimalPlacesFromTickSize,
  formatWithCommas,
  justFormatNumbersWithCommas,
  toScientificNotation,
} from "utils";
import { MARKET_STATS_REFRESH_FREQUENCY_IN_MS } from "constants/";
import { useRootState } from "components/RootStateContextType";

export interface MarketStatsProps {
  enumeratedMarket: EnumeratedMarketToMetadata;
  showOrderBook: boolean;
  isBotPage: boolean;
}

const MarketStats = ({ enumeratedMarket, showOrderBook, isBotPage }: MarketStatsProps) => {
  const { midPrice, instantaneousPriceIncrease, innerWidth, isMobile } =
    useRootState();

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
      } catch (err) {
        console.log(`Error refreshing market stats: `, err);
      }
    };

    refreshMarketStats();

    const intervalId = setInterval(() => {
      refreshMarketStats();
    }, MARKET_STATS_REFRESH_FREQUENCY_IN_MS);

    return () => clearInterval(intervalId);
  }, [enumeratedMarket]);

  return (
    <div className={styles.marketStatsContainer}>
      <div className={styles.currentPriceContainer}>
        <div
          className={styles.currentPrice}
          style={{
            color: instantaneousPriceIncrease ? `#3DE383` : "#e33d3d",
            fontSize: innerWidth.current < 400 ? `0.95rem` : ``,
          }}
        >
          {!isMobile.current ? (
            <span>
              {
                justFormatNumbersWithCommas(
                  midPrice.current.toFixed(
                    decimalPlacesFromTickSize(
                      enumeratedMarket
                        ? enumeratedMarket.phoenixMarket.tick_size
                        : `0.001`,
                    ),
                  )
                )
              }
            </span>
          ) : (
            <span style={{ fontSize: `0.9rem` }}>
              {decimalPlacesFromTickSize(
                enumeratedMarket
                  ? enumeratedMarket.phoenixMarket.tick_size
                  : `0.001`,
              ) >= 6 ? (
                <>{toScientificNotation(midPrice.current)}</>
              ) : (
                <>
                  {
                    justFormatNumbersWithCommas(
                      midPrice.current.toFixed(
                        decimalPlacesFromTickSize(
                          enumeratedMarket
                            ? enumeratedMarket.phoenixMarket.tick_size
                            : `0.001`,
                        ),
                      )
                    )
                  }
                </>
              )}
            </span>
          )}
        </div>
      </div>
      <div className={styles.marketStat} style={{display: isBotPage ? `none`: ``}}>
        <div className={styles.statKey}>24h High</div>
        <div className={styles.statValue}>
          {dailyHigh.toFixed(
            decimalPlacesFromTickSize(
              enumeratedMarket
                ? enumeratedMarket.phoenixMarket.tick_size
                : `0.001`,
            ),
          )}
        </div>
      </div>
      <div className={styles.marketStat} style={{display: isBotPage ? `none`: ``}}>
        <div className={styles.statKey}>24h Low</div>
        <div className={styles.statValue}>
          {dailyLow.toFixed(
            decimalPlacesFromTickSize(
              enumeratedMarket
                ? enumeratedMarket.phoenixMarket.tick_size
                : `0.001`,
            ),
          )}
        </div>
      </div>
      <div className={styles.marketStat} style={{display: isBotPage ? `none`: ``}}>
        <div className={styles.statKey}>
          24h volume(
          {`${enumeratedMarket ? enumeratedMarket.quoteTokenMetadata.ticker : ``}`}
          )
        </div>
        <div className={styles.statValue}>
          {formatWithCommas(
            (
              dailyVolumeQuote
            ).toFixed(2),
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketStats;
