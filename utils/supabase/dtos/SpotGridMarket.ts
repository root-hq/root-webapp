export interface SpotGridMarket {
    spot_grid_market_address: String;
    phoenix_market_address: String;
    spot_grid_market_key: String;
    owner: String;
    base_token_mint: String;
    quote_token_mint: String;
    withdrawal_fee_in_bps_hundredths: String;
    min_order_spacing_in_ticks: String;
    min_order_size_in_base_lots: String;
}