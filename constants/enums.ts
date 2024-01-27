export enum OrderType {
    Market,
    Limit
}

export const getOrderTypeText = (orderType: OrderType) => {
    if(orderType === OrderType.Market) {
        return "Market";
    }
    else if(orderType === OrderType.Limit) {
        return "Limit";
    }
}

export const getAllOrderTypes = () => {
    return [
        OrderType.Market,
        OrderType.Limit
    ];
}