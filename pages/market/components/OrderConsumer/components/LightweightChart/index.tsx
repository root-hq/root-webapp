import {
  createChart,
  ColorType,
  Time,
  DeepPartial,
  ISeriesApi,
  AreaData,
  WhitespaceData,
  AreaSeriesOptions,
  AreaStyleOptions,
  SeriesOptionsCommon,
  IChartApi,
} from "lightweight-charts";
import React, { useEffect, useRef, useState } from "react";
import styles from "./LightweightChart.module.css";
import {
  SpotGridMarket,
  TokenMetadata,
  TokenPrice,
} from "../../../../../../utils/supabase";
import { getTokenPriceDataWithDate } from "../../../../../../utils/supabase/tokenPrice";
import { getMarketMidPrice } from "../../../../../../utils/phoenix";
import { PRICE_REFRESH_FREQUENCY_IN_MS } from "../../../../../../constants";

export interface LightweightChartProps {
  selectedSpotGridMarket: SpotGridMarket;
  baseTokenMetadata: TokenMetadata;
  quoteTokenMetadata: TokenMetadata;
  seriesManagerHandler: React.MutableRefObject<SeriesManagerInstance>;
  chartManagerHandler: React.MutableRefObject<IChartApi>;
}

export type SeriesManagerInstance = ISeriesApi<
  "Area",
  Time,
  AreaData<Time> | WhitespaceData<Time>,
  AreaSeriesOptions,
  DeepPartial<AreaStyleOptions & SeriesOptionsCommon>
>;

const LightweightChart = ({
  selectedSpotGridMarket,
  baseTokenMetadata,
  quoteTokenMetadata,
  seriesManagerHandler,
  chartManagerHandler,
}: LightweightChartProps) => {
  const [chartData, setChartData] = useState([]);

  const initialLoad = useRef<boolean>(false);
  const lastFetchTimestamp = useRef<number>(null);
  const chartContainerRef = useRef<HTMLDivElement>();

  useEffect(() => {
    const refreshPriceData = async () => {
      if(lastFetchTimestamp.current + PRICE_REFRESH_FREQUENCY_IN_MS < Date.now()) {
        console.log("Triggering refresh");
        var date = new Date();
        date.setDate(date.getDate());

        let rawData: TokenPrice[] = [];

        if (selectedSpotGridMarket) {
          rawData = await getTokenPriceDataWithDate(
            selectedSpotGridMarket.phoenix_market_address.toString(),
            date,
          );
        }

        const trueData = rawData.map((dataPoint) => {
          return {
            time: Math.floor(dataPoint.timestamp / 1000),
            value: dataPoint.price,
          };
        });

        setChartData((prev) => trueData);
        lastFetchTimestamp.current = Date.now();
      }
    };

    refreshPriceData();

    const intervalId = setInterval(() => {
      refreshPriceData();
    }, PRICE_REFRESH_FREQUENCY_IN_MS);

    return () => clearInterval(intervalId);
  }, [chartData]);

  useEffect(() => {
    // console.log("selected market fresh: ", selectedSpotGridMarket);
    const loadInitialData = async () => {
      var date = new Date();
      date.setDate(date.getDate());

      let rawData: TokenPrice[] = [];

      if (selectedSpotGridMarket) {
        rawData = await getTokenPriceDataWithDate(
          selectedSpotGridMarket.phoenix_market_address.toString(),
          date,
        );
      }

      const trueData = rawData.map((dataPoint) => {
        return {
          time: Math.floor(dataPoint.timestamp / 1000),
          value: dataPoint.price,
        };
      });

      setChartData((prev) => trueData);
      lastFetchTimestamp.current = Date.now();
    };

    loadInitialData();
  }, [selectedSpotGridMarket, baseTokenMetadata, quoteTokenMetadata]);

  useEffect(() => {
    const handleResize = () => {
      chart.applyOptions({
        width: chartContainerRef.current.clientWidth,
      });
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "white",
      },
      grid: {
        horzLines: {
          visible: false,
        },
        vertLines: {
          visible: false,
        },
      },
      timeScale: {
        visible: false,
      },
      width: chartContainerRef.current.clientWidth,
      // width: 800,
      height: 350,
    });
    chart.timeScale().fitContent();
    
    chart.applyOptions({
      watermark: {
        visible: true,
        fontSize: 48,
        horzAlign: 'center',
        vertAlign: 'center',
        color: 'rgba(87, 87, 87, 0.08)',
        text: 'root.exchange',
        fontStyle: 'bold'
      },
    });
    

    seriesManagerHandler.current = chart.addAreaSeries({
      lineColor: "#3673f5",
      topColor: "rgba(54, 115, 245, 0.4)",
      bottomColor: "rgba(54, 115, 245, 0.0)",
    });
    seriesManagerHandler.current.setData(chartData);

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);

      chart.remove();
    };
  }, [chartData]);

  return (
    <div
      className={styles.lightweightChartContainer}
      ref={chartContainerRef}
    ></div>
  );
};

export default LightweightChart;
