
import { createChart, ColorType } from 'lightweight-charts';
import React, { useEffect, useRef } from 'react';
import styles from "./LightweightChart.module.css";

export const ChartComponent = props => {
	const {
		data
	} = props;

	const chartContainerRef = useRef();

	useEffect(
		() => {
			const handleResize = () => {
                //@ts-ignore
				chart.applyOptions({ width: chartContainerRef.current.clientWidth });
			};

			const chart = createChart(chartContainerRef.current, {
				layout: {
					background: { type: ColorType.Solid, color: 'white' },
					textColor: 'black',
				},
                //@ts-ignore
				width: chartContainerRef.current.clientWidth,
				height: 500,
			});
			chart.timeScale().fitContent();

			const newSeries = chart.addAreaSeries({ lineColor: '#2962FF', topColor: '#2962FF', bottomColor: 'rgba(41, 98, 255, 0.28)' });
			newSeries.setData(data);

			window.addEventListener('resize', handleResize);

			return () => {
				window.removeEventListener('resize', handleResize);

				chart.remove();
			};
		},
		[data]
	);

	return (
		<div ref={chartContainerRef} className={styles.lightweightChartContainer}>
			<></>
		</div>
	);
};

export default ChartComponent;