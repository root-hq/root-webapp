
import { createChart, ColorType, SeriesDataItemTypeMap, Time, SeriesType, CandlestickSeriesPartialOptions, DeepPartial, LayoutOptions, AreaSeriesPartialOptions, GridOptions, ChartOptions } from 'lightweight-charts';
import React, { useEffect, useRef } from 'react';
import styles from "./LightweightChart.module.css";

export interface LightweightChartProps {
	data: SeriesDataItemTypeMap<Time>[SeriesType][],
	canvasOptions: DeepPartial<ChartOptions>,
	chartOptions: AreaSeriesPartialOptions,
	width?: number,
	height?: number
}

const LightweightChart = ({
	data,
	canvasOptions,
	chartOptions,
	width,
	height
}: LightweightChartProps) => {

	const chartContainerRef = useRef<HTMLDivElement>();

	useEffect(() => {
		const handleResize = () => {
			chart.applyOptions({
				width: chartContainerRef.current.clientWidth,
			});
		}

		const chart = createChart(chartContainerRef.current, {
			...canvasOptions,
			width: width ? width : chartContainerRef.current.clientWidth,
			height: height ? height : chartContainerRef.current.clientHeight,
		});
		chart.timeScale().fitContent();

		const newSeries = chart.addAreaSeries(chartOptions);
		newSeries.setData(data);

		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);

			chart.remove();
		};

	}, [data, chartOptions, width, height]);
	
	return (
		<div className={styles.lightweightChartContainer} ref={chartContainerRef}>
		</div>
	);
}

export default LightweightChart;