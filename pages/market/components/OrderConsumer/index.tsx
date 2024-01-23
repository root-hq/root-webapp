import React from "react";
import styles from "./OrderConsumer.module.css";
import { SpotGridMarket, TokenMetadata } from "../../../../utils/supabase";
import axios from "axios";
import { useEffect } from "react";
import MarketSelectorDropdown from "./components/MarketSelectorDropdown";
// import 'bootstrap/dist/css/bootstrap.css';

export interface OrderConsumerProps {
  allSpotGridMarkets: SpotGridMarket[];
  selectedSpotGridMarket: SpotGridMarket;
  allTokenMetadata: TokenMetadata[];
  baseTokenMetadata: TokenMetadata;
  quoteTokenMetadata: TokenMetadata;
}

const OrderConsumer = ({
  allSpotGridMarkets,
  selectedSpotGridMarket,
  allTokenMetadata,
  baseTokenMetadata,
  quoteTokenMetadata,
}: OrderConsumerProps) => {
  return (
    <div className={styles.orderConsumerContainer}>
      <div className={styles.marketInfoContainer}>
        <MarketSelectorDropdown
          allMarkets={allSpotGridMarkets}
          allTokenMetadata={allTokenMetadata}
          selectedMarket={selectedSpotGridMarket}
          selectedBaseTokenMetadata={baseTokenMetadata}
          selectedQuoteTokenMetadata={quoteTokenMetadata}
        />
      </div>
      <div className={styles.tradingViewChartContainer}>
        <p>Trading View chart</p>
      </div>
      <div className={styles.orderManagerContainer}>
        <p>Order Manager</p>
      </div>
    </div>
  );
};

export default OrderConsumer;
