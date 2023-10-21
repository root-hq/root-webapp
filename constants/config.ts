import { ApexOptions } from 'apexcharts';

export const PRICE_CHART_OPTIONS = {
    grid: {
        show: false
    },
    legend: {
        show: false
    },
    yaxis: {
        show: false
    },
      chart: {
        type: 'area',
        toolbar: {
            show: false
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth',
        width: 2,
        // LONG
        colors: ['#35c674'],
        // SHORT
        // colors: ['#ca3329'],
      },
      xaxis: {
        labels: {
            show: false
        },
        axisBorder: {
            show: false
        },
        axisTicks: {
            show: false
        }
      },
      tooltip: {
        enabled: false
      },
      fill: {
        // LONG
        colors: ['#35c674'],
        // SHORT
        // colors: ['#ca3329'],
        gradient: {
          opacityFrom: 1,
          opacityTo: 0
        }         
      },
    } as ApexOptions;