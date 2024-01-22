import React from "react";
import styles from "./OrderConsumer.module.css";

const OrderConsumer = () => {
    return (
        <div className={styles.orderConsumerContainer}>
            <div className={styles.marketInfoContainer}>
                <p>Market info view</p>
            </div>
            <div className={styles.tradingViewChartContainer}>
                <p>Trading View chart</p>
            </div>
            <div className={styles.orderManagerContainer}>
                <p>Order Manager</p>
            </div>
        </div>
    )
}

export default OrderConsumer;