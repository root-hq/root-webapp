export enum OrderType {
  Market,
  Limit,
}

export const getOrderTypeText = (orderType: OrderType) => {
  if (orderType === OrderType.Market) {
    return "Market order";
  } else if (orderType === OrderType.Limit) {
    return "Limit order";
  }
};

export const getAllOrderTypes = () => {
  return [OrderType.Market, OrderType.Limit];
};
