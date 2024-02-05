export interface SpotGridMarket {
  spot_grid_market_address: string;
  phoenix_market_address: string;
  spot_grid_market_key: string;
  owner: string;
  base_token_mint: string;
  quote_token_mint: string;
  withdrawal_fee_in_bps_hundredths: string;
  min_order_spacing_in_ticks: string;
  min_order_size_in_base_lots: string;
  taker_fee_bps: string;
}
