import React, { useEffect, useState } from "react";
import styles from "./OrderConsumer.module.css";
import { SpotGridMarket, TokenMetadata } from "../../../../utils/supabase";
import MarketSelectorDropdown from "./components/MarketSelectorDropdown";
import { EnumeratedMarketToMetadata } from "../../[market]";
import LightweightChart from "./components/LightweightChart";

export interface OrderConsumerProps {
  enumeratedMarkets: EnumeratedMarketToMetadata[];
  selectedSpotGridMarket: SpotGridMarket;
  baseTokenMetadata: TokenMetadata;
  quoteTokenMetadata: TokenMetadata;
}

const OrderConsumer = ({
  enumeratedMarkets,
  selectedSpotGridMarket,
  baseTokenMetadata,
  quoteTokenMetadata,
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
        />
      </div>
      <div className={styles.orderManagerContainer}>
        <p>Order Manager</p>
      </div>
    </div>
  );
};

export default OrderConsumer;
