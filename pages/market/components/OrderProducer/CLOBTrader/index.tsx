import React, { useEffect, useRef, useState } from "react";
import styles from "./CLOBTrader.module.css";
import {
  OrderType,
  getAllOrderTypes,
  getOrderTypeText,
} from "../../../../../constants";
import { PhoenixMarket, TokenMetadata } from "../../../../../utils/supabase";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { web3 } from "@coral-xyz/anchor";
import { Form } from "react-bootstrap";
import dynamic from "next/dynamic";

import { useRootState } from "components/RootStateContextType";
import MarketOrderView from "../components/MarketOrderView";

const LimitOrderView = dynamic(() => import("../components/LimitOrderView"), {
  ssr: false,
});

export interface CLOBTraderProps {
  phoenixMarket: PhoenixMarket;
  baseTokenMetadata: TokenMetadata;
  quoteTokenMetadata: TokenMetadata;
}

const CLOBTrader = ({
  phoenixMarket,
  baseTokenMetadata,
  quoteTokenMetadata,
}: CLOBTraderProps) => {
  let { connection } = useRootState();

  const [isBuyOrder, setIsBuyOrder] = useState(true);
  const [orderType, setOrderType] = useState<OrderType>(OrderType.Limit);
  const [resetFieldsCounter, setResetFieldsCounter] = useState<number>(0);

  const orderTypeDropdownRef = useRef(null);
  // const resetFieldsCounter = useRef<number>(0);

  const [isOrderTypeDropdownOpen, setOrderTypeDropdownOpen] = useState(false);

  const [baseTokenBalance, setBaseTokenBalance] = useState(0.0);
  const [quoteTokenBalance, setQuoteTokenBalance] = useState(0.0);
  const [nativeSOLBalance, setNativeSOLBalance] = useState(0.0);

  const walletState = useWallet();

  useEffect(() => {
    const updateBalance = async () => {
      if (walletState.connected && baseTokenMetadata && quoteTokenMetadata) {
        const baseTokenAddress = await getAssociatedTokenAddress(
          new web3.PublicKey(baseTokenMetadata.mint),
          walletState.publicKey,
        );
        const quoteTokenAddress = await getAssociatedTokenAddress(
          new web3.PublicKey(quoteTokenMetadata.mint),
          walletState.publicKey,
        );

        let baseBalance = 0;
        try {
          baseBalance = (
            await connection.getTokenAccountBalance(baseTokenAddress)
          ).value.uiAmount;
        } catch (Err) {
          // console.log(`Error fetching base ata balance`);
          baseBalance = 0;
        }

        let quoteBalance = 0;
        try {
          quoteBalance = (
            await connection.getTokenAccountBalance(quoteTokenAddress)
          ).value.uiAmount;
        } catch (err) {
          // console.log(`Error fetching quote ata balance`);
          quoteBalance = 0;
        }

        let nativeSOLLamports = await connection.getBalance(
          walletState.publicKey,
        );
        let nativeSOLBalance = nativeSOLLamports / LAMPORTS_PER_SOL;

        setBaseTokenBalance((_) => baseBalance);
        setQuoteTokenBalance((_) => quoteBalance);
        setNativeSOLBalance((_) => nativeSOLBalance);
      } else {
        setBaseTokenBalance((_) => 0);
        setQuoteTokenBalance((_) => 0);
      }
    };

    updateBalance();
  }, [
    phoenixMarket,
    walletState,
    connection,
    baseTokenMetadata,
    quoteTokenMetadata,
  ]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        orderTypeDropdownRef.current &&
        !orderTypeDropdownRef.current.contains(event.target)
      ) {
        setOrderTypeDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  let allOrderTypes = getAllOrderTypes();

  const triggerResetFieldsSignal = () => {
    setResetFieldsCounter((_) => resetFieldsCounter + 1);
  };

  const handleBuySellToggle = (type: string) => {
    if (type === "buy") {
      setIsBuyOrder((_) => true);
      triggerResetFieldsSignal();
    } else {
      setIsBuyOrder((_) => false);
      triggerResetFieldsSignal();
    }
  };

  const handleOrderTypeUpdate = (newOrderType: OrderType) => {
    setOrderType((_) => newOrderType);
    triggerResetFieldsSignal();
  };

  const toggleOrderTypeDropdown = (e) => {
    e.preventDefault();

    setOrderTypeDropdownOpen(!isOrderTypeDropdownOpen);
  };

  return (
    <div className={styles.clobTraderContainer}>
      <div className={styles.tabsContainer}>
        <div className={styles.buyTabContainer}>
          <button
            className={styles.buyTabButton}
            key={"buyButton"}
            style={{
              borderTop: isBuyOrder ? "3px solid #3DE383" : "",
            }}
            onClick={() => {
              handleBuySellToggle("buy");
            }}
          >
            Buy
          </button>
        </div>
        <div className={styles.sellTabContainer}>
          <button
            className={styles.sellTabButton}
            key={"sellButton"}
            style={{
              borderTop: !isBuyOrder ? "3px solid #e33d3d" : "",
            }}
            onClick={() => {
              handleBuySellToggle("sell");
            }}
          >
            Sell
          </button>
        </div>
      </div>
      <div className={styles.orderTypeFormAndResetFieldsContainer}>
        <Form className={styles.orderTypeFormAndResetFields}>
          <Form.Group controlId="formInput">
            <div className={styles.shortcutButtonsContainer}>
              <div className={styles.resetButtonContainer}>
                <span
                  className={styles.resetFieldsButton}
                  onClick={() => {
                    triggerResetFieldsSignal();
                  }}
                >
                  Reset
                </span>
              </div>
            </div>
          </Form.Group>
          <Form.Group controlId="formInput">
            <div
              className={styles.orderTypeChooseContainer}
              ref={orderTypeDropdownRef}
            >
              <div
                className={styles.dropdownButtonContainer}
                onClick={(e) => {
                  toggleOrderTypeDropdown(e);
                }}
              >
                <button className={styles.dropdownButton}>
                  <div className={styles.dropdownInnerContainer}>
                    <span>{getOrderTypeText(orderType)}</span>
                    <div className={styles.caretContainer}>
                      {isOrderTypeDropdownOpen ? (
                        <i className="fa-solid fa-caret-up"></i>
                      ) : (
                        <i className="fa-solid fa-caret-down"></i>
                      )}
                    </div>
                  </div>
                </button>
              </div>
              <div>
                {isOrderTypeDropdownOpen ? (
                  <div className={styles.dropdownButtonSecondaryContainer}>
                    {allOrderTypes.map((type) => {
                      if (type !== orderType) {
                        return (
                          <div
                            className={styles.dropdownButtonSecondaryEntry}
                            key={type.toString()}
                          >
                            <button
                              className={styles.dropdownButtonSecondary}
                              onClick={(e) => {
                                toggleOrderTypeDropdown(e);
                                handleOrderTypeUpdate(type);
                              }}
                            >
                              <div className={styles.dropdownInnerContainer}>
                                <span>{getOrderTypeText(type)}</span>
                              </div>
                            </button>
                          </div>
                        );
                      }
                    })}
                  </div>
                ) : (
                  <></>
                )}
              </div>
            </div>
          </Form.Group>
        </Form>
      </div>
      <div>
        {orderType === OrderType.Limit ? (
          <LimitOrderView
            phoenixMarket={phoenixMarket}
            baseTokenMetadata={baseTokenMetadata}
            quoteTokenMetadata={quoteTokenMetadata}
            nativeSOLBalance={nativeSOLBalance}
            baseTokenBalance={baseTokenBalance}
            quoteTokenBalance={quoteTokenBalance}
            isBuyOrder={isBuyOrder}
            resetFieldsSignal={resetFieldsCounter}
          />
        ) : orderType === OrderType.Market ? (
          <MarketOrderView
            phoenixMarket={phoenixMarket}
            baseTokenMetadata={baseTokenMetadata}
            quoteTokenMetadata={quoteTokenMetadata}
            nativeSOLBalance={nativeSOLBalance}
            baseTokenBalance={baseTokenBalance}
            quoteTokenBalance={quoteTokenBalance}
            isBuyOrder={isBuyOrder}
            resetFieldsSignal={resetFieldsCounter}
          />
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default CLOBTrader;
