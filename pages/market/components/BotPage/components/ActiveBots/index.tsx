import React, { useEffect, useState } from "react";
import styles from "./ActiveBots.module.css";
import { PhoenixMarket, TokenMetadata, TradingBotPosition, delay } from "utils";
import { useRootState } from "components/RootStateContextType";

export interface ActiveBotsProps {
    phoenixMarket: PhoenixMarket;
    baseTokenMetadata: TokenMetadata;
    bot: TradingBotPosition;
}

const ActiveBots = ({
    phoenixMarket,
    baseTokenMetadata,
    bot
}: ActiveBotsProps) => {

    const [uiMinPrice, setUiMinPrice] = useState<string>("");
    const [uiMaxPrice, setUiMaxPrice] = useState<string>("");
    const [uiNumOrders, setUiNumOrders] = useState<string>("");
    const [uiOrderSize, setUiOrderSize] = useState<string>("");

    const [isCloseBotButtonLoading, setIsCloseBotButtonLoading] = useState<boolean>(false);

    const { phoenixClient } = useRootState();

    useEffect(() => {
        const populateLocalState = async () => {
            if(phoenixClient) {
                const minPriceFloat = phoenixClient.ticksToFloatPrice(parseInt(bot.min_price_in_ticks), phoenixMarket.phoenix_market_address);
                const maxPriceFloat = phoenixClient.ticksToFloatPrice(parseInt(bot.max_price_in_ticks), phoenixMarket.phoenix_market_address);
                const orderSizeFloat = phoenixClient.baseLotsToBaseAtoms(parseFloat(bot.order_size_in_base_lots), phoenixMarket.phoenix_market_address) / Math.pow(10, baseTokenMetadata.decimals);
                const numOrdersInt = bot.num_orders;

                setUiMinPrice(_ => minPriceFloat.toString());
                setUiMaxPrice(_ => maxPriceFloat.toString());
                setUiNumOrders(_ => numOrdersInt.toString());
                setUiOrderSize(_ => orderSizeFloat.toString());
            }
            else {
                setUiMinPrice(_ => ``);
                setUiMaxPrice(_ => ``);
                setUiNumOrders(_ => ``);
                setUiOrderSize(_ => ``);
            }
        }

        populateLocalState();
    }, [phoenixMarket, bot]);

    const handleCloseBotAction = async () => {
        setIsCloseBotButtonLoading(true);
        await delay(3_000);
        setIsCloseBotButtonLoading(false);
    }

    return (
        <div className={styles.orderViewOuterContainer}>
          <div className={styles.orderViewContainer}>
            <div className={styles.columnNameRow}>
              <span className={styles.columnName}>
                {uiMinPrice}
              </span>
            </div>
            <div className={styles.columnNameRow}>
              <span className={styles.columnName}>
                {uiMaxPrice}
              </span>
            </div>
            <div className={styles.columnNameRow}>
              <span className={styles.columnName}>
                {uiNumOrders}
              </span>
            </div>
            <div className={styles.columnNameRow}>
              <span className={styles.columnName}>
                {uiOrderSize}
              </span>
            </div>
            <div className={styles.columnNameRow}>
              <span className={styles.columnName}>
                {uiOrderSize}
              </span>
            </div>
            <div className={styles.columnNameRow}>
              <div
                className={styles.cancelOrderButton}
                onClick={() => {
                  handleCloseBotAction();
                }}
              >
                <span>
                  {isCloseBotButtonLoading ? (
                    <div className={styles.spinnerBox}>
                      <div
                        className={styles.threeQuarterSpinner}
                        style={{
                          border: `3px solid #e33d3d`,
                          borderTop: `3px solid transparent`,
                        }}
                      ></div>
                    </div>
                  ) : (
                    <i className="fa-solid fa-power-off"></i>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
    );
}

export default ActiveBots;