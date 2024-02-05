import React from "react";
import styles from "./OrderView.module.css";
import { Order } from "../../../../../../utils";
import { EnumeratedMarketToMetadata } from "../../../../[market]";
import Image from "next/image";

export interface OrderViewProps {
    enumeratedMarket: EnumeratedMarketToMetadata | null;
    order: Order
};

const OrderView = ({
    enumeratedMarket,
    order
}: OrderViewProps) => {
    return (
        <div className={styles.orderViewOuterContainer}>
            <div className={styles.orderViewContainer}>
                <div className={styles.columnNameRow}>
                    <span
                        style = {{
                            color: order.is_buy_order ? `#3DE383` : `#e33d3d`
                        }}
                    >
                        {
                            order ?
                                order.is_buy_order ?
                                    <span>{`BUY`}</span>
                                :
                                    <span>{`SELL`}</span>
                            :
                                <></>
                        }
                    </span>
                </div>
                <div className={styles.columnNameRow}>
                    <span className={styles.columnName}>
                        {
                            order ?
                                <span>{order.price_in_ticks}</span>
                            :
                                <span></span>
                        }
                    </span>
                </div>
                <div className={styles.columnNameRow}>
                    <span className={styles.columnName}>
                        {
                            order ?
                                <span>{order.size_in_base_lots}</span>
                            :
                                <span></span>
                        }
                    </span>
                </div>
                <div className={styles.columnNameRow}>
                    <span className={styles.columnName}>
                        {
                            order ?
                                <span>{order.price_in_ticks}</span>
                            :
                                <span></span>
                        }
                    </span>
                </div>
                <div className={styles.columnNameRow}>
                    <span className={styles.columnName}>
                        {
                            order ?
                                <span>{order.fill_size_in_base_lots}</span>
                            :
                                <span></span>
                        }
                    </span>
                </div>
                <div className={styles.columnNameRow}>
                    <span className={styles.columnName}>
                        {`Cancel`}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default OrderView;