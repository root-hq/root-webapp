import { L3UiBook } from "@ellipsis-labs/phoenix-sdk";
import { ApexOptions } from "apexcharts";
import { MAKER_PUBKEY } from ".";

export const PRICE_CHART_OPTIONS = {
  annotations: {
    yaxis: []
  },
  grid: {
    show: false,
  },
  legend: {
    show: false,
  },
  yaxis: {
    show: true,
    labels: {
      formatter: (val) => val.toFixed(3)
    }
  },
  chart: {
    // type: "area",
    toolbar: {
      show: false,
    },
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: "smooth",
    width: 2,
    // LONG
    // colors: ["#35c674"],
    // SHORT
    // colors: ['#ca3329'],
    colors: ['#477df2']
  },
  xaxis: {
    labels: {
      show: false,
    },
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  tooltip: {
    enabled: false,
  },
  fill: {
    // LONG
    // colors: ["#35c674"],
    // SHORT
    // colors: ['#ca3329'],
    colors: ['#0043d4'],
    gradient: {
      opacityFrom: 0.5,
      opacityTo: 0,
    },
  },
} as ApexOptions;

export const ANNOTATIONS_CHART_OPTIONS = {
  annotations: {
    yaxis: []
  },
  grid: {
    show: false,
  },
  legend: {
    show: false,
  },
  yaxis: {
    show: false,
  },
  chart: {
    toolbar: {
      show: false,
    },
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: "smooth",
    width: 0,
  },
  xaxis: {
    labels: {
      show: false,
    },
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  tooltip: {
    enabled: false,
  }
} as ApexOptions;

export const getChartAnnotations = (
  l3UiBook: L3UiBook
): YAxisAnnotations[] => {
  const bidAnnotations = l3UiBook.bids.map((order) => {
    if(order.makerPubkey === MAKER_PUBKEY) {
      return {
        y: order.price,
        borderColor: '#00E396',
        label: {
          position: 'right',
          borderColor: '#00E396',
          style: {
            color: '#0f0f0f',
            background: '#00E396',
            fontWeight: 'bold'
          },
          text: `BUY ${order.size} at ${order.price}`
        }
      } as YAxisAnnotations
    }
  });

  const askAnnotations = l3UiBook.asks.map((order) => {
    if(order.makerPubkey === MAKER_PUBKEY) {
      return {
        y: order.price,
        borderColor: '#FF4560',
        label: {
          position: 'right',
          borderColor: '#FF4560',
          style: {
            color: '#0f0f0f',
            background: '#FF4560',
            fontWeight: 'bold'
          },
          text: `SELL ${order.size} at ${order.price.toFixed(3)}`
        }
      } as YAxisAnnotations
    }
  });
  return [
    ...askAnnotations,
    ...bidAnnotations
  ] as YAxisAnnotations[];
}