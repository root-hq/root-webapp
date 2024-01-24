
import { createChart, ColorType, SeriesDataItemTypeMap, Time, SeriesType, CandlestickSeriesPartialOptions, DeepPartial, LayoutOptions, AreaSeriesPartialOptions, GridOptions } from 'lightweight-charts';
import React, { useEffect, useRef } from 'react';
import styles from "./LightweightChart.module.css";

export interface LightweightChartProps {
	data: SeriesDataItemTypeMap<Time>[SeriesType][],
	chartOptions: AreaSeriesPartialOptions,
	layoutOptions: DeepPartial<LayoutOptions>,
	gridOptions: DeepPartial<GridOptions>
	width?: number,
	height?: number
}

const LightweightChart = ({
	data,
	chartOptions,
	layoutOptions,
	gridOptions,
	width,
	height
}: LightweightChartProps) => {

	const chartContainerRef = useRef<HTMLDivElement>();

	useEffect(() => {
		const handleResize = () => {
			chart.applyOptions({ width: chartContainerRef.current.clientWidth });
		}

		const chart = createChart(chartContainerRef.current, {
			layout: layoutOptions,
			grid: gridOptions,
			width: width ? width : chartContainerRef.current.clientWidth,
			height: height ? height : 500,
		});
		chart.timeScale().fitContent();

		const newSeries = chart.addAreaSeries(chartOptions);
		newSeries.setData(data);

		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);

			chart.remove();
		};

	}, [data, chartOptions, layoutOptions, gridOptions, width, height]);
	
	return (
		<div className={styles.lightweightChartContainer} ref={chartContainerRef}>
		</div>
	);
}

export default LightweightChart;