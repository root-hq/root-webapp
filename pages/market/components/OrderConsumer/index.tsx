import React from "react";
import styles from "./OrderConsumer.module.css";
import { SpotGridMarket, TokenMetadata } from "../../../../utils/supabase";
import axios from "axios";
import { useEffect } from "react";

export interface OrderConsumerProps {
    selectedSpotGridMarket: SpotGridMarket,
    baseTokenMetadata: TokenMetadata,
    quoteTokenMetadata: TokenMetadata
}

const OrderConsumer = ({
    selectedSpotGridMarket,
    baseTokenMetadata,
    quoteTokenMetadata
}: OrderConsumerProps) => {

    return (
        <div className={styles.orderConsumerContainer}>
            <div className={styles.marketInfoContainer}>
                <div>
                    <p>Base token: {baseTokenMetadata.name}</p>
                    <p>Quote token: {quoteTokenMetadata.name}</p>
                </div>
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