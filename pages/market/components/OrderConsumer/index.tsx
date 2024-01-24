import React, { useState } from "react";
import styles from "./OrderConsumer.module.css";
import { SpotGridMarket, TokenMetadata } from "../../../../utils/supabase";
import axios from "axios";
import { useEffect } from "react";
import MarketSelectorDropdown from "./components/MarketSelectorDropdown";
import { EnumeratedMarketToMetadata } from "../../[market]";
import LightweightChart from "./components/LightweightChart";
import { ColorType } from "lightweight-charts";
import { getTokenPriceDataWithDate } from "../../../../utils/supabase/tokenPrice";

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

  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const doStuff = async () => {
      var date = new Date();
      date.setDate(date.getDate() - 2);

      const rawData = await getTokenPriceDataWithDate("4DoNfFBfF7UokCC2FQzriy7yHK6DY6NVdYpuekQ5pRgg", date);
      console.log("Raw data: ", rawData);

      const trueData = rawData.map((dataPoint) => {
        return {
          time: Math.floor(dataPoint.timestamp / 1000),
          value: dataPoint.price
        };
      });

      setChartData(prev => trueData);
    };

    doStuff();
  }, []);

  const chartOptions = {
    lineColor: '#3673f5',
    topColor: 'rgba(54, 115, 245, 0.4)',
    bottomColor: 'rgba(54, 115, 245, 0.0)'
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
        <LightweightChart data ={chartData} chartOptions={chartOptions} gridOptions={gridOptions} layoutOptions={layoutOptions} height={height}/>
      </div>
      <div className={styles.orderManagerContainer}>
        <p>Order Manager</p>
      </div>
    </div>
  );
};

export default OrderConsumer;
