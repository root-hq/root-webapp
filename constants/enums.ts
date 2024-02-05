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

export enum OrderStatus {
  All,
  Placed,
  Filled,
  Canceled,
}

export const getOrderStatusText = (orderStatus: OrderStatus) => {
  if (orderStatus === OrderStatus.All) {
    return "All types";
  }
  if (orderStatus === OrderStatus.Placed) {
    return "Placed";
  } else if (orderStatus === OrderStatus.Filled) {
    return "Filled";
  } else if (orderStatus === OrderStatus.Canceled) {
    return "Canceled";
  }
};

export const getAllOrderStatus = () => {
  return [
    OrderStatus.All,
    OrderStatus.Placed,
    OrderStatus.Filled,
    OrderStatus.Canceled,
  ];
};
