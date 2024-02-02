import React from "react";
import styles from "./OrderView.module.css";
import { Order } from "../../../../../../utils";

export interface OrderViewProps {
    order: Order
};

const OrderView = () => {
    return (
        <div className={styles.orderViewContainer}>
            <p>Order view</p>
        </div>
    );
}

export default OrderView;