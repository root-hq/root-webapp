import styles from "./TradingViewChart.module.css";
import { useEffect, useRef } from "react";
import {
  ChartingLibraryFeatureset,
  ChartingLibraryWidgetOptions,
  LanguageCode,
  ResolutionString,
} from "public/static/charting_library";
import { widget } from "public/static/charting_library/charting_library.esm";
import Datafeed from "../../../../../../utils/birdeye/Datafeed";
import React from "react";
import { ChartType } from "constants/";

export interface TVChartContainerProps {
  props: Partial<ChartingLibraryWidgetOptions>,
  chartType: ChartType
}

const TVChartContainer = ({
  props,
  chartType
}: TVChartContainerProps) => {
  const chartContainerRef =
    useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>;

  var customCSS = `:root:not(.theme-dark) {
		  --tv-color-platform-background: #0B0C11;
		  --tv-color-pane-background: #0B0C11;
		  --tv-color-toolbar-button-background-hover: #12161E;
		  --tv-color-toolbar-button-background-expanded: #12161E;
		  --tv-color-toolbar-button-background-active: #12161E;
		  --tv-color-toolbar-button-background-active-hover: #12161E;
		  --tv-color-toolbar-button-text: #ccc;
		  --tv-color-toolbar-button-text-hover: #fff;
		  --tv-color-toolbar-button-text-active: #e33d3d;
		  --tv-color-toolbar-button-text-active-hover: #fff;
		  --tv-color-item-active-text: #ddd;
		  --tv-color-toolbar-toggle-button-background-active: #0B0C11;
		  --tv-color-toolbar-toggle-button-background-active-hover: #ddd;
		  --tv-color-toolbar-divider-background: #ddd;
	  }
	  `;

  const cssBlob = new Blob([customCSS], {
    type: "text/css",
  });
  const cssBlobUrl = URL.createObjectURL(cssBlob);

  let DEFAULT_DISABLED_FEATURES: ChartingLibraryFeatureset[] = [
    "use_localstorage_for_settings",
    "header_symbol_search",
    "header_compare",
    "header_undo_redo",
    "header_quick_search",
    "study_templates",
    "legend_widget"
  ];

  if(chartType === ChartType.Lite) {
    DEFAULT_DISABLED_FEATURES = [
      "use_localstorage_for_settings",
      "header_symbol_search",
      "header_compare",
      "header_undo_redo",
      "header_quick_search",
      "study_templates",
      "legend_widget",
      
      "header_indicators",
      "left_toolbar",
      "main_series_scale_menu",
      "header_settings",
      "header_chart_type",
      "header_resolutions",
      "context_menus"
    ];
  }

  useEffect(() => {
    const widgetOptions: ChartingLibraryWidgetOptions = {
      symbol: props.symbol,
      // BEWARE: no trailing slash is expected in feed URL
      datafeed: Datafeed,
      interval: props.interval as ResolutionString,
      container: chartContainerRef.current,
      library_path: props.library_path,
      locale: props.locale as LanguageCode,
      disabled_features: [...DEFAULT_DISABLED_FEATURES],
      enabled_features: ["create_volume_indicator_by_default"],
      custom_css_url: cssBlobUrl,
      loading_screen: {
        backgroundColor: "#0B0C11",
        foregroundColor: "#eee",
      },
      overrides: {
        "paneProperties.background": "#0F1118",
        "paneProperties.vertGridProperties.color": "rgba(221, 221, 221, 0.05)",
        "paneProperties.horzGridProperties.color": "rgba(221, 221, 221, 0.05)",
        "scalesProperties.lineColor": "rgba(221, 221, 221, 0.5)",
        "scalesProperties.textColor": "#ddd",
        // "scalesProperties.showSymbolLabels": "false"
      },
      charts_storage_url: props.charts_storage_url,
      charts_storage_api_version: props.charts_storage_api_version,
      client_id: props.client_id,
      user_id: props.user_id,
      fullscreen: props.fullscreen,
      autosize: props.autosize,
    };

    const tvWidget = new widget(widgetOptions);

    tvWidget.onChartReady(() => {
      // tvWidget.headerReady().then(() => {
      // 	const button = tvWidget.createButton();
      // 	button.setAttribute("title", "Click to show a notification popup");
      // 	button.classList.add("apply-common-tooltip");
      // 	button.addEventListener("click", () =>
      // 		tvWidget.showNoticeDialog({
      // 			title: "Notification",
      // 			body: "TradingView Charting Library API works correctly",
      // 			callback: () => {
      // 				console.log("Noticed!");
      // 			},
      // 		})
      // 	);
      // 	button.innerHTML = "Check API";
      // });
      if(chartType === ChartType.Lite) {
        tvWidget.activeChart().setChartType(3);
      }
      else if(chartType === ChartType.Pro) {
        tvWidget.activeChart().setChartType(1);
      }
    });

    return () => {
      tvWidget.remove();
    };
  }, [props]);

  return (
    <>
      <div ref={chartContainerRef} className={styles.TVChartContainer} />
    </>
  );
};

export default TVChartContainer;
