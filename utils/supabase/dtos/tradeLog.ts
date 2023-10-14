export interface TradeLog {
    base_balance: number,
    quote_balance: number,
    mid_price: number,
    reservation_price: number,
    bid_spread: number,
    ask_spread: number,
    bids: Order[],
    asks: Order[]
}

export interface Order {
    price: number,
    size: number,
    is_post_only: boolean,
    is_bid: boolean,
}