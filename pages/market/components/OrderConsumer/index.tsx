import React from "react";
import styles from "./OrderConsumer.module.css";
import { SpotGridMarket, TokenMetadata } from "../../../../utils/supabase";
import axios from "axios";
import { useEffect } from "react";
import MarketSelectorDropdown from "./components/MarketSelectorDropdown";
import { EnumeratedMarketToMetadata } from "../../[market]";
import LightweightChart from "./components/LightweightChart";
import { ColorType } from "lightweight-charts";

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

  const initialData = [
    { time: '2018-12-22', value: 32.513 },
    { time: '2018-12-23', value: 31.131 },
    { time: '2018-12-24', value: 27.023 },
    { time: '2018-12-25', value: 27.3442 },
    { time: '2018-12-26', value: 25.1349 },
    { time: '2018-12-28', value: 25.446 },
    { time: '2018-12-29', value: 23.932 },
    { time: '2018-12-30', value: 22.628 },
    { time: '2018-12-31', value: 22.617 },
  ];

  const chartOptions = {
    
  };

  const gridOptions = {
    horzLines: {
      visible: false,
    },
    vertLines: {
      visible: false
    }
  }

  const layoutOptions = {
    background: { type: ColorType.Solid, color: 'transparent' },
    textColor: 'white',
  };

  const width = 500;
  const height = 300;

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
        <LightweightChart data ={initialData} chartOptions={chartOptions} gridOptions={gridOptions} layoutOptions={layoutOptions} height={height}/>
      </div>
      <div className={styles.orderManagerContainer}>
        <p>Order Manager</p>
      </div>
    </div>
  );
};

export default OrderConsumer;
