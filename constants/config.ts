import { L3UiBook } from "@ellipsis-labs/phoenix-sdk";
import { ApexOptions } from "apexcharts";
import { MAKER_PUBKEY, OPEN_ORDERS_MINIMUM_PRICE_SPACING } from ".";

export const PRICE_CHART_OPTIONS = {
  annotations: {
    yaxis: [],
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
      formatter: (val) => val.toFixed(3),
    },
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
    colors: ["#477df2"],
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
    colors: ["#0043d4"],
    gradient: {
      opacityFrom: 0.5,
      opacityTo: 0,
    },
  },
} as ApexOptions;

export const ANNOTATIONS_CHART_OPTIONS = {
  annotations: {
    yaxis: [],
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
  },
} as ApexOptions;

export const getChartAnnotations = (l3UiBook: L3UiBook): YAxisAnnotations[] => {
  const filteredBids = l3UiBook.bids.filter((product, index, array) => {
    if (
      index > 0 &&
      product.price - array[index - 1].price < OPEN_ORDERS_MINIMUM_PRICE_SPACING
    ) {
      return false;
    }

    // Otherwise, return true.
    return true;
  });

  const bidAnnotations = filteredBids.map((order) => {
    if (order.makerPubkey === MAKER_PUBKEY) {
      return {
        y: order.price,
        borderColor: "#00E396",
        label: {
          position: "right",
          borderColor: "transparent",
          style: {
            color: "#00E396",
            background: "transparent",
            fontWeight: "bold",
            fontSize: "0.75rem",
          },
          text: `BUY ${order.size} at ${order.price}`,
        },
      } as YAxisAnnotations;
    }
  });

  const filteredAsks = l3UiBook.asks.filter((product, index, array) => {
    if (
      index > 0 &&
      product.price - array[index - 1].price < OPEN_ORDERS_MINIMUM_PRICE_SPACING
    ) {
      return false;
    }

    // Otherwise, return true.
    return true;
  });

  const askAnnotations = filteredAsks.map((order) => {
    if (order.makerPubkey === MAKER_PUBKEY) {
      return {
        y: order.price,
        borderColor: "#FF4560",
        label: {
          position: "right",
          borderColor: "transparent",
          style: {
            color: "#FF4560",
            background: "transparent",
            fontWeight: "bold",
            fontSize: "0.75rem",
          },
          text: `SELL ${order.size} at ${order.price.toFixed(3)}`,
        },
      } as YAxisAnnotations;
    }
  });
  return [...askAnnotations, ...bidAnnotations] as YAxisAnnotations[];
};
