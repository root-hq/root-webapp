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

    const BID_GRADIENT = 'linear-gradient(to right, #186c57, #18624f, #1a4c3e, #193d32, #192b26, #191919)';
    const ASK_GRADIENT = 'linear-gradient(to right, #7f2d2d, #742929, #4d1e1d, #371a19, #2e1819, #191919)';

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
                            color: orderInfo && isSideBid(orderInfo) ? '#1c886d' : isSideAsk(orderInfo) ? '#9a2f2f' : 'grey',
                        }
                    }
                >{orderInfo.price}</span>
            </div>
            <div
                className={styles.orderSizeContainer}
                style={
                    {
                        background: orderInfo && isSideBid(orderInfo) ? `${BID_GRADIENT}` : isSideAsk(orderInfo) ? `${ASK_GRADIENT}` : 'grey',
                        fontWeight: 'bold',
                        color: orderInfo.makerPubkey === MAKER_PUBKEY ? '#477df2' : 'white',
                        padding: `0.2rem`,
                        paddingLeft: `3rem`,
                        paddingRight: '1rem',
                        overflow: 'hidden',
                        textAlign: 'right',
                        width: `${5 + relativeSize}%`
                    }
                }
            >
                <div className={styles.orderSize}
                    style = {{
                        color: '#ccc',
                        fontWeight: 'bold',

                    }}
                >
                    <span className={styles.orderSizeText}>{`${orderInfo.size.toFixed(3)}`}</span>
                    {
                        orderInfo.makerPubkey === MAKER_PUBKEY ?
                            <div className={styles.makerOrderIndicator}>
                                <span>◀</span>
                            </div>
                        :
                            <></>
                    }
                </div>
            </div>
        </div>
    );
}

export default OrderInfoBar;