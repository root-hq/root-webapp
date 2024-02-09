import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./Orderbook.module.css";
import { EnumeratedMarketToMetadata } from "pages/market/[market]";
import { decimalPlacesFromTickSize, toScientificNotation } from "utils";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRootState } from "components/RootStateContextType";

export interface OrderBookProps {
  enumeratedMarket: EnumeratedMarketToMetadata;
}

const Orderbook = ({
  enumeratedMarket
}: OrderBookProps) => {

  const { bids, asks, midPrice, instantaneousPriceIncrease, spread } = useRootState();

  const walletState = useWallet();

  const bidSideContainerComponent = useMemo(() => {
    return (
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
    )
  }, [bids]);

  const askSideContainerComponent = useMemo(() => {
    return (
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
    );
  }, [asks]);

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
        {askSideContainerComponent}
        <div className={styles.midPriceAndSpreadContainer}>
          <div className={styles.midPrice}
          style={{
            color: instantaneousPriceIncrease ? `#3DE383` : "#e33d3d",
            fontWeight: 'bold'
          }}
          >
            <span>{`${midPrice.current.toFixed(decimalPlacesFromTickSize(enumeratedMarket ? enumeratedMarket.spotGridMarket.tick_size : `0.001`))}`}</span>
          </div>
          <div className={styles.spread}>
            <span>{`${spread.current.toFixed(decimalPlacesFromTickSize(enumeratedMarket ? enumeratedMarket.spotGridMarket.tick_size : `0.001`))}`}</span>
          </div>
        </div>
        {bidSideContainerComponent}
      </div>
    </div>
  );
};

export default Orderbook;
