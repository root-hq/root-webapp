export interface SpotGridPosition {
    owner: String;
    position_address: String;
    position_key: String;
    spot_grid_market_address: String;
    trade_manager_address: String;
    seat: String;
    mode: String;
    num_grids: number;
    min_price_in_ticks: String;
    max_price_in_ticks: String;
    order_size_in_base_lots: String;
}