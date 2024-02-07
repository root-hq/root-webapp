import React, { useEffect, useState } from "react";
import styles from "./OrderManager.module.css";
import {
  Order,
  TokenMetadata,
  getOpenOrdersForTrader,
  getTraderState,
} from "../../../../../../utils";
import { ACTIVE_ORDERS_REFRESH_FREQUENCY_IN_MS, ManagerView, WRAPPED_SOL_MAINNET, getAllManagerView, getManagerViewText } from "../../../../../../constants";
import { useWallet } from "@solana/wallet-adapter-react";

const OrderView = dynamic(() => import("../OrderView"), { ssr: false });

import { EnumeratedMarketToMetadata } from "../../../../[market]";
import { getPriorityFeeEstimate } from "../../../../../../utils/helius";
import { web3 } from "@coral-xyz/anchor";
import { ComputeBudgetProgram, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Client } from "@ellipsis-labs/phoenix-sdk";
import { useBottomStatus } from "../../../../../../components/BottomStatus";
import dynamic from "next/dynamic";
import Link from "next/link";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import FundView from "./FundView";

export interface OrderManagerProps {
  enumeratedMarket: EnumeratedMarketToMetadata;
  baseTokenMetadata: TokenMetadata;
  quoteTokenMetadata: TokenMetadata;
  phoenixClient: Client;
  connection: Connection;
}

export interface UserGlobalBalances {
  baseWalletBalance: number;
  quoteWalletBalance: number;
  baseActiveOrdersBalance: number;
  quoteActiveOrdersBalance: number;
  baseWithdrawableBalance: number;
  quoteWithdrawableBalance: number;
}

const OrderManager = ({
  enumeratedMarket,
  baseTokenMetadata,
  quoteTokenMetadata,
  phoenixClient,
  connection
}: OrderManagerProps) => {
  const [isCancelAllActionActive, setIsCancelAllActionActive] = useState(false);
  let [activeOrdersForTrader, setActiveOrdersForTrader] = useState<Order[]>([]);
  let [activeManagerView, setActiveManagerView] = useState<ManagerView>(ManagerView.OpenOrders);

  let [userGlobalBalances, setUserGlobalBalances] = useState<UserGlobalBalances>({
    baseWalletBalance: 0,
    quoteWalletBalance: 0,
    baseActiveOrdersBalance: 0,
    quoteActiveOrdersBalance: 0,
    baseWithdrawableBalance: 0,
    quoteWithdrawableBalance: 0
  } as UserGlobalBalances);

  const walletState = useWallet();
  const { updateStatus, green, red } = useBottomStatus();

  const handleCancelAllAction = async () => {
    setIsCancelAllActionActive(true);

    if (
      enumeratedMarket &&
      enumeratedMarket.spotGridMarket &&
      walletState.connected
    ) {
      let marketAddress =
        enumeratedMarket.spotGridMarket.phoenix_market_address;

      let priorityFeeLevels = null;

      try {
        priorityFeeLevels = (await getPriorityFeeEstimate([marketAddress]))
          .priorityFeeLevels;
      } catch (err) {
        console.log(`Error fetching priority fee levels`);
      }

      if(activeManagerView === ManagerView.OpenOrders) {
        updateStatus(<span>{`Preparing cancel all transaction...`}</span>);
      }
      else {
        updateStatus(<span>{`Preparing withdraw all funds transaction...`}</span>);
      }
        let transaction = new web3.Transaction();

        // Create the priority fee instructions
        let unitsPrice = 10;
        if (priorityFeeLevels) {
          unitsPrice = priorityFeeLevels["high"];
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
        if (!phoenixClient) {
          let endpoint = process.env.RPC_ENDPOINT;
          if (!endpoint) {
            endpoint = `https://api.mainnet-beta.solana.com`;
          }

          const connection = new web3.Connection(endpoint, {
            commitment: "processed",
          });

          const client = await Client.create(connection);

          client.addMarket(marketAddress);
          // console.log("Market > New client initialized");
          // console.log("Client: ", client);
        } else {
          phxClient = phoenixClient;
        }

      try {
        if(activeManagerView === ManagerView.OpenOrders) {
          let cancelAllIx =
          phxClient.createCancelAllOrdersWithFreeFundsInstruction(
            marketAddress,
            walletState.publicKey,
          );
          transaction.add(cancelAllIx);
        }

        if(activeManagerView === ManagerView.Funds) {
          let withdrawFundsIx = phxClient.createWithdrawFundsInstruction(
            {
              withdrawFundsParams: {
                quoteLotsToWithdraw: null,
                baseLotsToWithdraw: null,
              },
            },
            marketAddress,
            walletState.publicKey,
          );
          transaction.add(withdrawFundsIx);  
        }
        
        updateStatus(<span>{`Waiting for you to sign ⏱...`}</span>);
        let response = await walletState.sendTransaction(
          transaction,
          connection,
          { skipPreflight: true },
        );
        green(
          <span>
            {`Transaction confirmed `}
            <Link
              href={`https://solscan.io/tx/${response}`}
              target="_blank"
            >{` ↗️`}</Link>
          </span>,
          3_000,
        );
        console.log("Signature: ", response);
      } catch (err) {
        console.log(`Error placing cancel all request: ${err}`);
        red(<span>{`Failed: ${err.message}`}</span>, 2_000);
      }
    }
    setIsCancelAllActionActive(false);
  };

  const handleManagerViewChange = (newView: ManagerView) => {
    setActiveManagerView(_ => newView);
  }

  useEffect(() => {
    const refreshActiveOrdersForTrader = async () => {
      if (
        walletState.connected &&
        enumeratedMarket &&
        enumeratedMarket.spotGridMarket
      ) {
        let orders: Order[] = [];

        try {
          let phxClient: Client = null;
          if (!phoenixClient) {
            // console.log("Refresh orders > Creating fallback phxClient");
            let endpoint = process.env.RPC_ENDPOINT;
            if (!endpoint) {
              endpoint = `https://api.mainnet-beta.solana.com`;
            }

            const connection = new web3.Connection(endpoint, {
              commitment: "processed",
            });

            const client = await Client.create(connection);

            client.addMarket(
              enumeratedMarket.spotGridMarket.phoenix_market_address,
            );
            // console.log("New client initialized");
            // console.log("Client: ", client);
          } else {
            phxClient = phoenixClient;
          }

          orders = await getOpenOrdersForTrader(
            phxClient,
            enumeratedMarket.spotGridMarket.phoenix_market_address,
            walletState.publicKey.toString(),
          );
          // console.log("orders: ", orders);
        } catch (err) {
          console.log(`Error fetching active orders: ${err}`);
        }

        if (orders.length > 0) {
          setActiveOrdersForTrader((_) => [...orders]);
          return;
        } else {
          setActiveOrdersForTrader((_) => []);
        }
      } else {
        setActiveOrdersForTrader((_) => []);
      }
    };

    refreshActiveOrdersForTrader();

    const intervalId = setInterval(() => {
      refreshActiveOrdersForTrader();
    }, ACTIVE_ORDERS_REFRESH_FREQUENCY_IN_MS);

    return () => clearInterval(intervalId);
  }, [walletState, enumeratedMarket]);

  useEffect(() => {
    const fetchUserGlobalBalances = async () => {
      if(walletState.connected) {
        console.log("Fetching new balances: ");
        let userState = await getTraderState(phoenixClient, enumeratedMarket.spotGridMarket.phoenix_market_address, walletState.publicKey.toString());

        userState.baseActiveOrdersBalance /= Math.pow(10, enumeratedMarket.baseTokenMetadata.decimals);
        userState.baseWithdrawableBalance /= Math.pow(10, enumeratedMarket.baseTokenMetadata.decimals);
        userState.quoteActiveOrdersBalance /= Math.pow(10, enumeratedMarket.quoteTokenMetadata.decimals);
        userState.quoteWithdrawableBalance /= Math.pow(10, enumeratedMarket.quoteTokenMetadata.decimals);

        const baseTokenAddress = await getAssociatedTokenAddress(
          new web3.PublicKey(baseTokenMetadata.mint),
          walletState.publicKey,
        );
        const quoteTokenAddress = await getAssociatedTokenAddress(
          new web3.PublicKey(quoteTokenMetadata.mint),
          walletState.publicKey
        );

        let baseBalance = 0;
        try {
          baseBalance = (
            await connection.getTokenAccountBalance(baseTokenAddress)
          ).value.uiAmount;
        } catch (Err) {
          console.log(`Error fetching base ata balance`);
          baseBalance = 0;
        }

        let quoteBalance = 0;
        try {
          quoteBalance = (
            await connection.getTokenAccountBalance(quoteTokenAddress)
          ).value.uiAmount;
        } catch (err) {
          console.log(`Error fetching quote ata balance`);
          quoteBalance = 0;
        }

        let nativeSOLLamports = await connection.getBalance(walletState.publicKey);
        let nativeSOLBalance = nativeSOLLamports / LAMPORTS_PER_SOL;

        if(enumeratedMarket.baseTokenMetadata.mint === WRAPPED_SOL_MAINNET) {
          baseBalance += nativeSOLBalance;
        }
        else if(enumeratedMarket.quoteTokenMetadata.mint === WRAPPED_SOL_MAINNET) {
          quoteBalance += nativeSOLBalance;
        }

        userState.baseWalletBalance = baseBalance;
        userState.quoteWalletBalance = quoteBalance;

        console.log("Setting balances: ", userState);
        setUserGlobalBalances(_ => userState);
      }
    }

    fetchUserGlobalBalances();
  }, [walletState, enumeratedMarket])

  return (
    <div className={styles.orderManagerContainer}>
      <div className={styles.topMenuContainer}>
        <div className={styles.managerViewSelectorContainer}>
          <div className={styles.managerViewOption}
            onClick={() => {
              handleManagerViewChange(ManagerView.OpenOrders)
            }}
            style={{
              color: activeManagerView === ManagerView.OpenOrders ? `#eee` : ``
            }}
          >
            <span className={styles.orderTitleContainer}>Active orders</span>
          </div>
          <div className={styles.managerViewOption}
            onClick={() => {
              handleManagerViewChange(ManagerView.Funds)
            }}
            style={{
              color: activeManagerView === ManagerView.Funds ? `#eee` : ``
            }}
          >
            <span className={styles.orderTitleContainer}>Your funds</span>
          </div>
        </div>
        <div className={styles.topMenuButtonContainer}>
          <div
            className={styles.cancelAllButtonContainer}
            onClick={() => {
              handleCancelAllAction();
            }}
          >
            {
              activeManagerView === ManagerView.OpenOrders ?
                <button className={styles.cancelAllButton}>
                  {isCancelAllActionActive ? (
                    <div className={styles.spinnerBox}>
                      <div
                        className={styles.threeQuarterSpinner}
                        style={{
                          border: `3px solid #e33d3d`,
                          borderTop: `3px solid transparent`,
                        }}
                      ></div>
                    </div>
                  ) : (
                    <>Cancel All</>
                  )}
                </button>
              :
                <button className={styles.cancelAllButton}>
                  {isCancelAllActionActive ? (
                    <div className={styles.spinnerBox}>
                      <div
                        className={styles.threeQuarterSpinner}
                        style={{
                          border: `3px solid #e33d3d`,
                          borderTop: `3px solid transparent`,
                        }}
                      ></div>
                    </div>
                  ) : (
                    <>Withdraw All</>
                  )}
                </button>
            }
          </div>
        </div>
      </div>
      <div className={styles.columnNamesOuterContainer}>
        {
          activeManagerView === ManagerView.OpenOrders ?
            <div className={styles.columnNamesContainer}>
              <div className={styles.columnNameRow} style={{width: `${100 / 6}%`}}>
                <span className={styles.columnName}>{`Side`}</span>
              </div>
              <div className={styles.columnNameRow} style={{width: `${100 / 6}%`}}>
                <span className={styles.columnName}>{`Price`}</span>
              </div>
              <div className={styles.columnNameRow} style={{width: `${100 / 6}%`}}>
                <span className={styles.columnName}>{`Size`}</span>
              </div>
              <div className={styles.columnNameRow} style={{width: `${100 / 6}%`}}>
                <span className={styles.columnName}>{`Total`}</span>
              </div>
              <div className={styles.columnNameRow} style={{width: `${100 / 6}%`}}>
                <span className={styles.columnName}>{`Filled`}</span>
              </div>
              <div className={styles.columnNameRow} style={{width: `${100 / 6}%`}}>
                <span className={styles.columnName}>{``}</span>
              </div>
            </div>
          :
            <div className={styles.columnNamesContainer}>
              <div className={styles.columnNameRow} style={{width: `${100 / 5}%`}}>
                <span className={styles.columnName}>{`Token`}</span>
              </div>
              <div className={styles.columnNameRow} style={{width: `${100 / 5}%`}}>
                <span className={styles.columnName}>{`Wallet`}</span>
              </div>
              <div className={styles.columnNameRow} style={{width: `${100 / 5}%`}}>
                <span className={styles.columnName}>{`Active orders`}</span>
              </div>
              <div className={styles.columnNameRow} style={{width: `${100 / 5}%`}}>
                <span className={styles.columnName}>{`Withdrawable`}</span>
              </div>
              <div className={styles.columnNameRow} style={{width: `${100 / 5}%`}}>
                <span className={styles.columnName}>{`Total`}</span>
              </div>
            </div>
        }
      </div>
      <div className={styles.managerViewContainer}>
        {
          activeManagerView === ManagerView.OpenOrders ?
            <div className={styles.ordersDisplayContainer}>
              {walletState && activeOrdersForTrader.length > 0 ? (
                <div className={styles.allOrderViewsContainer}>
                  {activeOrdersForTrader.map((order, index) => {
                    if (order) {
                      return (
                        <div
                          key={parseInt(order.order_sequence_number)}
                          className={styles.orderViewContainer}
                        >
                          <OrderView
                            order={order}
                            enumeratedMarket={enumeratedMarket}
                            phoenixClient={phoenixClient}
                            connection={connection}
                          />
                        </div>
                      );
                    } else {
                      return <></>;
                    }
                  })}
                </div>
              ) : (
                <div className={styles.noOrderViewContainer}>
                  <span>{`No active orders`}</span>
                </div>
              )}
            </div>
          :
            <div className={styles.ordersDisplayContainer}>
              {walletState.connected ? (
                <div className={styles.allOrderViewsContainer}>
                  <div
                    className={styles.orderViewContainer}
                  >
                    <FundView
                      tokenMetadata={baseTokenMetadata}
                      walletBalance={userGlobalBalances.baseWalletBalance}
                      activeOrdersBalance={userGlobalBalances.baseActiveOrdersBalance}
                      withdrawableBalance={userGlobalBalances.baseWithdrawableBalance}
                    />
                  </div>
                  <div
                    className={styles.orderViewContainer}
                  >
                    <FundView
                      tokenMetadata={quoteTokenMetadata}
                      walletBalance={userGlobalBalances.quoteWalletBalance}
                      activeOrdersBalance={userGlobalBalances.quoteActiveOrdersBalance}
                      withdrawableBalance={userGlobalBalances.quoteWithdrawableBalance}
                    />
                  </div>
              </div>
              ) : (
                <div className={styles.noOrderViewContainer}>
                  <span>{`Connect a wallet to see balances`}</span>
                </div>
              )}
            </div>
        }
      </div>
    </div>
  );
};

export default OrderManager;
