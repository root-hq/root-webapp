import React, { useEffect, useState } from "react";
import styles from "./OrderConsumer.module.css";
import { SpotGridMarket, TokenMetadata } from "../../../../utils/supabase";
import MarketSelectorDropdown from "./components/MarketSelectorDropdown";
import { EnumeratedMarketToMetadata } from "../../[market]";
import LightweightChart, { SeriesManagerInstance } from "./components/LightweightChart";
import { IChartApi } from "lightweight-charts";
import OrderManager from "./components/OrderManager";
import { Client } from "@ellipsis-labs/phoenix-sdk";

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
  leastKnownBar
}: OrderConsumerProps) => {
  const [activeMarket, setActiveMarket] = useState(selectedSpotGridMarket);
  const [activeEnumeratedMarket, setActiveEnumeratedMarket] = useState<EnumeratedMarketToMetadata>(null);

  useEffect(() => {
    const doStuff = () => {
      setActiveMarket(_ => selectedSpotGridMarket);
      
      if(selectedSpotGridMarket) {
        let aem = enumeratedMarkets.find((value) => {
          return value.spotGridMarket.spot_grid_market_address === selectedSpotGridMarket.spot_grid_market_address;
        });
        setActiveEnumeratedMarket(_ => aem);
      }
    }

    doStuff();
  }, [selectedSpotGridMarket]);

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
          <LightweightChart
            selectedSpotGridMarket={activeMarket}
            baseTokenMetadata={baseTokenMetadata}
            quoteTokenMetadata={quoteTokenMetadata}
            seriesManagerHandler={seriesManagerHandler}
            chartManagerHandler={chartManagerHandler}
            leastDisplayDate={leastDisplayDate}
            leastKnownBar={leastKnownBar}
          />
        </div>
      </div>
      <div className={styles.orderManagerContainer}>
        <OrderManager
          enumeratedMarket={activeEnumeratedMarket}
          baseTokenMetadata={baseTokenMetadata}
          quoteTokenMetadata={quoteTokenMetadata}
          phoenixClient={phoenixClient}
        />
      </div>
    </div>
  );
};

export default OrderConsumer;
