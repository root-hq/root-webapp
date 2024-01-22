import React from "react";
import styles from "./MarketPage.module.css";
import OrderConsumer from "./components/OrderConsumer";
import OrderProducer from "./components/OrderProducer";

const MarketPage = () => {
    return (
        <div className={styles.marketPageContainer}>
            <div className={styles.orderConsumerContainer}>
                <OrderConsumer />
            </div>
            <div className={styles.orderProducerContainer}>
                <OrderProducer />
            </div>
        </div>
    )
}

export default MarketPage;