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

  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const refreshPriceData = async () => {

      if(!selectedSpotGridMarket) {
        return;
      }

      if(chartData && chartData.length > 0) {
        let newMidPrice = parseFloat(
          (await getMarketMidPrice(selectedSpotGridMarket.phoenix_market_address.toString())).toFixed(3),
        );

        if(newMidPrice) {
          setChartData(prev => [...prev, {
            time: Math.floor(Date.now() / 1000),
            value: newMidPrice
          }]);
        }
      }
      else {
        var date = new Date();
        date.setDate(date.getDate());

        let rawData: TokenPrice[] = [];
  
        if(selectedSpotGridMarket) {
          rawData = await getTokenPriceDataWithDate(selectedSpotGridMarket.phoenix_market_address.toString(), date);
        }
  
        const trueData = rawData.map((dataPoint) => {
          return {
            time: Math.floor(dataPoint.timestamp / 1000),
            value: dataPoint.price
          };
        });
  
        setChartData(prev => trueData);  
      }
    };

    refreshPriceData();

    const intervalId = setInterval(() => {
      refreshPriceData();
    }, PRICE_REFRESH_FREQUENCY_IN_MS);

    return () => clearInterval(intervalId);
  }, [selectedSpotGridMarket, baseTokenMetadata, quoteTokenMetadata]);

  const canvasOptions: DeepPartial<ChartOptions> = {
    layout: {
      background: { type: ColorType.Solid, color: 'transparent' },
      textColor: 'white',
    },
    grid: {
      horzLines: {
        visible: false,
      },
      vertLines: {
        visible: false
      }
    },
    timeScale: {
      visible: false
    },
  }

  const height = 500;

  const chartOptions = {
    lineColor: '#3673f5',
    topColor: 'rgba(54, 115, 245, 0.4)',
    bottomColor: 'rgba(54, 115, 245, 0.0)'
  };

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
        <LightweightChart data ={chartData} canvasOptions={canvasOptions} chartOptions={chartOptions} height={height}/>
      </div>
      <div className={styles.orderManagerContainer}>
        <p>Order Manager</p>
      </div>
    </div>
  );
};

export default OrderConsumer;
