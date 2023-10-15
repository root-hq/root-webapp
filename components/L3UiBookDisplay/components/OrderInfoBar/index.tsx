import React from 'react';
import styles from './OrderInfoBar.module.css';
import { L3UiOrder, Side } from '@ellipsis-labs/phoenix-sdk';

export interface OrderInfoBarProps {
    orderInfo: L3UiOrder
}

const OrderInfoBar = ({ orderInfo }: OrderInfoBarProps) => {

    const isSideBid = (orderInfo: L3UiOrder): boolean => orderInfo.side === Side.Bid;

    const isSideAsk= (orderInfo: L3UiOrder): boolean => orderInfo.side === Side.Ask;

    return (
        <div
            className={styles.orderInfoContainer}
            style={
                {
                    backgroundColor: orderInfo && isSideBid(orderInfo) ? 'green' : isSideAsk(orderInfo) ? 'red' : 'grey',
                    fontWeight: 'bold',
                    color: 'white',
                    padding: `0.2rem`,
                    textAlign: 'right',
                    margin: `0.15rem`
                }
            }
        >
            <span>{`${orderInfo.price}, ${orderInfo.size}`}</span>
        </div>
    );
}

export default OrderInfoBar;