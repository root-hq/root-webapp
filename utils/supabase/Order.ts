import axios from "axios";
import { Order, SpotGridMarket } from ".";

export const addOrder = async (
  order: Order
): Promise<boolean> => {
  try {
    const body = {
        "order_sequence_number": order.order_sequence_number,
        "order_type": order.order_type,
        "phoenix_market_address": order.phoenix_market_address,
        "trader": order.trader,
        "price_in_ticks": order.price_in_ticks,
        "size_in_base_lots": order.size_in_base_lots,
        "fill_size_in_base_lots": 0,
        "place_timestamp": order.place_timestamp,
        "status": "PLACED"
    };

    const response = await axios.get(
      `${process.env.SPOT_GRID_DATABASE_SERVER_URL}/api/order/add-order`,
    );

    if (response && response.data && response.data.length) {
      return true;
    } else {
      console.log(
        `Failed to add order: "${order.order_sequence_number}`,
      );
      return false;
    }
  } catch (err) {
    console.log(
        `Failed to add order: "${order.order_sequence_number}`,
    );
    return false;
  }
};

export const getAllOrdersForTrader = async (
  trader: String,
): Promise<Order[]> => {
  try {
    const response = await axios.get(
      `${process.env.SPOT_GRID_DATABASE_SERVER_URL}/api/order/get-all-orders?trader=${trader}`,
    );

    if (response && response.data && response.data.length) {
      return response.data[0] as Order[];
    } else {
      console.log(
        `Failed to retrieve all orders for trader: "${trader}`,
      );
      return null;
    }
  } catch (err) {
    console.log(
      `Error fetching all orders for trader: ${trader} \n Error: ${err}`,
    );
  }
};

export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const response = await axios.get(
      `${process.env.SPOT_GRID_DATABASE_SERVER_URL}/api/order/get-all-orders`,
    );

    if (response && response.data && response.data.length) {
      return response.data as Order[];
    } else {
      console.log(`Failed to retrieve data on all order`);
      return null;
    }
  } catch (err) {
    console.log(`Error fetching info on all orders`);
  }
};