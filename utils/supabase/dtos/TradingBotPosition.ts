export interface TradingBotPosition {
    owner: string;
    position_address: string;
    position_key: string;
    bot_market_address: string;
    trade_manager_address: string;
    seat: string;
    mode: string;
    num_orders: number;
    min_price_in_ticks: string;
    max_price_in_ticks: string;
    order_size_in_base_lots: string;
    quote_size_deposited: string;
    is_closed: boolean;
    timestamp: string;
  }
  