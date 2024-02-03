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
                    <span className={styles.columnName}>
                        {
                            enumeratedMarket ?
                                <div className={styles.imageContainer}>
                                    <div className={styles.tokenImageContainer}>
                                        {enumeratedMarket.baseTokenMetadata && enumeratedMarket.baseTokenMetadata.img_url ? (
                                            <Image
                                                src={enumeratedMarket.baseTokenMetadata.img_url}
                                                width={22}
                                                height={22}
                                                alt={`${enumeratedMarket.baseTokenMetadata.ticker} img`}
                                                className={styles.tokenImage}
                                            />
                                        ) : (
                                            <></>
                                        )}
                                    </div>
                                    <div className={styles.tokenImageContainer}>
                                        {enumeratedMarket.quoteTokenMetadata && enumeratedMarket.quoteTokenMetadata.img_url ? (
                                            <Image
                                            src={enumeratedMarket.quoteTokenMetadata.img_url}
                                            width={22}
                                            height={22}
                                            alt={`${enumeratedMarket.quoteTokenMetadata.ticker} img`}
                                            className={styles.tokenImage}
                                            />
                                        ) : (
                                            <></>
                                        )}
                                    </div>
                                </div>
                            :
                                <span></span>
                        }
                    </span>
                </div>
                <div className={styles.columnNameRow}>
                    <span className={styles.columnName}>
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