import React from 'react';
import styles from "./L3UiBookDisplay.module.css";
import {  L3UiBook } from "@ellipsis-labs/phoenix-sdk";
import OrderInfoBar from './components/OrderInfoBar';

export interface L3UiBookDisplayProps {
    l3UiBook: L3UiBook
}

const L3UiBookDisplay = ({ l3UiBook }: L3UiBookDisplayProps) => {
    return (
        <div className={styles.l3UiBookContainer}>
            {
                l3UiBook.asks.map((orderInfo)=> {
                    return <OrderInfoBar orderInfo={orderInfo} key={orderInfo.orderSequenceNumber}/>
                })
            }
            {
                l3UiBook.bids.map((orderInfo)=> {
                    return <OrderInfoBar orderInfo={orderInfo} key={orderInfo.orderSequenceNumber}/>
                })
            }
        </div>
    );
}

export default L3UiBookDisplay;