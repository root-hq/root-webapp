import React from 'react';
import styles from "./L3UiBookDisplay.module.css";
import {  L3UiBook, L3UiOrder, Side } from "@ellipsis-labs/phoenix-sdk";
import OrderInfoBar from './components/OrderInfoBar';

export interface L3UiBookDisplayProps {
    l3UiBook: L3UiBook
}

const L3UiBookDisplay = ({ l3UiBook }: L3UiBookDisplayProps) => {

    const getRelativeSize = (orderInfo: L3UiOrder) => {
        let totalAskSize = l3UiBook.asks.reduce((accumulator, currentOrder) => {
            return accumulator + currentOrder.size
        }, 0);
        
        let totalBidSize = l3UiBook.asks.reduce((accumulator, currentOrder) => {
            return accumulator + currentOrder.size
        }, 0);

        return (orderInfo.size * 100) / (totalAskSize + totalBidSize);
    }
    return (
        <div className={styles.l3UiBookContainer}>
            {
                l3UiBook.asks.map((orderInfo)=> {
                    return <OrderInfoBar orderInfo={orderInfo} key={orderInfo.orderSequenceNumber} relativeSize={getRelativeSize(orderInfo)}/>
                })
            }
            {
                l3UiBook.bids.map((orderInfo)=> {
                    return <OrderInfoBar orderInfo={orderInfo} key={orderInfo.orderSequenceNumber} relativeSize={getRelativeSize(orderInfo)}/>
                })
            }
        </div>
    );
}

export default L3UiBookDisplay;