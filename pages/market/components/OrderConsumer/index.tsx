import React, { useEffect, useRef, useState } from "react";
import styles from "./OrderConsumer.module.css";
import { SpotGridMarket, TokenMetadata } from "../../../../utils/supabase";
import MarketSelectorDropdown from "./components/MarketSelectorDropdown";
import { EnumeratedMarketToMetadata } from "../../[market]";
import LightweightChart, { SeriesManagerInstance } from "./components/LightweightChart";
import { IChartApi } from "lightweight-charts";
import OrderManager from "./components/OrderManager";

export interface OrderConsumerProps {
  enumeratedMarkets: EnumeratedMarketToMetadata[];
  selectedSpotGridMarket: SpotGridMarket;
  baseTokenMetadata: TokenMetadata;
  quoteTokenMetadata: TokenMetadata;
  seriesManagerHandler: React.MutableRefObject<SeriesManagerInstance>;
  chartManagerHandler: React.MutableRefObject<IChartApi>;
}

const OrderConsumer = ({
  enumeratedMarkets,
  selectedSpotGridMarket,
  baseTokenMetadata,
  quoteTokenMetadata,
  seriesManagerHandler,
  chartManagerHandler
}: OrderConsumerProps) => {
  const [activeMarket, setActiveMarket] = useState(selectedSpotGridMarket);

  useEffect(() => {
    const doStuff = () => {
      setActiveMarket(_ => selectedSpotGridMarket);
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
          />
        </div>
      </div>
      <div className={styles.orderManagerContainer}>
        <OrderManager />
      </div>
    </div>
  );
};

export default OrderConsumer;
