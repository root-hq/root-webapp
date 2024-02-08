import React, { useEffect, useState } from "react";
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
import { ChartType } from "constants/";

export interface OrderConsumerProps {
  enumeratedMarkets: EnumeratedMarketToMetadata[];
  selectedSpotGridMarket: SpotGridMarket;
  baseTokenMetadata: TokenMetadata;
  quoteTokenMetadata: TokenMetadata;
  phoenixClient: Client;
  connection: Connection;
}

const OrderConsumer = ({
  enumeratedMarkets,
  selectedSpotGridMarket,
  baseTokenMetadata,
  quoteTokenMetadata,
  phoenixClient,
  connection,
}: OrderConsumerProps) => {
  const [activeMarket, setActiveMarket] = useState(selectedSpotGridMarket);
  const [activeEnumeratedMarket, setActiveEnumeratedMarket] =
    useState<EnumeratedMarketToMetadata>(null);

  const [chartType, setChartType] = useState<ChartType>(ChartType.Simple);

  const handleChartTypeToggle = () => {
    if(chartType === ChartType.Simple) {
      setChartType(_ => ChartType.Advanced);
    }

    else if(chartType === ChartType.Advanced) {
      setChartType(_ => ChartType.Simple);
    }
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
    symbol: `${baseTokenMetadata.mint}/${quoteTokenMetadata.mint}/${selectedSpotGridMarket ? selectedSpotGridMarket.tick_size : `0.001`}`,
    interval: "5" as ResolutionString,
    library_path: "/static/charting_library/",
    locale: "en",
    fullscreen: false,
    autosize: true,
  };

  return (
    <div className={styles.orderConsumerContainer}>
      <div className={styles.marketDataContainer}>
        <div className={styles.chartContainer}
          style = {{
            width: chartType === ChartType.Simple ? `100%` : ``
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
            <TVChartContainer props={defaultWidgetProps} chartType={chartType} />
          </div>
          <div className={styles.chartTypeToggleContainer}>
            <div className={styles.chartTypeToggle}
              onClick={
                () => {
                  handleChartTypeToggle()
                }
              }
            >
              <span className={styles.chartTypeTextSimple}
                style={{
                  color: chartType === ChartType.Simple ? `#477df2` : ``,
                  fontWeight: chartType === ChartType.Simple ? `bold` : ``,
                }}
              >
                {`Simple`}
              </span>
              <span className={styles.chartTypeToggleIcon}><i className="fa-solid fa-right-left"></i></span>
              <span className={styles.chartTypeTextAdvanced}
                style={{
                  color: chartType === ChartType.Advanced ? `#477df2` : ``,
                  fontWeight: chartType === ChartType.Advanced ? `bold` : ``
                }}
              >
                {`Advanced`}
              </span>
            </div>
          </div>
        </div>
        <div className={styles.orderBookContainer}
          style = {{
            display: chartType === ChartType.Simple ? `none` : ``
          }}
        >
          <Orderbook />
        </div>
      </div>
      <div className={styles.orderManagerOuterContainer}>
        <div className={styles.orderManagerContainer}>
          <OrderManager
            enumeratedMarket={activeEnumeratedMarket}
            baseTokenMetadata={baseTokenMetadata}
            quoteTokenMetadata={quoteTokenMetadata}
            phoenixClient={phoenixClient}
            connection={connection}
          />
        </div>
      </div>
    </div>
  );
};

export default OrderConsumer;
