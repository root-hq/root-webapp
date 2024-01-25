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
  CreatePriceLineOptions,
  LineStyle,
  IPriceLine,
} from "lightweight-charts";
import React, { useEffect, useRef, useState } from "react";
import styles from "./LightweightChart.module.css";
import {
  SpotGridMarket,
  TokenMetadata,
  TokenPrice,
} from "../../../../../../utils/supabase";
import { getTokenPriceDataWithDate } from "../../../../../../utils/supabase/tokenPrice";
import { getL3Book, getMarketMidPrice } from "../../../../../../utils/phoenix";
import { DEFAULT_ORDERBOOK_VIEW_DEPTH, NUM_ORDERS_VISIBLE_PER_SIDE, OPEN_ORDERS_REFRESH_FREQUENCY_IN_MS, PRICE_REFRESH_FREQUENCY_IN_MS } from "../../../../../../constants";

export interface LightweightChartProps {
  selectedSpotGridMarket: SpotGridMarket;
  baseTokenMetadata: TokenMetadata;
  quoteTokenMetadata: TokenMetadata;
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
}: LightweightChartProps) => {
  const [chartData, setChartData] = useState([]);

  const initialLoad = useRef<boolean>(false);
  const chartContainerRef = useRef<HTMLDivElement>();
  const seriesManager = useRef<SeriesManagerInstance>(null);
  const ordersDisplay = useRef<IPriceLine[]>([]);

  useEffect(() => {
    const refreshPriceData = async () => {
      if (!selectedSpotGridMarket) {
        return;
      }
      let newMidPrice = parseFloat(
        (
          await getMarketMidPrice(
            selectedSpotGridMarket.phoenix_market_address.toString(),
          )
        ).toFixed(3),
      );

      if (newMidPrice) {
        seriesManager.current.update({
          time: Math.floor(Date.now() / 1000) as Time,
          value: newMidPrice,
        });
      }
    };

    refreshPriceData();

    const intervalId = setInterval(() => {
      refreshPriceData();
    }, PRICE_REFRESH_FREQUENCY_IN_MS);

    return () => clearInterval(intervalId);
  }, [chartData]);

  useEffect(() => {
    const refreshOrders = async () => {

      if(!selectedSpotGridMarket) {
        return;
      }

      if(ordersDisplay.current.length > 0) {
        ordersDisplay.current.forEach((line) => {
          seriesManager.current.removePriceLine(line);
        });
      }

      const book = await getL3Book(selectedSpotGridMarket.phoenix_market_address.toString(), DEFAULT_ORDERBOOK_VIEW_DEPTH);

      let bidCounter = 0;
      book.bids.forEach((value, index) => {
        if(value.makerPubkey === "LUKAzPV8dDbVykTVT14pCGKzFfNcgZgRbAXB8AGdKx3") {
          if(bidCounter < NUM_ORDERS_VISIBLE_PER_SIDE) {
            let line = seriesManager.current.createPriceLine({
              price: value.price,
              id: value.orderSequenceNumber.toString(),
              color: 'green',
              lineWidth: 2,
              lineStyle: LineStyle.Dashed,
              axisLabelVisible: true,
              title: `${value.size}`
            } as CreatePriceLineOptions);
            ordersDisplay.current.push(line);
            bidCounter++;
          }
        }
      });

      let askCounter = 0;
      book.asks.forEach((value, index) => {
        if(value.makerPubkey === "LUKAzPV8dDbVykTVT14pCGKzFfNcgZgRbAXB8AGdKx3") {
          if(askCounter < NUM_ORDERS_VISIBLE_PER_SIDE) {
            let line = seriesManager.current.createPriceLine({
              price: value.price,
              id: value.orderSequenceNumber.toString(),
              color: 'red',
              lineWidth: 2,
              lineStyle: LineStyle.Dashed,
              axisLabelVisible: true,
              title: `${value.size}`
            } as CreatePriceLineOptions);
            ordersDisplay.current.push(line);
            askCounter++;
          }
        }
      });
    };

    refreshOrders();

    // const intervalId = setInterval(() => {
    //   refreshOrders();
    // }, OPEN_ORDERS_REFRESH_FREQUENCY_IN_MS);

    // return () => clearInterval(intervalId);
  }, [chartData]);

  useEffect(() => {
    console.log("selected market fresh: ", selectedSpotGridMarket);
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
      height: 500,
    });
    chart.timeScale().fitContent();

    seriesManager.current = chart.addAreaSeries({
      lineColor: "#3673f5",
      topColor: "rgba(54, 115, 245, 0.4)",
      bottomColor: "rgba(54, 115, 245, 0.0)",
    });
    seriesManager.current.setData(chartData);

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
