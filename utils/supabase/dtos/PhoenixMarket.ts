export interface PhoenixMarket {
  phoenix_market_address: string;
  base_token_mint: string;
  quote_token_mint: string;
  taker_fee_bps: string;
  tick_size: string;
  is_bot_enabled: boolean;
  bot_market_address: string;
}
