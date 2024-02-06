import React, { useEffect, useState } from "react";
import styles from "./OrderConsumer.module.css";
import { SpotGridMarket, TokenMetadata } from "../../../../utils/supabase";
import { EnumeratedMarketToMetadata } from "../../[market]";
import { SeriesManagerInstance } from "./components/LightweightChart";

import { ChartingLibraryWidgetOptions, ResolutionString } from "public/static/charting_library/charting_library";
const TVChartContainer = dynamic(() => import("./components/TradingViewChart").then((mod) => mod.TVChartContainer), {ssr: false});

const MarketSelectorDropdown = dynamic(
  () => import("./components/MarketSelectorDropdown"),
  { ssr: false },
);
const LightweightChart = dynamic(
  () => import("./components/LightweightChart"),
  { ssr: false },
);
const OrderManager = dynamic(() => import("./components/OrderManager"), {
  ssr: false,
});

import { IChartApi } from "lightweight-charts";
import { Client } from "@ellipsis-labs/phoenix-sdk";
import dynamic from "next/dynamic";
import { Connection } from "@solana/web3.js";

export interface OrderConsumerProps {
  enumeratedMarkets: EnumeratedMarketToMetadata[];
  selectedSpotGridMarket: SpotGridMarket;
  baseTokenMetadata: TokenMetadata;
  quoteTokenMetadata: TokenMetadata;
  phoenixClient: Client;
  seriesManagerHandler: React.MutableRefObject<SeriesManagerInstance>;
  chartManagerHandler: React.MutableRefObject<IChartApi>;
  leastDisplayDate: React.MutableRefObject<Date>;
  leastKnownBar: React.MutableRefObject<number>;
  connection: Connection;
}

const OrderConsumer = ({
  enumeratedMarkets,
  selectedSpotGridMarket,
  baseTokenMetadata,
  quoteTokenMetadata,
  phoenixClient,
  seriesManagerHandler,
  chartManagerHandler,
  leastDisplayDate,
  leastKnownBar,
  connection
}: OrderConsumerProps) => {
  const [activeMarket, setActiveMarket] = useState(selectedSpotGridMarket);
  const [activeEnumeratedMarket, setActiveEnumeratedMarket] =
    useState<EnumeratedMarketToMetadata>(null);

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
    symbol: `${baseTokenMetadata.mint}/${quoteTokenMetadata.mint}`,
    interval: "5" as ResolutionString,
    library_path: "/static/charting_library/",
    locale: "en",
    fullscreen: false,
    autosize: true,
  };


  return (
    <div className={styles.orderConsumerContainer}>
      <div className={styles.orderVisualContainer}>
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
        </div>
        <div className={styles.lightweightChartContainer}>
          {/* <LightweightChart
            selectedSpotGridMarket={activeMarket}
            baseTokenMetadata={baseTokenMetadata}
            quoteTokenMetadata={quoteTokenMetadata}
            seriesManagerHandler={seriesManagerHandler}
            chartManagerHandler={chartManagerHandler}
            leastDisplayDate={leastDisplayDate}
            leastKnownBar={leastKnownBar}
          /> */}
          <TVChartContainer {...defaultWidgetProps}/>
        </div>
      </div>
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
  );
};

export default OrderConsumer;
