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
        >
            <div className={styles.orderPriceContainer}>
                <span
                    className={styles.orderPrice}
                    style = {
                        {
                            color: orderInfo && isSideBid(orderInfo) ? 'green' : isSideAsk(orderInfo) ? 'red' : 'grey',
                        }
                    }
                >{orderInfo.price}</span>
            </div>
            <div className={styles.orderSizeContainer}>
                <div
                    className={styles.orderSizeBar}
                    style={
                        {
                            backgroundColor: orderInfo && isSideBid(orderInfo) ? 'green' : isSideAsk(orderInfo) ? 'red' : 'grey',
                            fontWeight: 'bold',
                            color: 'white',
                            padding: `0.2rem`,
                            paddingLeft: `3rem`,
                            paddingRight: '1rem',
                            textAlign: 'right',
                        }
                    }
                >
                    <span className={styles.orderSize}>{orderInfo.size}</span>
                </div>
            </div>
        </div>
    );
}

export default OrderInfoBar;