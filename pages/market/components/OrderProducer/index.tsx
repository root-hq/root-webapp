import React from "react";
import styles from "./OrderProducer.module.css";
import { SpotGridMarket } from "../../../../utils/supabase";

export interface OrderProducerProps {
    spotGridMarket: SpotGridMarket
}

const OrderProducer = ({
    spotGridMarket
}: OrderProducerProps) => {
    return (
        <div className={styles.orderProducerContainer}>
            <p>Order Producer</p>
        </div>
    )
}

export default OrderProducer;