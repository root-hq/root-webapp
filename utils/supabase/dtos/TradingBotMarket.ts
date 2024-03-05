export interface TradingBotMarket {
    bot_market_address: string;
    bot_market_key: string;
    phoenix_market_address: string;
    owner_address: string;
    base_token_mint: string;
    quote_token_mint: string;
    withdrawal_fee_in_hundredth_bps: string;
    min_order_spacing_in_ticks: string;
    min_order_size_in_base_lots: string;
}