import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./Orderbook.module.css";
import { EnumeratedMarketToMetadata } from "pages/market/[market]";
import { decimalPlacesFromTickSize, toScientificNotation } from "utils";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRootState } from "components/RootStateContextType";

export interface OrderBookProps {
  enumeratedMarket: EnumeratedMarketToMetadata;
}

const Orderbook = ({ enumeratedMarket }: OrderBookProps) => {
  const { bids, asks, midPrice, instantaneousPriceIncrease, spread } =
    useRootState();

  const walletState = useWallet();

  const [bidDepth, setBidDepth] = useState<number>(0.0);
  const [askDepth, setAskDepth] = useState<number>(0.0);
  const [totalDepth, setTotalDepth] = useState<number>(0.0);

  useEffect(() => {
    const refreshDepth = () => {
      let totalBidDepth = 0;
      let totalAskDepth = 0;

      let bidsSlice = bids.slice(0, 10);
      let asksSlice = asks.slice(-10);

      for (let bid of bidsSlice) {
        totalBidDepth += bid.price * bid.size;
      }

      for (let ask of asksSlice) {
        totalAskDepth += ask.price * ask.size;
      }

      setBidDepth((_) => totalBidDepth);
      setAskDepth((_) => totalAskDepth);
      setTotalDepth((_) => totalBidDepth + totalAskDepth);
    };

    refreshDepth();
  }, [bids, asks]);

  const bidSideContainerComponent = useMemo(() => {
    return (
      <div className={styles.bookSideContainer}>
        {bids && bids.length > 0 ? (
          <div className={styles.l3UiOrderLadder}>
            {bids.slice(0, 10).map((order, i) => {
              return (
                <div
                  className={styles.l3UiBid}
                  key={order.orderSequenceNumber}
                  style={{
                    backgroundImage: `linear-gradient(to right, transparent ${90 - ((order.price * order.size) / totalDepth) * 100}%, rgba(61, 227, 131, 0.20) ${(order.price * order.size) / totalDepth}%)`,
                  }}
                >
                  <div className={styles.priceAndSize}>
                    <span className={styles.price}>
                      <i
                        className="fa-solid fa-circle"
                        style={{
                          fontSize: `0.3rem`,
                          color:
                            walletState &&
                            walletState.connected &&
                            order.makerPubkey ===
                              walletState.publicKey.toString()
                              ? `yellow`
                              : `transparent`,
                          marginRight: `0.4rem`,
                        }}
                      ></i>
                      {enumeratedMarket
                        ? decimalPlacesFromTickSize(
                            enumeratedMarket.phoenixMarket.tick_size,
                          ) >= 6
                          ? toScientificNotation(order.price)
                          : order.price
                        : order.price}
                    </span>
                    <span className={styles.size}>
                      {enumeratedMarket
                        ? decimalPlacesFromTickSize(
                            enumeratedMarket.phoenixMarket.tick_size,
                          ) >= 6
                          ? toScientificNotation(order.size)
                          : order.size
                        : order.size}
                    </span>
                  </div>
                  <div className={styles.totalSize}>
                    <span>{`${(order.size * order.price).toFixed(2)}`}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <></>
        )}
      </div>
    );
  }, [bids]);

  const askSideContainerComponent = useMemo(() => {
    return (
      <div className={styles.bookSideContainer}>
        {asks && asks.length > 0 ? (
          <div className={styles.l3UiOrderLadder}>
            {asks.slice(-10).map((order, i) => {
              return (
                <div
                  className={styles.l3UiAsk}
                  key={order.orderSequenceNumber}
                  style={{
                    backgroundImage: `linear-gradient(to right, transparent ${90 - ((order.price * order.size) / totalDepth) * 100}%, rgba(227, 61, 61, 0.20) ${(order.price * order.size) / totalDepth}%)`,
                  }}
                >
                  <div className={styles.priceAndSize}>
                    <span className={styles.price}>
                      <i
                        className="fa-solid fa-circle"
                        style={{
                          fontSize: `0.3rem`,
                          color:
                            walletState &&
                            walletState.connected &&
                            order.makerPubkey ===
                              walletState.publicKey.toString()
                              ? `yellow`
                              : `transparent`,
                          marginRight: `0.4rem`,
                        }}
                      ></i>
                      {enumeratedMarket
                        ? decimalPlacesFromTickSize(
                            enumeratedMarket.phoenixMarket.tick_size,
                          ) >= 6
                          ? toScientificNotation(order.price)
                          : order.price
                        : order.price}
                    </span>
                    <span className={styles.size}>
                      {enumeratedMarket
                        ? decimalPlacesFromTickSize(
                            enumeratedMarket.phoenixMarket.tick_size,
                          ) >= 6
                          ? toScientificNotation(order.size)
                          : order.size
                        : order.size}
                    </span>
                  </div>
                  <div className={styles.totalSize}>
                    <span>{`${(order.size * order.price).toFixed(2)}`}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <></>
        )}
      </div>
    );
  }, [asks]);

  return (
    <div className={styles.orderBookContainer}>
      <div className={styles.bookContainer}>
        <div className={styles.bookTitleContainer}>
          <div className={styles.priceAndSize}>
            <span style={{ marginLeft: `1.5rem` }}>{`Price`}</span>
            <span>{`Size`}</span>
          </div>
          <div className={styles.totalSize}>
            <span>{`Total ${enumeratedMarket ? `(${enumeratedMarket.quoteTokenMetadata.ticker})` : ``}`}</span>
          </div>
        </div>
        {askSideContainerComponent}
        <div className={styles.midPriceAndSpreadContainer}>
          <div
            className={styles.midPrice}
            style={{
              color: instantaneousPriceIncrease ? `#3DE383` : "#e33d3d",
              fontWeight: "bold",
            }}
          >
            <span>{`${midPrice.current.toFixed(decimalPlacesFromTickSize(enumeratedMarket ? enumeratedMarket.phoenixMarket.tick_size : `0.001`))}`}</span>
          </div>
          <div className={styles.spread}>
            <span>{`
              ${
                spread.current <= 0 ?
                  `0`
                :
                  enumeratedMarket
                  ? decimalPlacesFromTickSize(
                      enumeratedMarket.phoenixMarket.tick_size,
                    ) >= 6
                    ? toScientificNotation(spread.current)
                    : spread.current.toFixed(
                        decimalPlacesFromTickSize(
                          enumeratedMarket
                            ? enumeratedMarket.phoenixMarket.tick_size
                            : `0.001`,
                        ),
                      )
                  : spread.current
              }`}</span>
          </div>
        </div>
        {bidSideContainerComponent}
      </div>
      <div>
        <div className={styles.orderSkewnessContainer}>
          <div
            className={styles.orderSkewness}
            // style={{
            //   backgroundImage:                 `linear-gradient(to right, rgba(61, 227, 131, 0.25) ${(bidDepth * 100) / totalDepth}%, rgba(227, 61, 61, 0.25) ${(100 - ((bidDepth * 100) / totalDepth))}%)`
            // }}
          >
            <div
              className={styles.bidDepth}
              style={{
                backgroundColor: `rgba(61, 227, 131, 0.25)`,
                width: `${(bidDepth * 100) / totalDepth}%`,
                display: `flex`,
                justifyContent: `flex-start`,
              }}
            >
              <span>{`${((bidDepth * 100) / totalDepth).toFixed(2)}%`}</span>
            </div>
            <div
              className={styles.askDepth}
              style={{
                backgroundColor: `rgba(227, 61, 61, 0.25)`,
                width: `${100 - (bidDepth * 100) / totalDepth}%`,
                display: `flex`,
                justifyContent: `flex-end`,
              }}
            >
              <span>{`${((askDepth * 100) / totalDepth).toFixed(2)}%`}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orderbook;
