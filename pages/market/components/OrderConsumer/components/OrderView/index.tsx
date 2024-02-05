import React, { useEffect, useState } from "react";
import styles from "./OrderView.module.css";
import { Order } from "../../../../../../utils";
import { EnumeratedMarketToMetadata } from "../../../../[market]";
import Image from "next/image";
import { useWallet } from "@solana/wallet-adapter-react";
import { useBottomStatus } from "../../../../../../components/BottomStatus";
import { ComputeBudgetProgram, Connection } from "@solana/web3.js";
import { getPriorityFeeEstimate } from "../../../../../../utils/helius";
import { BN, web3 } from "@coral-xyz/anchor";
import {
  CancelOrderParams,
  Client,
  Side,
  sideBeet,
} from "@ellipsis-labs/phoenix-sdk";
import Link from "next/link";

export interface OrderViewProps {
  enumeratedMarket: EnumeratedMarketToMetadata | null;
  order: Order;
  phoenixClient: Client;
  connection: Connection;
}

const OrderView = ({
  enumeratedMarket,
  order,
  phoenixClient,
  connection
}: OrderViewProps) => {
  const [floatPrice, setFloatPrice] = useState(0);
  const [floatSizeInBaseUnits, setFloatSizeInBaseUnits] = useState(0);
  const [floatTotalSizeInQuoteUnits, setFloatTotalSizeInQuoteUnits] = useState(0);
  const [fillSizeInBaseUnits, setFillSizeInBaseUnits] = useState(0);

  const [isCancelOrderActionActive, setIsCancelOrderActionActive] =
    useState(false);

  const walletState = useWallet();
  const { updateStatus, green, red } = useBottomStatus();

  const handleCancelOrderAction = async () => {
    setIsCancelOrderActionActive((_) => true);

    if (
      enumeratedMarket &&
      enumeratedMarket.spotGridMarket &&
      walletState.connected
    ) {
      let marketAddress =
        enumeratedMarket.spotGridMarket.phoenix_market_address.toString();

      let priorityFeeLevels = null;

      try {
        priorityFeeLevels = (await getPriorityFeeEstimate([marketAddress]))
          .priorityFeeLevels;
      } catch (err) {
        console.log(`Error fetching priority fee levels`);
      }

      try {
        updateStatus(<span>{`Preparing cancel all transaction...`}</span>);
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
        } else {
          phxClient = phoenixClient;
        }

        let priceInTicksBN = new BN(order.price_in_ticks.toString());
        let orderSequenceNumberBN = new BN(
          order.order_sequence_number.toString(),
        );

        let cancelOrderIx = phxClient.createCancelMultipleOrdersByIdInstruction(
          {
            params: {
              orders: [
                {
                  side: order.is_buy_order ? Side.Bid : Side.Ask,
                  priceInTicks: priceInTicksBN,
                  orderSequenceNumber: orderSequenceNumberBN,
                } as CancelOrderParams,
              ],
            },
          },
          marketAddress,
          walletState.publicKey,
        );
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

        transaction.add(cancelOrderIx);
        transaction.add(withdrawFundsIx);

        updateStatus(<span>{`Waiting for you to sign ⏱...`}</span>);
        let response = await walletState.sendTransaction(
          transaction,
          connection,
          { skipPreflight: true },
        );
        green(
          <span>
            {`Order canceled `}
            <Link
              href={`https://solscan.io/tx/${response}`}
              target="_blank"
            >{` ↗️`}</Link>
          </span>,
          3_000,
        );
        console.log("Signature: ", response);
      } catch (err) {
        console.log(`Error placing cancel order request: ${err}`);
        red(<span>{`Failed: ${err.message}`}</span>, 2_000);
      }
    }
    setIsCancelOrderActionActive(false);
  };

  useEffect(() => {
    if(enumeratedMarket) {
      let floatPrice = phoenixClient.ticksToFloatPrice(parseInt(order.price_in_ticks.toString()), enumeratedMarket.spotGridMarket.phoenix_market_address.toString());
      let floatSizeInBaseUnits = phoenixClient.baseLotsToBaseAtoms(parseInt(order.size_in_base_lots.toString()), enumeratedMarket.spotGridMarket.phoenix_market_address.toString()) / Math.pow(10, enumeratedMarket.baseTokenMetadata.decimals);
      let floatTotalSizeInQuoteUnits = floatPrice * floatSizeInBaseUnits;
      let fillSizeInBaseUnits =  phoenixClient.baseLotsToBaseAtoms(parseInt(order.fill_size_in_base_lots.toString()), enumeratedMarket.spotGridMarket.phoenix_market_address.toString()) / Math.pow(10, enumeratedMarket.baseTokenMetadata.decimals);

      setFloatPrice(_ => floatPrice);
      setFloatSizeInBaseUnits(_ => floatSizeInBaseUnits);
      setFloatTotalSizeInQuoteUnits(_ => floatTotalSizeInQuoteUnits);
      setFillSizeInBaseUnits(_ => fillSizeInBaseUnits);
    }
  }, [order, phoenixClient, connection]);

  return (
    <div className={styles.orderViewOuterContainer}>
      <div className={styles.orderViewContainer}>
        <div className={styles.columnNameRow}>
          <span
            style={{
              color: order.is_buy_order ? `#3DE383` : `#e33d3d`,
            }}
          >
            {order ? (
              order.is_buy_order ? (
                <span>{`BUY`}</span>
              ) : (
                <span>{`SELL`}</span>
              )
            ) : (
              <></>
            )}
          </span>
        </div>
        <div className={styles.columnNameRow}>
          <span className={styles.columnName}>
            {floatPrice.toFixed(4)}
          </span>
        </div>
        <div className={styles.columnNameRow}>
          <span className={styles.columnName}>
            {floatSizeInBaseUnits.toFixed(4)}
          </span>
        </div>
        <div className={styles.columnNameRow}>
          <span className={styles.columnName}>
            {floatTotalSizeInQuoteUnits.toFixed(4)}
          </span>
        </div>
        <div className={styles.columnNameRow}>
          <span className={styles.columnName}>
            {fillSizeInBaseUnits.toFixed(4)}
          </span>
        </div>
        <div className={styles.columnNameRow}>
          <div
            className={styles.cancelOrderButton}
            onClick={() => {
              handleCancelOrderAction();
            }}
          >
            <span>
              {isCancelOrderActionActive ? (
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
                <i className="fa-solid fa-power-off"></i>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderView;
