export enum ChartType {
  Lite,
  Pro,
}

export const getChartTypeText = (chartType: ChartType) => {
  if (chartType === ChartType.Lite) {
    return "lite";
  } else if (chartType === ChartType.Pro) {
    return "pro";
  }
};

export const getAllChartTypes = () => {
  return [ChartType.Lite, ChartType.Pro];
};
