import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./OrderConsumer.module.css";
import { PhoenixMarket, TokenMetadata } from "../../../../utils/supabase";
import { EnumeratedMarketToMetadata } from "../../[market]";

import {
  ChartingLibraryWidgetOptions,
  ResolutionString,
} from "public/static/charting_library/charting_library";
const TVChartContainer = dynamic(
  () => import("./components/TradingViewChart").then((mod) => mod),
  { ssr: false },
);

const MarketSelectorDropdown = dynamic(
  () => import("./components/MarketSelectorDropdown"),
  { ssr: false },
);
const OrderManager = dynamic(() => import("./components/OrderManager"), {
  ssr: false,
});
const MarketStats = dynamic(() => import("./components/MarketStats"), {
  ssr: false,
});
const Orderbook = dynamic(() => import("./components/Orderbook"), {
  ssr: false,
});

import dynamic from "next/dynamic";
import { Connection } from "@solana/web3.js";
import {
  ChartType,
  DEFAULT_RESOLUTION,
  USDC_MAINNET,
  WRAPPED_SOL_MAINNET,
} from "constants/";
import { useRootState } from "components/RootStateContextType";

export interface OrderConsumerProps {
  enumeratedMarkets: Map<string, EnumeratedMarketToMetadata>;
  selectedPhoenixMarket: PhoenixMarket;
  baseTokenMetadata: TokenMetadata;
  quoteTokenMetadata: TokenMetadata;
  connection: Connection;
}

const OrderConsumer = ({
  enumeratedMarkets,
  selectedPhoenixMarket,
  baseTokenMetadata,
  quoteTokenMetadata,
  connection,
}: OrderConsumerProps) => {
  const { isMobile } = useRootState();

  const [activeMarket, setActiveMarket] = useState(selectedPhoenixMarket);
  const [activeEnumeratedMarket, setActiveEnumeratedMarket] =
    useState<EnumeratedMarketToMetadata>(null);

  const [chartType, setChartType] = useState<ChartType>(isMobile.current ? ChartType.Lite : ChartType.Pro);
  const [showOrderBook, setShowOrderBook] = useState<boolean>(isMobile.current ? false : true);
  const [enumeratedMarketsArray, setEnumeratedMarketsArray] = useState<EnumeratedMarketToMetadata[]>([]);

  const dummyCounter = useRef<number>(0);

  const handleChartTypeToggle = () => {
    if (chartType === ChartType.Lite) {
      setChartType((_) => ChartType.Pro);
      setShowOrderBook((_) => true);
    } else if (chartType === ChartType.Pro) {
      setChartType((_) => ChartType.Lite);
      setShowOrderBook((_) => false);
    }
  };

  const handleShowOrderBookToggle = () => {
    setShowOrderBook((prev) => !prev);
  };

  useEffect(() => {
    const doStuff = () => {
      setActiveMarket((_) => selectedPhoenixMarket);

      if (selectedPhoenixMarket) {
        let aem = enumeratedMarkets.get(selectedPhoenixMarket.phoenix_market_address);
        setActiveEnumeratedMarket((_) => aem);
      }
    };

    doStuff();
  }, [selectedPhoenixMarket]);

  useEffect(() => {
    const incrementer = () => {
      dummyCounter.current += 1;
    };

    incrementer();

    const intervalId = setInterval(
      () => {
        incrementer();
      },
      DEFAULT_RESOLUTION * 1_000 * 60,
    );

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const doStuff = () => {
      let ema = [];
      enumeratedMarkets.forEach((entry) => {
        ema.push(entry);
      });
      setEnumeratedMarketsArray(_ => ema);
    }

    doStuff();
  }, [enumeratedMarkets]);

  const defaultWidgetProps: Partial<ChartingLibraryWidgetOptions> = {
    symbol: `${baseTokenMetadata ? baseTokenMetadata.mint : WRAPPED_SOL_MAINNET}/${baseTokenMetadata ? baseTokenMetadata.ticker: `SOL`}/${quoteTokenMetadata ? quoteTokenMetadata.mint : USDC_MAINNET}/${quoteTokenMetadata ? quoteTokenMetadata.ticker : `USDC`}/${selectedPhoenixMarket ? selectedPhoenixMarket.tick_size : `0.001`}`,
    interval: `${DEFAULT_RESOLUTION}` as ResolutionString,
    library_path: "/static/charting_library/",
    locale: "en",
    fullscreen: false,
    autosize: true,
    client_id: "root.exchange",
  };

  const memoizedTradingViewChart = useMemo(
    () => <TVChartContainer props={defaultWidgetProps} chartType={chartType} paneColor={`#0b0c11`} isBotPage={false}/>,
    [chartType, selectedPhoenixMarket, dummyCounter.current],
  );
  const memoizedOrderbook = useMemo(() => {
    return <Orderbook enumeratedMarket={activeEnumeratedMarket} />;
  }, [selectedPhoenixMarket, activeEnumeratedMarket]);

  return (
    <div className={styles.orderConsumerContainer}>
      <div className={styles.marketDataContainer}>
        <div
          className={styles.chartContainer}
          style={{
            width: !showOrderBook ? `100%` : ``,
          }}
        >
          <div className={styles.marketInfoContainer}>
            <div className={styles.marketSelectorContainer}>
              <MarketSelectorDropdown
                enumeratedMarkets={enumeratedMarketsArray}
                selectedBaseTokenMetadata={baseTokenMetadata}
                selectedQuoteTokenMetadata={quoteTokenMetadata}
                topLevelActiveMarketState={activeMarket}
                setTopLevelActiveMarketState={setActiveMarket}
                isBotPage={true}
              />
            </div>
            <div className={styles.marketStatsContainer}>
              <MarketStats
                enumeratedMarket={activeEnumeratedMarket}
                showOrderBook={showOrderBook}
                isBotPage={false}
              />
            </div>
          </div>
          <div className={styles.tradingViewChartContainer}>
            {memoizedTradingViewChart}
          </div>
          <div className={styles.toggleContainer}>
            <div
              className={styles.chartTypeToggle}
              onClick={() => {
                handleChartTypeToggle();
              }}
            >
              <span
                className={styles.chartTypeTextLite}
                style={{
                  color: chartType === ChartType.Lite ? `#477df2` : ``,
                  fontWeight: chartType === ChartType.Lite ? `bold` : ``,
                }}
              >
                {`Lite`}
              </span>
              <span className={styles.chartTypeToggleIcon}>
                <i className="fa-solid fa-right-left"></i>
              </span>
              <span
                className={styles.chartTypeTextPro}
                style={{
                  color: chartType === ChartType.Pro ? `#477df2` : ``,
                  fontWeight: chartType === ChartType.Pro ? `bold` : ``,
                }}
              >
                {`Pro`}
              </span>
            </div>
            <div
              className={styles.showOrderBookToggle}
              onClick={() => {
                handleShowOrderBookToggle();
              }}
              style={{
                color: showOrderBook ? `#477df2` : ``,
                // fontWeight: showOrderBook ? `bold` : ``,
              }}
            >
              <span className={styles.showOrderBookToggleIcon}>
                {showOrderBook ? (
                  <i className="fa-solid fa-toggle-on"></i>
                ) : (
                  <i className="fa-solid fa-toggle-off"></i>
                )}
              </span>
              <span className={styles.showOrderBookText}>{`Orderbook`}</span>
            </div>
          </div>
        </div>
        <div
          className={styles.orderBookContainer}
          style={{
            display: !showOrderBook ? `none` : ``,
          }}
        >
          {showOrderBook ? memoizedOrderbook : <></>}
        </div>
      </div>
      <div className={styles.orderManagerOuterContainer}>
        <div className={styles.orderManagerContainer}>
          <OrderManager
            enumeratedMarket={activeEnumeratedMarket}
            baseTokenMetadata={baseTokenMetadata}
            quoteTokenMetadata={quoteTokenMetadata}
          />
        </div>
      </div>
    </div>
  );
};

export default OrderConsumer;
