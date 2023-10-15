import React, { useEffect, useState } from 'react';
import styles from './OrderInfoBar.module.css';
import { L3UiOrder, Side } from '@ellipsis-labs/phoenix-sdk';
import { MAKER_PUBKEY } from '../../../../constants/addresses';

export interface OrderInfoBarProps {
    orderInfo: L3UiOrder,
    relativeSize: number
}

const OrderInfoBar = ({ orderInfo, relativeSize }: OrderInfoBarProps) => {

    const [windowSize, setWindowSize] = useState([0,0]);

    useEffect(() => {
        const handleWindowResize = () => {
            setWindowSize([window.innerWidth, window.innerHeight]);
        };
    
        window.addEventListener('resize', handleWindowResize);
    
        return () => {
          window.removeEventListener('resize', handleWindowResize);
        };
    }, []);

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
                            color: orderInfo && isSideBid(orderInfo) ? '#237a55' : isSideAsk(orderInfo) ? '#c34c49' : 'grey',
                        }
                    }
                >{orderInfo.price}</span>
            </div>
            <div className={styles.orderSizeContainer}>
                <div
                    className={styles.orderSizeBar}
                    style={
                        {
                            backgroundColor: orderInfo && isSideBid(orderInfo) ? '#154536' : isSideAsk(orderInfo) ? '#56272a' : 'grey',
                            fontWeight: 'bold',
                            color: orderInfo.makerPubkey === MAKER_PUBKEY ? '#477df2' : 'white',
                            padding: `0.2rem`,
                            paddingLeft: `3rem`,
                            paddingRight: '1rem',
                            overflow: 'hidden',
                            textAlign: 'right',
                        }
                    }
                >
                    <span className={styles.orderSize}>{`${orderInfo.size}`}</span>
                </div>
            </div>
        </div>
    );
}

export default OrderInfoBar;