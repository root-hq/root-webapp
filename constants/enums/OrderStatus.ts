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
      return "Cancelled";
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