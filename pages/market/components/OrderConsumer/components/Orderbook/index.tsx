import React, { useEffect, useRef, useState } from "react";
import styles from "./Orderbook.module.css";
import { EnumeratedMarketToMetadata } from "pages/market/[market]";
import { L3UiBook, L3UiOrder, MarketData, deserializeMarketData, getMarketL3UiBook } from "@ellipsis-labs/phoenix-sdk";
import { decimalPlacesFromTickSize, toScientificNotation } from "utils";
import { useWallet } from "@solana/wallet-adapter-react";

export interface OrderBookProps {
  enumeratedMarket: EnumeratedMarketToMetadata;
}

const Orderbook = ({
  enumeratedMarket
}: OrderBookProps) => {

  const [marketDataBuffer, setMarketDataBuffer] = useState<Buffer>(null);
  const [isOrderBookLoading, setIsOrderBookLoading] = useState<boolean>(false);

  const [bids, setBids] = useState<L3UiOrder[]>([]);
  const [asks, setAsks] = useState<L3UiOrder[]>([]);

  const bidBookContainerRef = useRef<HTMLDivElement>(null);

  const walletState = useWallet();

  useEffect(() => {
    if(enumeratedMarket) {
      setIsOrderBookLoading(true);

      const ws = new WebSocket(process.env.WS_ENDPOINT);

      ws.onopen = () => {
        ws.send(JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'accountSubscribe',
          params: [
            enumeratedMarket.spotGridMarket.phoenix_market_address,
            {
              "encoding": "base64",
              "commitment": "processed"
            }
          ]
        }));
      };

      // Handle incoming messages
      ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        if (data.method === 'accountNotification') {
          const accountData = data.params.result.value;
          if (accountData?.data[0] === undefined) {
            console.log(`Error fetching orderbook data`);
            return;
          }

          const compressedMarketData = Buffer.from(accountData?.data[0], "base64");
          setMarketDataBuffer(_ => compressedMarketData);
        }
        setIsOrderBookLoading(false);
      };

      // Clean up WebSocket connection
      return () => {
        ws.close();
      };
    }
  }, [enumeratedMarket]);

  useEffect(() => {
    const decodeMarketDataBuffer = () => {
      if(marketDataBuffer) {
        let marketData = deserializeMarketData(marketDataBuffer);
        let freshUiBook = getMarketL3UiBook(marketData, 11);

        setBids(_ => freshUiBook.bids.sort((a: L3UiOrder, b: L3UiOrder) => a.price - b.price));
        setAsks(_ => freshUiBook.asks);
      }
    }

    decodeMarketDataBuffer();
  }, [marketDataBuffer]);


  return (
    <div className={styles.orderBookContainer}>
      {
        isOrderBookLoading && bids.length === 0 && asks.length === 0 ?
          <div className={styles.loadingBookContainer}>Loading book...</div>
        :
          <div className={styles.bookContainer}>
            <div className={styles.bookTitleContainer}>
              <div className={styles.priceAndSize}>
                <span style={{marginLeft: `1.5rem`}}>{`Price`}</span>
                <span>{`Size`}</span>
              </div>
              <div className={styles.totalSize}>
                <span>{`Total ${enumeratedMarket ? `(${enumeratedMarket.quoteTokenMetadata.ticker})` : ``}`}</span>
              </div>
            </div>
            <div className={styles.bookSideContainer}>
              {
                bids && bids.length > 0 ?
                  <div className={styles.l3UiOrderLadder}>
                    {
                      bids.map((order, i) => {
                        return (
                          <div className={styles.l3UiBid} key={order.orderSequenceNumber}>                        
                            <div className={styles.priceAndSize}>
                              <span className={styles.price}>
                                <i className="fa-solid fa-circle"
                                style={{
                                  fontSize: `0.3rem`,
                                  color: walletState && walletState.connected && order.makerPubkey !== walletState.publicKey.toString() ? `yellow` : `transparent`,
                                  marginRight: `0.4rem`,
                                }}
                                ></i>
                                {
                                  enumeratedMarket ?
                                    decimalPlacesFromTickSize(enumeratedMarket.spotGridMarket.tick_size) > 5 ?
                                      toScientificNotation(order.price)
                                    :
                                      order.price
                                  :
                                    order.price
                                }
                              </span>
                              <span className={styles.size}>
                                {
                                  enumeratedMarket ?
                                    decimalPlacesFromTickSize(enumeratedMarket.spotGridMarket.tick_size) > 5 ?
                                      toScientificNotation(order.size)
                                    :
                                      order.size
                                  :
                                    order.size
                                }
                              </span>
                            </div>
                            <div className={styles.totalSize}>
                              <span>{`${(order.size * order.price).toFixed(2)}`}</span>
                            </div>
                          </div>
                        );
                      })
                    }
                  </div>
                :
                  <></>
              }
            </div>
            <div className={styles.midPriceAndSpreadContainer}>
              <div className={styles.midPrice}>
                <span>{`${bids && bids.length && asks && asks.length ? ((bids[bids.length - 1].price + asks[0].price) / 2.0).toFixed(decimalPlacesFromTickSize(enumeratedMarket.spotGridMarket.tick_size)) : ''}`}</span>
              </div>
              <div className={styles.spread}>
                <span>{`${bids && bids.length && asks && asks.length ? (asks[0].price - bids[bids.length - 1].price).toFixed(decimalPlacesFromTickSize(enumeratedMarket.spotGridMarket.tick_size)) : ''}`}</span>
              </div>
            </div>
            <div className={styles.bookSideContainer}>
              {
                asks && asks.length > 0 ?
                  <div className={styles.l3UiOrderLadder}>
                    {
                      asks.map((order, i) => {
                        return (
                          <div className={styles.l3UiAsk} key={order.orderSequenceNumber}>
                            <div className={styles.priceAndSize}>
                              <span className={styles.price}>
                                <i className="fa-solid fa-circle"
                                style={{
                                  fontSize: `0.3rem`,
                                  color: walletState && walletState.connected && order.makerPubkey !== walletState.publicKey.toString() ? `yellow` : `transparent`,
                                  marginRight: `0.4rem`,
                                }}
                                ></i>
                                {
                                  enumeratedMarket ?
                                    decimalPlacesFromTickSize(enumeratedMarket.spotGridMarket.tick_size) > 5 ?
                                      toScientificNotation(order.price)
                                    :
                                      order.price
                                  :
                                    order.price
                                }
                              </span>
                              <span className={styles.size}>
                                {
                                  enumeratedMarket ?
                                    decimalPlacesFromTickSize(enumeratedMarket.spotGridMarket.tick_size) > 5 ?
                                      toScientificNotation(order.size)
                                    :
                                      order.size
                                  :
                                    order.size
                                }
                              </span>
                            </div>
                            <div className={styles.totalSize}>
                              <span>{`${(order.size * order.price).toFixed(2)}`}</span>
                            </div>
                          </div>
                        );
                      })
                    }
                  </div>
                :
                  <></>
              }
            </div>
          </div>
      }
    </div>
  );
};

export default Orderbook;
