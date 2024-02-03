import React, { useEffect, useRef, useState } from "react";
import styles from "./OrderManager.module.css";
import { Order, SpotGridMarket, TokenMetadata, delay, getAllOrdersForTrader, getOpenOrdersForTrader } from "../../../../../../utils";
import { ACTIVE_ORDERS_REFRESH_FREQUENCY_IN_MS, OrderStatus, getAllOrderStatus, getOrderStatusText } from "../../../../../../constants";
import { useWallet } from "@solana/wallet-adapter-react";
import OrderView from "../OrderView";
import { EnumeratedMarketToMetadata } from "../../../../[market]";
import { getPriorityFeeEstimate } from "../../../../../../utils/helius";
import { web3 } from "@coral-xyz/anchor";
import { ComputeBudgetProgram, Connection } from "@solana/web3.js";
import { Client, getPhoenixEventsFromTransactionSignature } from "@ellipsis-labs/phoenix-sdk";

export interface OrderManagerProps {
    enumeratedMarket: EnumeratedMarketToMetadata;
    baseTokenMetadata: TokenMetadata;
    quoteTokenMetadata: TokenMetadata;
    phoenixClient: Client;
}

const OrderManager = ({
    enumeratedMarket,
    baseTokenMetadata,
    quoteTokenMetadata,
    phoenixClient
}: OrderManagerProps) => {

    const [allMarketsSelector, setAllMarketsSelector] = useState<boolean>(true);
    const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus>(OrderStatus.All);

    const [allMarketsDropdownOpen, setAllMarketsDropdownOpen] = useState(false);
    const [orderStatusDropdownOpen, setOrderStatusDropdownOpen] = useState(false);
    const [isCancelAllActionActive, setIsCancelAllActionActive] = useState(false);
    let [activeOrdersForTrader, setActiveOrdersForTrader] = useState<Order[]>([]);

    const allMarketsDropdownRef = useRef(null);
    const orderStatusDropdownRef = useRef(null);

    let allOrderStatusFilters = getAllOrderStatus();

    const walletState = useWallet();
    let connection: Connection;
    if(process.env.RPC_ENDPOINT) {
        connection = new Connection(process.env.RPC_ENDPOINT, { commitment: "processed" });
    }
    else {
        connection = new Connection(`https://api.mainnet-beta.solana.com/`, { commitment: "processed" });
    }

    const handleOrderStatusFilterUpdate = (
        newOrderStatusFilter: OrderStatus
    ) => {
        setOrderStatusFilter(_ => newOrderStatusFilter);
    };

    const handleCancelAllAction = async () => {
        setIsCancelAllActionActive(true)

        if(enumeratedMarket && enumeratedMarket.spotGridMarket && walletState.connected) {
            let marketAddress = enumeratedMarket.spotGridMarket.phoenix_market_address.toString();

            let priorityFeeLevels = null;

            try {
                priorityFeeLevels = (await getPriorityFeeEstimate([marketAddress])).priorityFeeLevels;
            }
            catch(err) {
                console.log(`Error fetching priority fee levels`);
            }

            try {
                let transaction = new web3.Transaction();
      
                // Create the priority fee instructions
                let unitsPrice = 10;
                if(priorityFeeLevels) {
                  unitsPrice = priorityFeeLevels["high"]
                }
      
                const computePriceIx = ComputeBudgetProgram.setComputeUnitPrice({
                  microLamports: unitsPrice,
                });
      
                const computeLimitIx = ComputeBudgetProgram.setComputeUnitLimit({
                  units: 200_000,
                });
                transaction.add(computePriceIx);
                transaction.add(computeLimitIx);

                let phxClient: Client = null;
                if(!phoenixClient) {
                    console.log("Creating fallback phxClient");
                    let endpoint = process.env.RPC_ENDPOINT;
                    if(!endpoint) {
                        endpoint = `https://api.mainnet-beta.solana.com`;
                    }

                    const connection = new web3.Connection(endpoint, {
                        commitment: "processed",
                    });

                    const client = await Client.create(connection);

                    client.addMarket(marketAddress);
                    console.log("New client initialized");
                    console.log("Client: ", client);
                }
                else {
                    phxClient = phoenixClient;
                }
                  
                let ix = phxClient.createCancelAllOrdersWithFreeFundsInstruction(marketAddress, walletState.publicKey);
                transaction.add(ix);
      
                let response = await walletState.sendTransaction(transaction, connection, { skipPreflight: true});
                console.log("Signature: ", response);
      
                let status = await getPhoenixEventsFromTransactionSignature(connection, response);
                if(status) {
                  let ixs = status.instructions;
                  for(let ix of ixs) {
                    for(let event of ix.events) {
                      if(event.__kind === "Reduce") {
                        console.log('Canceled all orders');
                      }
                    }
                  }
                }
              }
              catch(err) {
                console.log(`Error placing cancel all request: ${err}`);
              }
        }
        setIsCancelAllActionActive(false);
    }

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

    useEffect(() => {
        const refreshActiveOrdersForTrader = async () => {
            // if(walletState.connected && enumeratedMarket.spotGridMarket) {
            //     let orders: Order[] = [];

            //     try {
            //         // orders = await getAllOrdersForTrader(walletState.publicKey.toString());
            //         orders = await getOpenOrdersForTrader(enumeratedMarket.spotGridMarket.phoenix_market_address.toString(), walletState.publicKey.toString());
            //         console.log("orders: ", orders);
            //     }
            //     catch(err) {
            //         console.log(`Error fetching active orders: ${err}`);
            //     }

            //     if(orders.length > 0) {
            //         setActiveOrdersForTrader(_ => [...orders]);
            //         return;
            //     }
            //     else {
            //         setActiveOrdersForTrader(_ => []);
            //     }
            // }
            // else {
            //     setActiveOrdersForTrader(_ => []);
            // }
        }

        refreshActiveOrdersForTrader();

        const intervalId = setInterval(() => {
            refreshActiveOrdersForTrader();
        }, ACTIVE_ORDERS_REFRESH_FREQUENCY_IN_MS);

    return () => clearInterval(intervalId);
    }, [walletState]);

    return (
        <div className={styles.orderManagerContainer}>
            <div className={styles.topMenuContainer}>
                <span className={styles.orderTitleContainer}>Orders</span>
                <div className={styles.topMenuButtonContainer}>
                    {/* <div className={styles.allMarketsDropdownContainer} ref={allMarketsDropdownRef}>
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
                    </div> */}
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
                    <div
                        className={styles.cancelAllButtonContainer}
                        onClick={ () => {
                            handleCancelAllAction()
                        }}
                    >
                        <button className={styles.cancelAllButton}>
                            {
                                isCancelAllActionActive ?
                                    <div className={styles.spinnerBox}>
                                        <div
                                        className={styles.threeQuarterSpinner}
                                        style = {{
                                            border: `3px solid #e33d3d`,
                                            borderTop: `3px solid transparent`
                                        }}
                                        ></div>
                                    </div>
                                :
                                    <>Cancel All</>
                            }
                        </button>
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
                            {`Cancel`}
                        </span>
                    </div>
                </div>
            </div>
            <div className={styles.ordersDisplayContainer}>
                {
                    walletState && activeOrdersForTrader.length > 0 ?
                        <div className={styles.allOrderViewsContainer}>
                            {
                                activeOrdersForTrader.map((order, index) => {
                                    if(order) {
                                        return (
                                            <div key = {parseInt(order.order_sequence_number.toString())} className={styles.orderViewContainer}>
                                                <OrderView order = {order} enumeratedMarket={enumeratedMarket}/>
                                            </div>
                                        )
                                    }
                                    else {
                                        return (
                                            <></>
                                        )
                                    }
                                })
                            }
                        </div>
                    :
                        <div className={styles.noOrderViewContainer}>
                            <span>{`You have no active orders`}</span>
                        </div>
                }
            </div>
        </div>
    )
}

export default OrderManager;