export enum ChartType {
    Simple,
    Advanced   
}

export const getChartTypeText = (chartType: ChartType) => {
    if (chartType === ChartType.Simple) {
      return "simple";
    }
    else if(chartType === ChartType.Advanced) {
        return "advanced";
    }
  };
  
  export const getAllChartTypes = () => {
    return [
      ChartType.Simple,
      ChartType.Advanced
    ];
  };