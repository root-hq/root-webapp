import React, { useEffect, useRef, useState } from "react";
import styles from "./OrderManager.module.css";
import { SpotGridMarket, TokenMetadata } from "../../../../../../utils";
import { OrderStatus, getAllOrderStatus, getOrderStatusText } from "../../../../../../constants";

export interface OrderManagerProps {
    spotGridMarket: SpotGridMarket;
    baseTokenMetadata: TokenMetadata;
    quoteTokenMetadata: TokenMetadata;
}

const OrderManager = ({
    spotGridMarket,
    baseTokenMetadata,
    quoteTokenMetadata
}: OrderManagerProps) => {

    const [allMarketsSelector, setAllMarketsSelector] = useState<boolean>(true);
    const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus>(OrderStatus.All);

    const [allMarketsDropdownOpen, setAllMarketsDropdownOpen] = useState(false);
    const [orderStatusDropdownOpen, setOrderStatusDropdownOpen] = useState(false);

    const allMarketsDropdownRef = useRef(null);
    const orderStatusDropdownRef = useRef(null);

    let allOrderStatusFilters = getAllOrderStatus();

    const handleOrderStatusFilterUpdate = (
        newOrderStatusFilter: OrderStatus
    ) => {
        setOrderStatusFilter(_ => newOrderStatusFilter);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
          if (allMarketsDropdownRef.current && !allMarketsDropdownRef.current.contains(event.target)) {
            setAllMarketsDropdownOpen(false);
          }

          if (orderStatusDropdownRef.current && !orderStatusDropdownRef.current.contains(event.target)) {
            setOrderStatusDropdownOpen(false);
          }
        };
    
        document.addEventListener('mousedown', handleClickOutside);
    
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className={styles.orderManagerContainer}>
            <div className={styles.topMenuContainer}>
                <span className={styles.orderTitleContainer}>Orders</span>
                <div className={styles.topMenuButtonContainer}>
                    <div className={styles.allMarketsDropdownContainer} ref={allMarketsDropdownRef}>
                        <div
                            className={styles.allMarketsDropdownButtonContainer}
                            onClick={() => {
                                setAllMarketsDropdownOpen(_ => !allMarketsDropdownOpen);
                            }}
                        >
                            <button className={styles.allMarketsDropdownButton}>
                                <div className={styles.allMarketsDropdownInnerContainer}>
                                    <div className={styles.allMarketsDropdownText}>
                                        {
                                            allMarketsSelector ?
                                                <span >All markets</span>
                                            :
                                                <span>{baseTokenMetadata && quoteTokenMetadata ? `${baseTokenMetadata.ticker} - ${quoteTokenMetadata.ticker}` : `This`}</span>
                                        }
                                    </div>
                                    <div className={styles.caretContainer}>
                                        {allMarketsDropdownOpen ? (
                                        <i className="fa-solid fa-caret-up"></i>
                                        ) : (
                                        <i className="fa-solid fa-caret-down"></i>
                                        )}
                                    </div>
                                </div>
                            </button>
                        </div>
                        <div className={styles.allMarketsDropdownContent}>
                            {
                                allMarketsDropdownOpen ?
                                    <div>
                                        {
                                            <button className={styles.allMarketsDropdownButtonSecondary} onClick={
                                                () => {
                                                    setAllMarketsDropdownOpen(_ => !allMarketsDropdownOpen);
                                                    setAllMarketsSelector(_ => !allMarketsSelector);
                                                }
                                            }>
                                                <div className={styles.allMarketsDropdownInnerContainer}>
                                                    {
                                                        allMarketsSelector ?
                                                            <span>{baseTokenMetadata && quoteTokenMetadata ? `${baseTokenMetadata.ticker} - ${quoteTokenMetadata.ticker}` : `This`}</span>
                                                        :
                                                            <span>All markets</span>
                                                    }
                                                </div>
                                            </button>
                                        }
                                    </div>
                                :
                                    <></>
                            }
                        </div>
                    </div>
                    {/* <div className={styles.orderStatusDropdownContainer} ref={orderStatusDropdownRef}>
                        <div
                            className={styles.orderStatusDropdownButtonContainer}
                            onClick={
                                () => {
                                    setOrderStatusDropdownOpen(_ => !orderStatusDropdownOpen)
                                }
                            }
                        >
                            <button className={styles.orderStatusDropdownButton}>
                                <div className={styles.orderStatusDropdownInnerContainer}>
                                    <div className={styles.orderStatusDropdownText}>
                                        <span>
                                            {
                                                getOrderStatusText(orderStatusFilter)
                                            }
                                        </span>
                                    </div>
                                    <div className={styles.caretContainer}>
                                        {orderStatusDropdownOpen ? (
                                        <i className="fa-solid fa-caret-up"></i>
                                        ) : (
                                        <i className="fa-solid fa-caret-down"></i>
                                        )}
                                    </div>
                                </div>
                            </button>
                        </div>
                        <div className={styles.orderStatusDropdownContent}>
                        {
                            orderStatusDropdownOpen ?
                            <div className={styles.orderStatusDropdownButtonSecondaryContainer}>
                                {
                                    allOrderStatusFilters.map((status) => {
                                        if(status !== orderStatusFilter) {
                                            return (
                                                <button key = {status.toString()} className={styles.orderStatusDropdownButtonSecondary} onClick={
                                                () => {
                                                    setOrderStatusDropdownOpen(_ => !orderStatusDropdownOpen);
                                                    handleOrderStatusFilterUpdate(status)
                                                }
                                                }>
                                                <div className={styles.orderStatusDropdownInnerContainer}>
                                                    <span>{getOrderStatusText(status)}</span>
                                                </div>
                                                </button>
                                            )
                                        }
                                    })
                                }
                            </div>
                            :
                            <></>
                        }
                        </div>
                    </div> */}
                    <div className={styles.cancelAllButtonContainer}>
                        <button className={styles.cancelAllButton}>Cancel all</button>
                    </div>
                </div>
            </div>
            <div className={styles.columnNamesOuterContainer}>
                <div className={styles.columnNamesContainer}>
                    <div className={styles.columnNameRow}>
                        <span className={styles.columnName}>
                            {`Market`}
                        </span>
                    </div>
                    <div className={styles.columnNameRow}>
                        <span className={styles.columnName}>
                            {`Side`}
                        </span>
                    </div>
                    <div className={styles.columnNameRow}>
                        <span className={styles.columnName}>
                            {`Price`}
                        </span>
                    </div>
                    <div className={styles.columnNameRow}>
                        <span className={styles.columnName}>
                            {`Size`}
                        </span>
                    </div>
                    <div className={styles.columnNameRow}>
                        <span className={styles.columnName}>
                            {`Total`}
                        </span>
                    </div>
                    <div className={styles.columnNameRow}>
                        <span className={styles.columnName}>
                            {`Filled`}
                        </span>
                    </div>
                    <div className={styles.columnNameRow}>
                        <span className={styles.columnName}>
                            {``}
                        </span>
                    </div>
                </div>
            </div>
            <div className={styles.ordersDisplayContainer}>
                {`Showing ${getOrderStatusText(orderStatusFilter).toLowerCase()} orders for ${allMarketsSelector ? `all markets` : `current market`}`}
            </div>
        </div>
    )
}

export default OrderManager;