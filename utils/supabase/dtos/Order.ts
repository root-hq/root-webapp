export interface Order {
  order_sequence_number: string;
  order_type: string;
  phoenix_market_address: string;
  trader: string;
  price_in_ticks: string;
  size_in_base_lots: string;
  fill_size_in_base_lots: string;
  place_timestamp: string;
  status: string;
  is_buy_order: boolean;
}
