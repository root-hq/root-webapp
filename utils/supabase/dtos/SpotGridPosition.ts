export interface SpotGridPosition {
  owner: string;
  position_address: string;
  position_key: string;
  spot_grid_market_address: string;
  trade_manager_address: string;
  seat: string;
  mode: string;
  num_grids: number;
  min_price_in_ticks: string;
  max_price_in_ticks: string;
  order_size_in_base_lots: string;
}
