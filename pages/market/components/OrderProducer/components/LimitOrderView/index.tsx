import React, { useEffect, useState } from "react";
import styles from "./LimitOrderView.module.css";
import { useWallet } from "@solana/wallet-adapter-react";
import { useBottomStatus } from "components/BottomStatus";
import {
  PhoenixMarket,
  TokenMetadata,
  decimalPlacesFromTickSize,
  formatNumbersWithCommas,
  justFormatNumbersWithCommas,
  removeCommas,
} from "utils";
import { Button, Form } from "react-bootstrap";
import {
  MAX_BPS,
  ROOT_PROTOCOL_FEE_BPS,
  ROOT_PROTOCOL_LAMPORT_COLLECTOR,
  WRAPPED_SOL_MAINNET,
} from "constants/";
import KeyValueComponent, {
  KeyValueJustification,
} from "components/KeyValueComponent";
import Link from "next/link";
import { getPriorityFeeEstimate } from "utils/helius";
import { BN, web3 } from "@coral-xyz/anchor";
import {
  ComputeBudgetProgram,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  OrderPacket,
  SelfTradeBehavior,
  Side,
  getClaimSeatIx,
  getCreateTokenAccountInstructions,
} from "@ellipsis-labs/phoenix-sdk";
import {
  createCloseAccountInstruction,
  createSyncNativeInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { useRootState } from "components/RootStateContextType";

export interface LimitOrderViewProps {
  phoenixMarket: PhoenixMarket;
  baseTokenMetadata: TokenMetadata;
  quoteTokenMetadata: TokenMetadata;
  isBuyOrder: boolean;
  baseTokenBalance: number;
  quoteTokenBalance: number;
  nativeSOLBalance: number;
  resetFieldsSignal: number;
}

const LimitOrderView = ({
  phoenixMarket,
  baseTokenMetadata,
  quoteTokenMetadata,
  isBuyOrder,
  baseTokenBalance,
  quoteTokenBalance,
  nativeSOLBalance,
  resetFieldsSignal,
}: LimitOrderViewProps) => {
  const [limitPrice, setLimitPrice] = useState("");
  const [sendUptoSize, setSendUptoSize] = useState("");
  const [receiveUptoSize, setReceiveUptoSize] = useState("");
  const [isPlaceOrderButtonLoading, setIsPlaceOrderButtonLoading] =
    useState(false);

  const walletState = useWallet();
  const { updateStatus, green, red, resetStatus } = useBottomStatus();
  let { phoenixClient, connection } = useRootState();

  useEffect(() => {
    if (receiveUptoSize) {
      // console.log("Receive upto size: ", receiveUptoSize);
      updateStatus(
        <div>
          <span
            style={{ color: `#3DE383` }}
          >{`+ ${isBuyOrder ? sendUptoSize : receiveUptoSize} ${isBuyOrder ? baseTokenMetadata.ticker : quoteTokenMetadata.ticker}`}</span>
          <span
            style={{ color: `#e33d3d`, marginLeft: `1rem` }}
          >{`- ${isBuyOrder ? receiveUptoSize : sendUptoSize} ${isBuyOrder ? quoteTokenMetadata.ticker : baseTokenMetadata.ticker}`}</span>
        </div>,
      );
    } else {
      // resetStatus();
    }
  }, [receiveUptoSize]);

  const handleResetAllFields = () => {
    setLimitPrice("");
    setSendUptoSize("");
    setReceiveUptoSize("");
    // resetStatus();
  };

  useEffect(() => {
    handleResetAllFields();
  }, [resetFieldsSignal]);

  const handleLimitPriceChange = (e) => {
    e.preventDefault();

    if (sendUptoSize === undefined || e.target.value === ``) {
      setReceiveUptoSize((_) => ``);
    }

    let sendUptoSizeFloat = 0.0;
    if (sendUptoSize) {
      sendUptoSizeFloat = parseFloat(sendUptoSize);
    }

    const limitPrice = removeCommas(e.target.value);

    let limitPriceFloat = parseFloat(limitPrice);

    if (limitPriceFloat && sendUptoSizeFloat) {
      let takerFeeBps = parseFloat(phoenixMarket.taker_fee_bps);

      if (isBuyOrder) {
        let receivingAmount = sendUptoSizeFloat * limitPriceFloat;
        let amountPostFee =
          receivingAmount * ((MAX_BPS + takerFeeBps) / MAX_BPS);

        formatNumbersWithCommas(
          amountPostFee.toFixed(baseTokenMetadata.decimals),
          setReceiveUptoSize,
        );
      } else {
        let receivingAmount = sendUptoSizeFloat * limitPriceFloat;
        let amountPostFee =
          receivingAmount * ((MAX_BPS - takerFeeBps) / MAX_BPS);

        formatNumbersWithCommas(
          amountPostFee.toFixed(quoteTokenMetadata.decimals),
          setReceiveUptoSize,
        );
      }
    }

    formatNumbersWithCommas(limitPrice, setLimitPrice);
  };

  const handleSendUptoSizeChange = (e?: any, size?: any) => {
    if (e) {
      e.preventDefault();
    }

    if (size === undefined || limitPrice === undefined) {
      setReceiveUptoSize((_) => ``);
    }

    let sendUptoSize;

    if (size) {
      sendUptoSize = size;
    } else {
      sendUptoSize = removeCommas(e.target.value);
    }

    let sendUptoSizeFloat = parseFloat(sendUptoSize);

    formatNumbersWithCommas(sendUptoSize, setSendUptoSize);

    let limitPriceFloat = 0.0;
    if (limitPrice) {
      limitPriceFloat = parseFloat(limitPrice);
    }

    if (limitPriceFloat && sendUptoSizeFloat) {
      let takerFeeBps = parseFloat(phoenixMarket.taker_fee_bps);

      if (isBuyOrder) {
        let receivingAmount =
          parseFloat(removeCommas(sendUptoSize)) *
          parseFloat(removeCommas(limitPrice));
        let amountPostFee =
          receivingAmount * ((MAX_BPS + takerFeeBps) / MAX_BPS);

        formatNumbersWithCommas(
          amountPostFee.toFixed(baseTokenMetadata.decimals),
          setReceiveUptoSize,
        );
      } else {
        let receivingAmount =
          parseFloat(removeCommas(sendUptoSize)) *
          parseFloat(removeCommas(limitPrice));
        let amountPostFee =
          receivingAmount * ((MAX_BPS - takerFeeBps) / MAX_BPS);

        formatNumbersWithCommas(
          amountPostFee.toFixed(quoteTokenMetadata.decimals),
          setReceiveUptoSize,
        );
      }
    }
  };

  const handlePlaceLimitOrderAction = async () => {
    setIsPlaceOrderButtonLoading((_) => true);
    let marketAddress = phoenixMarket.phoenix_market_address;

    if (limitPrice && sendUptoSize) {
      let priorityFeeLevels = null;

      try {
        priorityFeeLevels = (await getPriorityFeeEstimate([marketAddress]))
          .priorityFeeLevels;
      } catch (err) {
        // console.log(`Error fetching priority fee levels`);
      }

      updateStatus(<span>{`Preparing limit order transaction...`}</span>);
      let transaction = new web3.Transaction();

      // Create the priority fee instructions
      let unitsPrice = 10;
      if (priorityFeeLevels) {
        unitsPrice = priorityFeeLevels["veryHigh"];
      }

      const computePriceIx = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: parseInt(unitsPrice.toString()),
      });

      const computeLimitIx = ComputeBudgetProgram.setComputeUnitLimit({
        units: 200_000,
      });
      transaction.add(computePriceIx);
      transaction.add(computeLimitIx);

      transaction.add(
        getClaimSeatIx(
          new web3.PublicKey(marketAddress),
          walletState.publicKey,
        ),
      );

      let baseAtaInitIxs = await getCreateTokenAccountInstructions(
        connection,
        walletState.publicKey,
        walletState.publicKey,
        new web3.PublicKey(baseTokenMetadata.mint),
      );
      let quoteAtaInitIxs = await getCreateTokenAccountInstructions(
        connection,
        walletState.publicKey,
        walletState.publicKey,
        new web3.PublicKey(quoteTokenMetadata.mint),
      );
      for (let ix of baseAtaInitIxs) {
        transaction.add(ix);
      }
      for (let ix of quoteAtaInitIxs) {
        transaction.add(ix);
      }

      let wrapSOLIxs: TransactionInstruction[] = [];
      let unwrapSOLIxs: TransactionInstruction[] = [];

      // Add wrap/unwrap SOL ixs here
      if (
        (isBuyOrder && quoteTokenMetadata.mint === WRAPPED_SOL_MAINNET) ||
        (!isBuyOrder && baseTokenMetadata.mint === WRAPPED_SOL_MAINNET)
      ) {
        const wSOLAta = await getAssociatedTokenAddress(
          new web3.PublicKey(WRAPPED_SOL_MAINNET),
          walletState.publicKey,
        );

        let balance = parseInt(
          (nativeSOLBalance * 0.99 * Math.pow(10, 9)).toString(),
        );

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
          walletState.publicKey,
        );

        unwrapSOLIxs.push(withdrawIx);
      }

      for (let ix of wrapSOLIxs) {
        transaction.add(ix);
      }

      if (isBuyOrder && parseFloat(removeCommas(sendUptoSize))) {
        // console.log("Limit buy");
        let priceInTicks = new BN(
          phoenixClient.floatPriceToTicks(
            parseFloat(limitPrice),
            marketAddress,
          ),
        );
        let sizeInBaseLosts = new BN(
          phoenixClient.baseAtomsToBaseLots(
            parseFloat(removeCommas(sendUptoSize)) *
              Math.pow(10, baseTokenMetadata.decimals),
            marketAddress,
          ),
        );
        // console.log(`Buying ${sizeInBaseLosts} base lots at ${priceInTicks} price in ticks`);

        try {
          let orderPacket = {
            __kind: "Limit",
            side: Side.Bid,
            priceInTicks,
            numBaseLots: sizeInBaseLosts,
            selfTradeBehavior: SelfTradeBehavior.Abort,
            useOnlyDepositedFunds: false,
            failSilentlyOnInsufficientFunds: false,
            matchLimit: null,
            lastValidSlot: null,
            lastValidUnixTimestampInSeconds: null,
            clientOrderId: new BN(1234),
          } as OrderPacket;

          let ix = phoenixClient.createPlaceLimitOrderInstruction(
            orderPacket,
            marketAddress,
            walletState.publicKey,
          );
          transaction.add(ix);

          for (let ix of unwrapSOLIxs) {
            transaction.add(ix);
          }

          // Transfer 1 lamports to Root Multisig for future referencing purposes
          const transferIx = SystemProgram.transfer({
            fromPubkey: walletState.publicKey,
            toPubkey: new web3.PublicKey(ROOT_PROTOCOL_LAMPORT_COLLECTOR),
            lamports: new BN(1),
          });
          transaction.add(transferIx);

          updateStatus(<span>{`Awaiting confirmation ⏱...`}</span>);
          let response = await walletState.sendTransaction(
            transaction,
            connection,
            {
              skipPreflight: true,
            },
          );
          green(
            <span>
              {`Order placed `}
              <Link
                href={`https://solscan.io/tx/${response}`}
                target="_blank"
              >{` ↗️`}</Link>
            </span>,
            3_000,
          );
          // console.log("Signature: ", response);
        } catch (err) {
          // console.log(`Error sending limit buy order: ${err.message}`);
          red(<span>{`Failed: ${err.message}`}</span>, 2_000);
        }
      } else if (!isBuyOrder && parseFloat(removeCommas(sendUptoSize))) {
        let priceInTicks = new BN(
          phoenixClient.floatPriceToTicks(
            parseFloat(removeCommas(limitPrice)),
            marketAddress,
          ),
        );
        let sizeInBaseLosts = new BN(
          phoenixClient.baseAtomsToBaseLots(
            parseFloat(removeCommas(sendUptoSize)) *
              Math.pow(10, baseTokenMetadata.decimals),
            marketAddress,
          ),
        );
        // console.log(`Selling ${sizeInBaseLosts} base lots at ${priceInTicks} price in ticks`);

        try {
          let orderPacket = {
            __kind: "Limit",
            side: Side.Ask,
            priceInTicks,
            numBaseLots: sizeInBaseLosts,
            selfTradeBehavior: SelfTradeBehavior.Abort,
            useOnlyDepositedFunds: false,
            failSilentlyOnInsufficientFunds: false,
            matchLimit: null,
            lastValidSlot: null,
            lastValidUnixTimestampInSeconds: null,
            clientOrderId: new BN(1234),
          } as OrderPacket;
          let ix = phoenixClient.createPlaceLimitOrderInstruction(
            orderPacket,
            marketAddress,
            walletState.publicKey,
          );
          transaction.add(ix);

          for (let ix of unwrapSOLIxs) {
            transaction.add(ix);
          }

          // Transfer 1 lamports to Root Multisig for future referencing purposes
          const transferIx = SystemProgram.transfer({
            fromPubkey: walletState.publicKey,
            toPubkey: new web3.PublicKey(ROOT_PROTOCOL_LAMPORT_COLLECTOR),
            lamports: new BN(1),
          });
          transaction.add(transferIx);

          updateStatus(<span>{`Awaiting confirmation ⏱...`}</span>);
          let response = await walletState.sendTransaction(
            transaction,
            connection,
          );
          green(
            <span>
              {`Order placed `}
              <Link
                href={`https://solscan.io/tx/${response}`}
                target="_blank"
              >{` ↗️`}</Link>
            </span>,
            3_000,
          );
          // console.log("Signature: ", response);
        } catch (err) {
          // console.log(`Error sending limit sell order: ${err}`);
          red(<span>{`Failed: ${err.message}`}</span>, 2_000);
        }
        handleResetAllFields();
      }
    }

    setIsPlaceOrderButtonLoading((_) => false);
  };

  return (
    <div className={styles.limitOrderViewContainer}>
      <Form>
        <Form.Group controlId="formInput" className={styles.formGroupContainer}>
          <div className={styles.formLabelAndFieldContainerNoBottomMargin}>
            <Form.Label className={styles.formLabelContainer}>
              <span>Limit price</span>
            </Form.Label>
            <Form.Control
              placeholder={
                phoenixMarket
                  ? decimalPlacesFromTickSize(phoenixMarket.tick_size) >= 5
                    ? `0.0001`
                    : phoenixMarket.tick_size
                  : ``
              }
              // disabled={!walletState.connected}
              style={{
                backgroundColor: "transparent",
                fontSize: "1.1rem",
                fontWeight: "bold",
                textAlign: "right",
                color: "#ddd",
                border: "none",
                caretColor: "#ddd",
                padding: "1rem",
              }}
              min="0"
              step="0.01" // Allow any decimal value
              className={styles.formFieldContainer}
              onChange={(e) => handleLimitPriceChange(e)}
              value={limitPrice} // Use inputText instead of inputAmount to show the decimal value
            />
          </div>
        </Form.Group>
        <Form.Group controlId="formInput" className={styles.formGroupContainer}>
          <div className={styles.formLabelAndFieldContainerNoBottomMargin}>
            <Form.Label className={styles.formLabelContainer}>
              <span className={styles.fieldTitleContainer}>
                <span>
                  Size{" "}
                  {`(${baseTokenMetadata ? baseTokenMetadata.ticker : ``})`}
                </span>
              </span>
            </Form.Label>
            <Form.Control
              placeholder={`${phoenixMarket ? (decimalPlacesFromTickSize(phoenixMarket.tick_size) >= 5 ? `0.0001` : phoenixMarket.tick_size) : ``} ${baseTokenMetadata ? baseTokenMetadata.ticker : ""}`}
              // disabled={!walletState.connected}
              style={{
                backgroundColor: "transparent",
                fontSize: "1.1rem",
                fontWeight: "bold",
                textAlign: "right",
                color: "#ddd",
                border: "none",
                caretColor: "#ddd",
                padding: "1rem",
              }}
              min="0"
              step="0.01" // Allow any decimal value
              className={styles.formFieldContainer}
              onChange={(e) => handleSendUptoSizeChange(e)}
              value={sendUptoSize} // Use inputText instead of inputAmount to show the decimal value
            />
          </div>
          <div className={styles.tokenBalanceContainer}>
            {walletState.connected && !isBuyOrder ? (
              <div className={styles.userBalanceContainer}>
                <span
                  className={styles.userBalance}
                  onClick={() => {
                    // formatNumbersWithCommas(isBuyOrder ? quoteTokenBalance.toString() : baseTokenBalance.toString(), setSendUptoSize);
                    isBuyOrder
                      ? handleSendUptoSizeChange(
                          null,
                          quoteTokenBalance.toString(),
                        )
                      : handleSendUptoSizeChange(
                          null,
                          baseTokenBalance.toString(),
                        );
                  }}
                >
                  <i className="fa-solid fa-wallet fa-2xs"></i>
                  {` `}
                  {baseTokenMetadata && quoteTokenMetadata
                    ? isBuyOrder
                      ? quoteTokenMetadata.mint === WRAPPED_SOL_MAINNET
                        ? quoteTokenBalance + nativeSOLBalance
                        : quoteTokenBalance
                      : baseTokenMetadata.mint === WRAPPED_SOL_MAINNET
                        ? baseTokenBalance + nativeSOLBalance
                        : baseTokenBalance
                    : `0.0`}
                </span>
              </div>
            ) : (
              <div className={styles.userBalanceContainer}>
                <span>{` `}</span>
              </div>
            )}
          </div>
        </Form.Group>
        {receiveUptoSize ? (
          <Form.Group
            controlId="formInput"
            className={styles.formGroupContainer}
          >
            <div className={styles.formLabelAndFieldContainerReceiveUptoSize}>
              <Form.Label className={styles.formLabelContainer}>
                <span className={styles.fieldTitleContainer}>
                  <span>{isBuyOrder ? `Pay upto` : `Receive upto`}</span>
                </span>
              </Form.Label>
              <Form.Label className={styles.formFieldContainerShortWidth}>
                <span className={styles.fieldTitleContainer}>
                  <span>{`${phoenixMarket ? justFormatNumbersWithCommas(parseFloat(removeCommas(receiveUptoSize)).toFixed(decimalPlacesFromTickSize(phoenixMarket.tick_size))) : justFormatNumbersWithCommas(receiveUptoSize)} ${
                    quoteTokenMetadata ? quoteTokenMetadata.ticker : ``
                  }`}</span>
                </span>
              </Form.Label>
            </div>
          </Form.Group>
        ) : (
          <></>
        )}
        <Form.Group controlId="formInput" className={styles.formGroupContainer}>
          <div className={styles.tradeInfoContainer}>
            {walletState.connected ? (
              <KeyValueComponent
                keyElement={<p>Total fee</p>}
                keyElementStyle={{}}
                valueElement={
                  phoenixMarket ? (
                    <p>{`${(parseFloat(phoenixMarket.taker_fee_bps) + ROOT_PROTOCOL_FEE_BPS) / 100}%`}</p>
                  ) : (
                    <p>{`-%`}</p>
                  )
                }
                valueElementStyle={{}}
                justification={KeyValueJustification.SpaceBetween}
                keyElementContainerStyle={{
                  display: `flex`,
                  flexDirection: `row`,
                }}
              />
            ) : (
              <></>
            )}
          </div>
        </Form.Group>
        <Form.Group controlId="formInput" className={styles.formGroupContainer}>
          <div className={styles.placeOrderButtonContainer}>
            <Button
              className={styles.placeOrderButton}
              disabled={!walletState.connected}
              onClick={() => {
                handlePlaceLimitOrderAction();
              }}
              style={{
                backgroundColor: isBuyOrder
                  ? "rgba(61, 227, 131, 0.90)"
                  : "rgba(227, 61, 61, 0.90)",
                color: "#0B0C11",
              }}
            >
              {isPlaceOrderButtonLoading ? (
                <div className={styles.spinnerBox}>
                  <div
                    className={styles.threeQuarterSpinner}
                    style={{
                      border: "3px solid #0B0C11",
                      borderTop: `3px solid transparent`,
                    }}
                  ></div>
                </div>
              ) : (
                <>{`${isBuyOrder ? "Buy" : "Sell"}`}</>
              )}
            </Button>
          </div>
        </Form.Group>
      </Form>
    </div>
  );
};

export default LimitOrderView;
