import React, { useEffect, useState } from "react";
import styles from "./OrderView.module.css";
import { Order, decimalPlacesFromTickSize, formatNumbersWithCommas, justFormatNumbersWithCommas, toScientificNotation } from "../../../../../../utils";
import { EnumeratedMarketToMetadata } from "../../../../[market]";
import Image from "next/image";
import { useWallet } from "@solana/wallet-adapter-react";
import { useBottomStatus } from "../../../../../../components/BottomStatus";
import { ComputeBudgetProgram, Connection, LAMPORTS_PER_SOL, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import { getPriorityFeeEstimate } from "../../../../../../utils/helius";
import { BN, web3 } from "@coral-xyz/anchor";
import {
  CancelOrderParams,
  Client,
  Side,
  getCreateTokenAccountInstructions,
  sideBeet,
} from "@ellipsis-labs/phoenix-sdk";
import Link from "next/link";
import { WRAPPED_SOL_MAINNET } from "constants/";
import { createCloseAccountInstruction, createSyncNativeInstruction, getAssociatedTokenAddress } from "@solana/spl-token";
import { useRootState } from "components/RootStateContextType";

export interface OrderViewProps {
  enumeratedMarket: EnumeratedMarketToMetadata | null;
  order: Order;
}

const OrderView = ({
  enumeratedMarket,
  order,
}: OrderViewProps) => {
  let { phoenixClient, setPhoenixClient, connection, setConnection } = useRootState();

  const [floatPrice, setFloatPrice] = useState(0);
  const [floatSizeInBaseUnits, setFloatSizeInBaseUnits] = useState(0);
  const [floatTotalSizeInQuoteUnits, setFloatTotalSizeInQuoteUnits] =
    useState(0);
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
        enumeratedMarket.spotGridMarket.phoenix_market_address;

      let priorityFeeLevels = null;

      try {
        priorityFeeLevels = (await getPriorityFeeEstimate([marketAddress]))
          .priorityFeeLevels;
      } catch (err) {
        // console.log(`Error fetching priority fee levels`);
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

          const client = await Client.create(connection);

          client.addMarket(marketAddress);
        } else {
          phxClient = phoenixClient;
          setPhoenixClient(phxClient);
        }

        let baseAtaInitIxs = await getCreateTokenAccountInstructions(
          connection,
          walletState.publicKey,
          walletState.publicKey,
          new web3.PublicKey(enumeratedMarket.baseTokenMetadata.mint),
        );
        let quoteAtaInitIxs = await getCreateTokenAccountInstructions(
          connection,
          walletState.publicKey,
          walletState.publicKey,
          new web3.PublicKey(enumeratedMarket.quoteTokenMetadata.mint),
        );
        for (let ix of baseAtaInitIxs) {
          transaction.add(ix);
        }
        for (let ix of quoteAtaInitIxs) {
          transaction.add(ix);
        }

        let wrapSOLIxs: TransactionInstruction[] = [];
        let unwrapSOLIxs: TransactionInstruction[] = [];

        if(enumeratedMarket) {
          let baseTokenMetadata = enumeratedMarket.baseTokenMetadata;
          let quoteTokenMetadata = enumeratedMarket.quoteTokenMetadata;

          // Add wrap/unwrap SOL ixs here
        if((baseTokenMetadata.mint === WRAPPED_SOL_MAINNET || quoteTokenMetadata.mint === WRAPPED_SOL_MAINNET)) {
          const wSOLAta = await getAssociatedTokenAddress(new web3.PublicKey(WRAPPED_SOL_MAINNET), walletState.publicKey);

          let nativeSOLLamports = await connection.getBalance(
            walletState.publicKey,
          );
          let nativeSOLBalance = nativeSOLLamports / LAMPORTS_PER_SOL;

          let balance = parseInt((nativeSOLBalance * 0.99 * Math.pow(10, 9)).toString());

          let transferIx = SystemProgram.transfer({
            fromPubkey: walletState.publicKey,
            toPubkey: wSOLAta,
            lamports: balance,
          });

          // sync wrapped SOL balance
          let syncNativeIx = createSyncNativeInstruction(wSOLAta);

          wrapSOLIxs.push(transferIx);
          wrapSOLIxs.push(syncNativeIx);

          let withdrawIx = createCloseAccountInstruction(
            wSOLAta,
            walletState.publicKey,
            walletState.publicKey
          );

          unwrapSOLIxs.push(withdrawIx);
        }
        }

        for(let ix of wrapSOLIxs) {
          transaction.add(ix);
        }

        let priceInTicksBN = new BN(phoenixClient.floatPriceToTicks(parseFloat(order.price_in_ticks), marketAddress));
        let orderSequenceNumberBN = new BN(order.order_sequence_number);
        console.log("Order ID: ", orderSequenceNumberBN.toString());

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

        for(let ix of unwrapSOLIxs) {
          transaction.add(ix);
        }

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
        // console.log("Signature: ", response);
      } catch (err) {
        // console.log(`Error placing cancel order request: ${err}`);
        red(<span>{`Failed: ${err.message}`}</span>, 2_000);
      }
    }
    setIsCancelOrderActionActive(false);
  };

  useEffect(() => {
    if (enumeratedMarket) {
      let floatPrice = parseFloat(order.price_in_ticks);
      let floatSizeInBaseUnits = parseFloat(order.size_in_base_lots);
      let floatTotalSizeInQuoteUnits = parseFloat(order.price_in_ticks) * parseFloat(order.size_in_base_lots);
      let fillSizeInBaseUnits = 0;

      setFloatPrice((_) => floatPrice);
      setFloatSizeInBaseUnits((_) => floatSizeInBaseUnits);
      setFloatTotalSizeInQuoteUnits((_) => floatTotalSizeInQuoteUnits);
      setFillSizeInBaseUnits((_) => fillSizeInBaseUnits);
    }
  }, [order, phoenixClient, connection, enumeratedMarket]);

  return (
    <div className={styles.orderViewOuterContainer}>
      <div className={styles.orderViewContainer}>
        <div className={styles.columnNameRow}>
          {order ? (
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
          ) : (
            <></>
          )}
        </div>
        <div className={styles.columnNameRow}>
          <span className={styles.columnName}>{enumeratedMarket ? decimalPlacesFromTickSize(enumeratedMarket.spotGridMarket.tick_size) >=5 ? toScientificNotation(floatPrice) : floatPrice.toFixed(decimalPlacesFromTickSize(enumeratedMarket ? enumeratedMarket.spotGridMarket.tick_size : `0.001`)) : floatPrice}</span>
        </div>
        <div className={styles.columnNameRow}>
          <span className={styles.columnName}>
            {justFormatNumbersWithCommas(floatSizeInBaseUnits.toFixed(2))}
          </span>
        </div>
        <div className={styles.columnNameRow}>
          <span className={styles.columnName}>
            {floatTotalSizeInQuoteUnits.toFixed(4)}
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
