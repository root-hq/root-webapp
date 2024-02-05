import { Client, L3UiBook, Side } from "@ellipsis-labs/phoenix-sdk";
import { web3 } from "@coral-xyz/anchor";
import { Order } from "..";

export const getL3Book = async (
  marketAddress: string,
  depthPerSide: number,
): Promise<L3UiBook> => {
  try {
    const endpoint = process.env.RPC_ENDPOINT;
    const connection = new web3.Connection(endpoint, {
      commitment: "processed",
    });

    const client = await Client.create(connection);
    const book = client.getL3UiBook(marketAddress, depthPerSide);
    return book;
  } catch (err) {
    console.log("Error fetching orderbook data on Pheonix: ", err);
    return {
      bids: [
        {
          price: 0,
          side: Side.Bid,
          size: 0,
          makerPubkey: "",
          orderSequenceNumber: "",
          lastValidSlot: 0,
          lastValidUnixTimestampInSeconds: 0,
        },
      ],
      asks: [
        {
          price: 0,
          side: Side.Ask,
          size: 0,
          makerPubkey: "",
          orderSequenceNumber: "",
          lastValidSlot: 0,
          lastValidUnixTimestampInSeconds: 0,
        },
      ],
    };
  }
};

export const getMarketMidPrice = async (
  marketAddress: string,
): Promise<number> => {
  try {
    const endpoint = process.env.RPC_ENDPOINT;
    const connection = new web3.Connection(endpoint, {
      commitment: "processed",
    });

    const client = await Client.create(connection);
    const l1Book = client.getUiLadder(marketAddress, 1);
    const midPrice = (l1Book.bids[0].price + l1Book.asks[0].price) / 2;
    return midPrice;
  } catch (err) {
    console.log("Error fetching fresh market mid price on Pheonix: ", err);
    return 0;
  }
};

export const getMarketMetadata = async (marketAddress: string) => {
  try {
    const endpoint = process.env.RPC_ENDPOINT;
    const connection = new web3.Connection(endpoint, {
      commitment: "processed",
    });

    const client = await Client.create(connection);
    client.addMarket(marketAddress);
    const metadata = client.marketMetadatas.get(marketAddress);

    return metadata;
  } catch (err) {
    console.log("Error fetching fresh market metadata on Pheonix: ", err);
    return null;
  }
};

export const getOpenOrdersForTrader = async (
  phoenixClient: Client,
  marketAddress: string,
  trader: string,
): Promise<Order[]> => {
  try {
    phoenixClient.refreshMarket(marketAddress, true);

    const book = phoenixClient.marketStates.get(marketAddress);

    let bids = book.data.bids.map((order, i) => {
      let traderIndex = order[1].traderIndex;
      let traderKey = book.data.traderIndexToTraderPubkey.get(
        traderIndex.toNumber(),
      );
      if (traderKey && traderKey === trader) {
        return {
          order_sequence_number: order[0].orderSequenceNumber,
          order_type: "LIMIT",
          phoenix_market_address: marketAddress,
          trader: trader,
          price_in_ticks: order[0].priceInTicks,
          size_in_base_lots: order[1].numBaseLots,
          fill_size_in_base_lots: order[1].numBaseLots,
          place_timestamp: "0",
          status: "status",
          is_buy_order: true,
        } as Order;
      }
    });

    let asks = book.data.asks.map((order, i) => {
      let traderIndex = order[1].traderIndex;
      let traderKey = book.data.traderIndexToTraderPubkey.get(traderIndex);
      if (traderKey && traderKey === trader) {
        return {
          order_sequence_number: order[0].orderSequenceNumber,
          order_type: "LIMIT",
          phoenix_market_address: marketAddress,
          trader: trader,
          price_in_ticks: order[0].priceInTicks,
          size_in_base_lots: order[1].numBaseLots,
          fill_size_in_base_lots: order[1].numBaseLots,
          place_timestamp: "0",
          status: "status",
          is_buy_order: false,
        } as Order;
      }
    });

    let allOrders = [...bids, ...asks];

    allOrders = allOrders.filter(
      (element) => element !== null && element !== undefined,
    );
    return allOrders;
  } catch (err) {
    console.log(
      `Error fetching open orders for trader: ${trader}, on market: ${marketAddress}: err: ${err}`,
    );
    return [];
  }
};
