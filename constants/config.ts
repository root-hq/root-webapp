import { ApexOptions } from "apexcharts";

export const PRICE_CHART_OPTIONS = {
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
    type: "area",
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
