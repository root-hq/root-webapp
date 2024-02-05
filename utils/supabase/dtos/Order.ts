export interface Order {
  order_sequence_number: String;
  order_type: String;
  phoenix_market_address: String;
  trader: String;
  price_in_ticks: String;
  size_in_base_lots: String;
  fill_size_in_base_lots: String;
  place_timestamp: String;
  status: String;
  is_buy_order: boolean;
}
