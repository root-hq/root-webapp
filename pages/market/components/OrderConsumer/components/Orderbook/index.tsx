import React, { useEffect, useRef, useState } from "react";
import styles from "./Orderbook.module.css";
import { EnumeratedMarketToMetadata } from "pages/market/[market]";
import { decimalPlacesFromTickSize, toScientificNotation } from "utils";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRootState } from "pages/market/RootStateContextType";

export interface OrderBookProps {
  enumeratedMarket: EnumeratedMarketToMetadata;
}

const Orderbook = ({
  enumeratedMarket
}: OrderBookProps) => {

  const { bids, asks } = useRootState();

  const walletState = useWallet();

  return (
    <div className={styles.orderBookContainer}>
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
        <div className={styles.midPriceAndSpreadContainer}>
          <div className={styles.midPrice}>
            <span>{`${bids && bids.length && asks && asks.length ? ((bids[0].price + asks[asks.length - 1].price) / 2.0).toFixed(decimalPlacesFromTickSize(enumeratedMarket.spotGridMarket.tick_size)) : ''}`}</span>
          </div>
          <div className={styles.spread}>
            <span>{`${bids && bids.length && asks && asks.length ? (asks[asks.length - 1].price - bids[0].price).toFixed(decimalPlacesFromTickSize(enumeratedMarket.spotGridMarket.tick_size)) : ''}`}</span>
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
      </div>
    </div>
  );
};

export default Orderbook;