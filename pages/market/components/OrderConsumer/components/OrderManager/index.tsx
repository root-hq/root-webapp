import React, { useEffect, useState } from "react";
import styles from "./OrderManager.module.css";
import { Order, TokenMetadata, getOpenOrdersForTrader } from "../../../../../../utils";
import { ACTIVE_ORDERS_REFRESH_FREQUENCY_IN_MS } from "../../../../../../constants";
import { useWallet } from "@solana/wallet-adapter-react";

const OrderView = dynamic(() => import('../OrderView'), { ssr: false });

import { EnumeratedMarketToMetadata } from "../../../../[market]";
import { getPriorityFeeEstimate } from "../../../../../../utils/helius";
import { web3 } from "@coral-xyz/anchor";
import { ComputeBudgetProgram, Connection } from "@solana/web3.js";
import { Client } from "@ellipsis-labs/phoenix-sdk";
import { useBottomStatus } from "../../../../../../components/BottomStatus";
import dynamic from "next/dynamic";
import Link from "next/link";

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

    const [isCancelAllActionActive, setIsCancelAllActionActive] = useState(false);
    let [activeOrdersForTrader, setActiveOrdersForTrader] = useState<Order[]>([]);

    const walletState = useWallet();
    const { updateStatus, green, red } = useBottomStatus();

    let connection: Connection;
    if(process.env.RPC_ENDPOINT) {
        connection = new Connection(process.env.RPC_ENDPOINT, { commitment: "processed" });
    }
    else {
        connection = new Connection(`https://api.mainnet-beta.solana.com/`, { commitment: "processed" });
    }

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
                updateStatus(<span>{`Preparing cancel all transaction...`}</span>);
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
                    let endpoint = process.env.RPC_ENDPOINT;
                    if(!endpoint) {
                        endpoint = `https://api.mainnet-beta.solana.com`;
                    }

                    const connection = new web3.Connection(endpoint, {
                        commitment: "processed",
                    });

                    const client = await Client.create(connection);

                    client.addMarket(marketAddress);
                    // console.log("Market > New client initialized");
                    // console.log("Client: ", client);
                }
                else {
                    phxClient = phoenixClient;
                }
                
                let cancelAllIx = phxClient.createCancelAllOrdersWithFreeFundsInstruction(marketAddress, walletState.publicKey);
                let withdrawFundsIx = phxClient.createWithdrawFundsInstruction({
                    withdrawFundsParams: {
                        quoteLotsToWithdraw: null,
                        baseLotsToWithdraw: null
                    }
                }, marketAddress, walletState.publicKey);
                
                transaction.add(cancelAllIx);
                transaction.add(withdrawFundsIx);
                
                updateStatus(<span>{`Waiting for you to sign ⏱...`}</span>);
                let response = await walletState.sendTransaction(transaction, connection, { skipPreflight: true});
                green(<span>{`Transaction confirmed `}<Link href={`https://solscan.io/tx/${response}`} target="_blank">{` ↗️`}</Link></span>, 3_000)
                console.log("Signature: ", response);
              }
              catch(err) {
                console.log(`Error placing cancel all request: ${err}`);
                red(<span>{`Failed: ${err.message}`}</span>, 2_000,);
              }
        }
        setIsCancelAllActionActive(false);
    }

    useEffect(() => {
        const refreshActiveOrdersForTrader = async () => {
            if(walletState.connected && enumeratedMarket && enumeratedMarket.spotGridMarket) {
                let orders: Order[] = [];

                try {
                    let phxClient: Client = null;
                    if(!phoenixClient) {
                        // console.log("Refresh orders > Creating fallback phxClient");
                        let endpoint = process.env.RPC_ENDPOINT;
                        if(!endpoint) {
                            endpoint = `https://api.mainnet-beta.solana.com`;
                        }

                        const connection = new web3.Connection(endpoint, {
                            commitment: "processed",
                        });

                        const client = await Client.create(connection);

                        client.addMarket(enumeratedMarket.spotGridMarket.phoenix_market_address.toString());
                        // console.log("New client initialized");
                        // console.log("Client: ", client);
                    }
                    else {
                        phxClient = phoenixClient;
                    }

                    orders = await getOpenOrdersForTrader(phxClient, enumeratedMarket.spotGridMarket.phoenix_market_address.toString(), walletState.publicKey.toString());
                    // console.log("orders: ", orders);
                }
                catch(err) {
                    console.log(`Error fetching active orders: ${err}`);
                }

                if(orders.length > 0) {
                    setActiveOrdersForTrader(_ => [...orders]);
                    return;
                }
                else {
                    setActiveOrdersForTrader(_ => []);
                }
            }
            else {
                setActiveOrdersForTrader(_ => []);
            }
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
                            <span>{`No active orders`}</span>
                        </div>
                }
            </div>
        </div>
    )
}

export default OrderManager;