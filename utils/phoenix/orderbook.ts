import { Client, L3UiBook, Side } from "@ellipsis-labs/phoenix-sdk";
import { web3 } from "@coral-xyz/anchor";
import { Order } from "..";
import { UserGlobalBalances } from "pages/market/components/OrderConsumer/components/OrderManager";

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
    // console.log(
    //   `Error fetching open orders for trader: ${trader}, on market: ${marketAddress}: err: ${err}`,
    // );
    return [];
  }
};

export const getTraderState = async (
  phoenixClient: Client,
  marketAddress: string,
  trader: string,
): Promise<UserGlobalBalances> => {
  try {
    phoenixClient.refreshMarket(marketAddress, true);

    const marketState = phoenixClient.marketStates.get(marketAddress);

    let userState = marketState.data.traders.get(trader);

    return {
      baseWalletBalance: 0.0,
      quoteWalletBalance: 0.0,
      baseActiveOrdersBalance: parseFloat(userState.baseLotsLocked.toString()),
      quoteActiveOrdersBalance: parseFloat(
        userState.quoteLotsLocked.toString(),
      ),
      baseWithdrawableBalance: parseFloat(userState.baseLotsFree.toString()),
      quoteWithdrawableBalance: parseFloat(userState.quoteLotsFree.toString()),
    };
  } catch (err) {
    // console.log(`Error fetching trader state: ${err}`);
  }

  return {
    baseWalletBalance: 0.0,
    quoteWalletBalance: 0.0,
    baseActiveOrdersBalance: 0.0,
    quoteActiveOrdersBalance: 0.0,
    baseWithdrawableBalance: 0.0,
    quoteWithdrawableBalance: 0.0,
  } as UserGlobalBalances;
};
