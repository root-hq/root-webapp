import React, { useRef, useState } from "react";
import styles from "./OrderConsumer.module.css";
import { SpotGridMarket, TokenMetadata, TokenPrice } from "../../../../utils/supabase";
import axios from "axios";
import { useEffect } from "react";
import MarketSelectorDropdown from "./components/MarketSelectorDropdown";
import { EnumeratedMarketToMetadata } from "../../[market]";
import LightweightChart from "./components/LightweightChart";
import { ChartOptions, ColorType, DeepPartial } from "lightweight-charts";
import { getTokenPriceDataWithDate } from "../../../../utils/supabase/tokenPrice";
import { PRICE_REFRESH_FREQUENCY_IN_MS } from "../../../../constants";
import { getMarketMidPrice } from "../../../../utils/phoenix";

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

  return (
    <div className={styles.orderConsumerContainer}>
      <div className={styles.marketInfoContainer}>
        <div className={styles.marketSelectorContainer}>
          <MarketSelectorDropdown
            enumeratedMarkets={enumeratedMarkets}
            selectedMarket={selectedSpotGridMarket}
            selectedBaseTokenMetadata={baseTokenMetadata}
            selectedQuoteTokenMetadata={quoteTokenMetadata}
          />
        </div>
      </div>
      <div className={styles.lightweightChartContainer}>
        <LightweightChart selectedSpotGridMarket={selectedSpotGridMarket} baseTokenMetadata={baseTokenMetadata} quoteTokenMetadata={quoteTokenMetadata}/>
      </div>
      <div className={styles.orderManagerContainer}>
        <p>Order Manager</p>
      </div>
    </div>
  );
};

export default OrderConsumer;
