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
import { PRICE_REFRESH_FREQUENCY_IN_MS } from "../../../../../../constants";
import { getMarketMidPrice } from "../../../../../../utils/phoenix";

export interface LightweightChartProps {
  selectedSpotGridMarket: SpotGridMarket;
  baseTokenMetadata: TokenMetadata;
  quoteTokenMetadata: TokenMetadata;
  seriesManagerHandler: React.MutableRefObject<SeriesManagerInstance>;
  chartManagerHandler: React.MutableRefObject<IChartApi>;
  leastDisplayDate: React.MutableRefObject<Date>;
  leastKnownBar: React.MutableRefObject<number>;
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
  leastDisplayDate,
  leastKnownBar,
}: LightweightChartProps) => {
  const [chartData, setChartData] = useState([]);

  const lastFetchTimestamp = useRef<number>(null);
  const chartContainerRef = useRef<HTMLDivElement>();

  useEffect(() => {
    const refreshPriceData = async () => {
      if (
        lastFetchTimestamp.current + PRICE_REFRESH_FREQUENCY_IN_MS <
        Date.now()
      ) {
        if (!selectedSpotGridMarket) {
          return;
        }
        let newMidPrice = parseFloat(
          (
            await getMarketMidPrice(
              selectedSpotGridMarket.phoenix_market_address,
            )
          ).toString(),
        );

        if (newMidPrice) {
          seriesManagerHandler.current.update({
            time: Math.floor(Date.now() / 1000) as Time,
            value: newMidPrice,
          });
        }
      }
    };

    refreshPriceData();

    // const intervalId = setInterval(() => {
    //   refreshPriceData();
    // }, PRICE_REFRESH_FREQUENCY_IN_MS);

    // return () => clearInterval(intervalId);
  }, [chartData]);

  useEffect(() => {
    // console.log("selected market fresh: ", selectedSpotGridMarket);
    const loadInitialData = async () => {
      var date = new Date();
      date.setDate(date.getDate());

      let rawData: TokenPrice[] = [];

      if (selectedSpotGridMarket) {
        rawData = await getTokenPriceDataWithDate(
          selectedSpotGridMarket.phoenix_market_address,
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
        visible: true,
        timeVisible: true,
        secondsVisible: true,
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
        horzAlign: "center",
        vertAlign: "center",
        color: "rgba(87, 87, 87, 0.08)",
        text: "root.exchange",
        fontStyle: "bold",
      },
    });

    const handleScrollChange = async () => {
      const visibleLogicalRange = chart.timeScale().getVisibleLogicalRange();
      if (visibleLogicalRange.from < 0) {
        const barsInfo = seriesManagerHandler.current.barsInLogicalRange(
          chart.timeScale().getVisibleLogicalRange(),
        );
        let leastDisplayedBar = parseInt(barsInfo.from.toString());

        if (!leastDisplayDate.current) {
          let today = new Date();
          today.setDate(today.getDate());

          leastDisplayDate.current = today;
        }

        if (
          !leastKnownBar.current ||
          leastDisplayedBar < leastKnownBar.current
        ) {
          leastKnownBar.current = leastDisplayedBar;
          var oneLess = new Date();
          oneLess.setDate(leastDisplayDate.current.getDate() - 1);

          let rawData: TokenPrice[] = [];

          if (selectedSpotGridMarket) {
            try {
              rawData = await getTokenPriceDataWithDate(
                selectedSpotGridMarket.phoenix_market_address,
                oneLess,
              );
            } catch (err) {
              rawData = [];
            }
          }

          const trueData = rawData.map((dataPoint) => {
            return {
              time: Math.floor(dataPoint.timestamp / 1000),
              value: dataPoint.price,
            };
          });

          setChartData((prev) => [...trueData, ...prev]);
          leastDisplayDate.current = oneLess;
          lastFetchTimestamp.current = Date.now();
        }
      }
    };

    chart.timeScale().subscribeVisibleLogicalRangeChange(handleScrollChange);

    seriesManagerHandler.current = chart.addAreaSeries({
      lineColor: "#3673f5",
      topColor: "rgba(54, 115, 245, 0.4)",
      bottomColor: "rgba(54, 115, 245, 0.0)",
    });
    seriesManagerHandler.current.setData(chartData);

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.timeScale().unsubscribeSizeChange(() => {
        // console.log("timescale change unsubscribed");
      });

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
