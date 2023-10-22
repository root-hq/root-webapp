import React, { useEffect, useState } from "react";
import styles from "./OrderInfoBar.module.css";
import { L3UiOrder, Side } from "@ellipsis-labs/phoenix-sdk";
import { MAKER_PUBKEY } from "../../../../constants";

export interface OrderInfoBarProps {
  orderInfo: L3UiOrder;
  relativeSize: number;
}

const OrderInfoBar = ({ orderInfo, relativeSize }: OrderInfoBarProps) => {
  const [windowSize, setWindowSize] = useState([0, 0]);

  const BID_GRADIENT =
    "linear-gradient(to right, #35c674, #2fb067, #2b9f5d, #299457, #278e54, #25824d, #206d42, #1b5e38, #174f2f, #134126, #103720, #0e2f1c, #191919)";
  const ASK_GRADIENT =
    "linear-gradient(to right, #ca3329, #b52f26, #ad2c23, #9c2820, #8d251e, #7d211b, #6d1d18, #5a1915, #4a1411, #3b100e, #2a0b0a, #191919)";

  useEffect(() => {
    const handleWindowResize = () => {
      setWindowSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  const isSideBid = (orderInfo: L3UiOrder): boolean =>
    orderInfo.side === Side.Bid;

  const isSideAsk = (orderInfo: L3UiOrder): boolean =>
    orderInfo.side === Side.Ask;

  return (
    <div className={styles.orderInfoContainer}>
      <div className={styles.orderPriceContainer}>
        <span
          className={styles.orderPrice}
          style={{
            color:
              orderInfo && isSideBid(orderInfo)
                ? "#35c674"
                : isSideAsk(orderInfo)
                ? "#ca3329"
                : "grey",
          }}
        >
          {orderInfo.price}
        </span>
      </div>
      <div
        className={styles.orderSizeContainer}
        style={{
          background:
            orderInfo && isSideBid(orderInfo)
              ? `${BID_GRADIENT}`
              : isSideAsk(orderInfo)
              ? `${ASK_GRADIENT}`
              : "grey",
          fontWeight: "bold",
          color: orderInfo.makerPubkey === MAKER_PUBKEY ? "#477df2" : "white",
          padding: `0.2rem`,
          paddingLeft: `3rem`,
          paddingRight: "1rem",
          overflow: "hidden",
          textAlign: "right",
          width: `${5 + relativeSize}%`,
        }}
      >
        <div
          className={styles.orderSize}
          style={{
            color: "#ccc",
            fontWeight: "bold",
          }}
        >
          <span className={styles.orderSizeText}>{`${orderInfo.size.toFixed(
            3,
          )}`}</span>
          {orderInfo.makerPubkey === MAKER_PUBKEY ? (
            <div className={styles.makerOrderIndicator}>
              <span>◀</span>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderInfoBar;
