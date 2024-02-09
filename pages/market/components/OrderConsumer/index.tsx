import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./OrderConsumer.module.css";
import { SpotGridMarket, TokenMetadata } from "../../../../utils/supabase";
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
  ssr: false
});

import { Client } from "@ellipsis-labs/phoenix-sdk";
import dynamic from "next/dynamic";
import { Connection } from "@solana/web3.js";
import { ChartType, USDC_MAINNET, WRAPPED_SOL_MAINNET } from "constants/";

export interface OrderConsumerProps {
  enumeratedMarkets: EnumeratedMarketToMetadata[];
  selectedSpotGridMarket: SpotGridMarket;
  baseTokenMetadata: TokenMetadata;
  quoteTokenMetadata: TokenMetadata;
  connection: Connection;
}

const OrderConsumer = ({
  enumeratedMarkets,
  selectedSpotGridMarket,
  baseTokenMetadata,
  quoteTokenMetadata,
  connection,
}: OrderConsumerProps) => {
  const [activeMarket, setActiveMarket] = useState(selectedSpotGridMarket);
  const [activeEnumeratedMarket, setActiveEnumeratedMarket] =
    useState<EnumeratedMarketToMetadata>(null);

  const [chartType, setChartType] = useState<ChartType>(ChartType.Lite);
  const [showOrderBook, setShowOrderBook] = useState<boolean>(true);

  const handleChartTypeToggle = () => {
    if(chartType === ChartType.Lite) {
      setChartType(_ => ChartType.Pro);
    }

    else if(chartType === ChartType.Pro) {
      setChartType(_ => ChartType.Lite);
    }
  }

  const handleShowOrderBookToggle = () => {
    setShowOrderBook(prev  => !prev);
  }

  useEffect(() => {
    const doStuff = () => {
      setActiveMarket((_) => selectedSpotGridMarket);

      if (selectedSpotGridMarket) {
        let aem = enumeratedMarkets.find((value) => {
          return (
            value.spotGridMarket.spot_grid_market_address ===
            selectedSpotGridMarket.spot_grid_market_address
          );
        });
        setActiveEnumeratedMarket((_) => aem);
      }
    };

    doStuff();
  }, [selectedSpotGridMarket]);

  const defaultWidgetProps: Partial<ChartingLibraryWidgetOptions> = {
    symbol: `${baseTokenMetadata ? baseTokenMetadata.mint : WRAPPED_SOL_MAINNET}/${quoteTokenMetadata ? quoteTokenMetadata.mint : USDC_MAINNET}/${selectedSpotGridMarket ? selectedSpotGridMarket.tick_size : `0.001`}`,
    interval: "5" as ResolutionString,
    library_path: "/static/charting_library/",
    locale: "en",
    fullscreen: false,
    autosize: true,
  };

  const memoizedTradingViewChart = useMemo(() => <TVChartContainer props={defaultWidgetProps} chartType={chartType} />, [chartType, selectedSpotGridMarket]);
  const memoizedOrderbook = useMemo(() => {
    return (
      showOrderBook ?
        <Orderbook enumeratedMarket={activeEnumeratedMarket}/>
      :
        <></>
    );
  }, [selectedSpotGridMarket]);

  return (
    <div className={styles.orderConsumerContainer}>
      <div className={styles.marketDataContainer}>
        <div className={styles.chartContainer}
          style = {{
            width: !showOrderBook ? `100%` : ``
          }}
        >
          <div className={styles.marketInfoContainer}>
            <div className={styles.marketSelectorContainer}>
              <MarketSelectorDropdown
                enumeratedMarkets={enumeratedMarkets}
                selectedBaseTokenMetadata={baseTokenMetadata}
                selectedQuoteTokenMetadata={quoteTokenMetadata}
                topLevelActiveMarketState={activeMarket}
                setTopLevelActiveMarketState={setActiveMarket}
              />
            </div>
            <div className={styles.marketStatsContainer}>
              <MarketStats enumeratedMarket={activeEnumeratedMarket} />
            </div>
          </div>
          <div className={styles.tradingViewChartContainer}>
            {memoizedTradingViewChart}
          </div>
          <div className={styles.toggleContainer}>
            <div className={styles.chartTypeToggle}
              onClick={
                () => {
                  handleChartTypeToggle()
                }
              }
            >
              <span className={styles.chartTypeTextLite}
                style={{
                  color: chartType === ChartType.Lite ? `#477df2` : ``,
                  fontWeight: chartType === ChartType.Lite ? `bold` : ``,
                }}
              >
                {`Lite`}
              </span>
              <span className={styles.chartTypeToggleIcon}><i className="fa-solid fa-right-left"></i></span>
              <span className={styles.chartTypeTextPro}
                style={{
                  color: chartType === ChartType.Pro ? `#477df2` : ``,
                  fontWeight: chartType === ChartType.Pro ? `bold` : ``
                }}
              >
                {`Pro`}
              </span>
            </div>
            <div className={styles.showOrderBookToggle}
              onClick={
                () => {
                  handleShowOrderBookToggle()
                }
              }
              style={{
                color: showOrderBook ? `#477df2` : ``,
                // fontWeight: showOrderBook ? `bold` : ``,
              }}
            >
              <span className={styles.showOrderBookToggleIcon}>
                {
                  showOrderBook ?
                    <i
                    className="fa-solid fa-toggle-on"></i>
                  :
                    <i className="fa-solid fa-toggle-off"></i>
                }
              </span>
              <span className={styles.showOrderBookText}
              >
                {`Orderbook`}
              </span>
            </div>
          </div>
        </div>
        <div className={styles.orderBookContainer}
          style = {{
            display: !showOrderBook ? `none` : ``
          }}
        >
          {memoizedOrderbook}
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
