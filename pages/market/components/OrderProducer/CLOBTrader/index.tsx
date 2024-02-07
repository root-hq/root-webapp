import React, { useEffect, useState } from "react";
import styles from "./CLOBTrader.module.css";
import {
  MAX_BPS,
  ROOT_PROTOCOL_FEE_BPS,
  WRAPPED_SOL_MAINNET,
} from "../../../../../constants";
import { SpotGridMarket, TokenMetadata } from "../../../../../utils/supabase";
import {
  ComputeBudgetProgram,
  Connection,
  LAMPORTS_PER_SOL,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { TOKEN_PROGRAM_ID, createCloseAccountInstruction, createSyncNativeInstruction, createTransferInstruction, getAssociatedTokenAddress, getMinimumBalanceForRentExemptAccount } from "@solana/spl-token";
import { web3 } from "@coral-xyz/anchor";
import { formatNumbersWithCommas, removeCommas } from "../../../../../utils";
import { Button, Form } from "react-bootstrap";
import dynamic from "next/dynamic";
const KeyValueComponent = dynamic(
  () => import("../../../../../components/KeyValueComponent/index"),
  { ssr: false },
);
import { KeyValueJustification } from "../../../../../components/KeyValueComponent";
import Image from "next/image";
import {
  Client,
  InitializeParams,
  MarketSizeParams,
  OrderPacket,
  PROGRAM_ADDRESS,
  SelfTradeBehavior,
  Side,
  getClaimSeatIx,
  getCreateTokenAccountInstructions,
} from "@ellipsis-labs/phoenix-sdk";
import { BN } from "@coral-xyz/anchor";
import { getPriorityFeeEstimate } from "../../../../../utils/helius";
import { useBottomStatus } from "../../../../../components/BottomStatus";
import Link from "next/link";
import { createNewMarketInstruction } from "../../../../../utils/phoenix/initializeMarket";

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("../../../../../components/Wallet")).WalletMultiButton,
  { ssr: false },
);

export interface CLOBTraderProps {
  spotGridMarket: SpotGridMarket;
  baseTokenMetadata: TokenMetadata;
  quoteTokenMetadata: TokenMetadata;
  phoenixClient: Client;
  connection: Connection;
}

const CLOBTrader = ({
  spotGridMarket,
  baseTokenMetadata,
  quoteTokenMetadata,
  phoenixClient,
  connection,
}: CLOBTraderProps) => {
  const [isBuyOrder, setIsBuyOrder] = useState(true);

  const [baseTokenBalance, setBaseTokenBalance] = useState(0.0);
  const [quoteTokenBalance, setQuoteTokenBalance] = useState(0.0);
  const [nativeSOLBalance, setNativeSOLBalance] = useState(0.0);
  const [limitPrice, setLimitPrice] = useState("");
  const [sendUptoSize, setSendUptoSize] = useState("");
  const [receiveUptoSize, setReceiveUptoSize] = useState("");
  const [isPlaceOrderButtonLoading, setIsPlaceOrderButtonLoading] =
    useState(false);

  const walletState = useWallet();
  const { updateStatus, green, red, resetStatus } = useBottomStatus();

  useEffect(() => {
    const updateBalance = async () => {
      if (walletState.connected) {
        const baseTokenAddress = await getAssociatedTokenAddress(
          new web3.PublicKey(baseTokenMetadata.mint),
          walletState.publicKey,
        );
        const quoteTokenAddress = await getAssociatedTokenAddress(
          new web3.PublicKey(quoteTokenMetadata.mint),
          walletState.publicKey,
        );

        let baseBalance = 0;
        try {
          baseBalance = (
            await connection.getTokenAccountBalance(baseTokenAddress)
          ).value.uiAmount;
        } catch (Err) {
          // console.log(`Error fetching base ata balance`);
          baseBalance = 0;
        }

        let quoteBalance = 0;
        try {
          quoteBalance = (
            await connection.getTokenAccountBalance(quoteTokenAddress)
          ).value.uiAmount;
        } catch (err) {
          // console.log(`Error fetching quote ata balance`);
          quoteBalance = 0;
        }

        let nativeSOLLamports = await connection.getBalance(
          walletState.publicKey,
        );
        let nativeSOLBalance = nativeSOLLamports / LAMPORTS_PER_SOL;

        setBaseTokenBalance((_) => baseBalance);
        setQuoteTokenBalance((_) => quoteBalance);
        setNativeSOLBalance((_) => nativeSOLBalance);
      } else {
        setBaseTokenBalance((_) => 0);
        setQuoteTokenBalance((_) => 0);
      }
    };

    updateBalance();
  }, [
    spotGridMarket,
    walletState,
    connection,
    baseTokenMetadata,
    quoteTokenMetadata,
  ]);

  useEffect(() => {
    if (receiveUptoSize) {
      // console.log("Receive upto size: ", receiveUptoSize);
      updateStatus(
        <div>
          <span
            style={{ color: `#3DE383` }}
          >{`+ ${receiveUptoSize} ${isBuyOrder ? baseTokenMetadata.ticker : quoteTokenMetadata.ticker}`}</span>
          <span
            style={{ color: `#e33d3d`, marginLeft: `1rem` }}
          >{`- ${sendUptoSize} ${isBuyOrder ? quoteTokenMetadata.ticker : baseTokenMetadata.ticker}`}</span>
        </div>,
      );
    } else {
      // resetStatus();
    }
  }, [receiveUptoSize]);

  const handleBuySellToggle = (type: string) => {
    if (type === "buy") {
      setIsBuyOrder((_) => true);
      resetAllFields();
    } else {
      setIsBuyOrder((_) => false);
      resetAllFields();
    }
  };

  const handleLimitPriceChange = (e) => {
    e.preventDefault();

    const limitPrice = removeCommas(e.target.value);

    let limitPriceFloat = parseFloat(limitPrice);

    let sendUptoSizeFloat = 0.0;
    if (sendUptoSize) {
      sendUptoSizeFloat = parseFloat(sendUptoSize);
    }

    let receiveUptoSizeFLoat = 0.0;
    if (receiveUptoSize) {
      receiveUptoSizeFLoat = parseFloat(receiveUptoSize);
    }

    if (limitPriceFloat && sendUptoSizeFloat) {
      let takerFeeBps = parseFloat(spotGridMarket.taker_fee_bps);

      if (isBuyOrder) {
        let receivingAmount =
          parseFloat(removeCommas(sendUptoSize)) /
          parseFloat(removeCommas(limitPrice));
        let amountPostFee =
          receivingAmount * ((MAX_BPS - takerFeeBps) / MAX_BPS);

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

    if (limitPriceFloat && receiveUptoSizeFLoat) {
      let takerFeeBps = parseFloat(spotGridMarket.taker_fee_bps);

      if (isBuyOrder) {
        let sendingAmount =
          parseFloat(removeCommas(receiveUptoSize)) *
          parseFloat(removeCommas(limitPrice));
        let amountPostFee = sendingAmount * ((MAX_BPS + takerFeeBps) / MAX_BPS);

        formatNumbersWithCommas(
          amountPostFee.toFixed(baseTokenMetadata.decimals),
          setSendUptoSize,
        );
      } else {
        let sendingAmount =
          parseFloat(removeCommas(receiveUptoSize)) /
          parseFloat(removeCommas(limitPrice));
        let amountPostFee = sendingAmount * ((MAX_BPS + takerFeeBps) / MAX_BPS);

        formatNumbersWithCommas(
          amountPostFee.toFixed(quoteTokenMetadata.decimals),
          setSendUptoSize,
        );
      }
    }

    formatNumbersWithCommas(limitPrice, setLimitPrice);
  };

  // Handle change for maximum price
  const handleSendUptoSizeChange = (e?: any, size?: any) => {
    if (e) {
      e.preventDefault();
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
      let takerFeeBps = parseFloat(spotGridMarket.taker_fee_bps);

      if (isBuyOrder) {
        let receivingAmount =
          parseFloat(removeCommas(sendUptoSize)) /
          parseFloat(removeCommas(limitPrice));
        let amountPostFee =
          receivingAmount * ((MAX_BPS - takerFeeBps) / MAX_BPS);

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
    let marketAddress = spotGridMarket.phoenix_market_address;

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
      if((isBuyOrder && quoteTokenMetadata.mint === WRAPPED_SOL_MAINNET) || (!isBuyOrder && baseTokenMetadata.mint === WRAPPED_SOL_MAINNET)) {
        const wSOLAta = await getAssociatedTokenAddress(new web3.PublicKey(WRAPPED_SOL_MAINNET), walletState.publicKey);

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

      for(let ix of wrapSOLIxs) {
        transaction.add(ix);
      }

      if (isBuyOrder && parseFloat(receiveUptoSize)) {
        // console.log("Limit buy");
        let priceInTicks = new BN(
          phoenixClient.floatPriceToTicks(
            parseFloat(limitPrice),
            marketAddress,
          ),
        );
        let sizeInBaseLosts = new BN(
          phoenixClient.baseAtomsToBaseLots(
            parseFloat(receiveUptoSize) *
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

          for(let ix of unwrapSOLIxs) {
            transaction.add(ix);
          }

          updateStatus(<span>{`Waiting for you to sign ⏱...`}</span>);
          let response = await walletState.sendTransaction(
            transaction,
            connection,
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
          // console.log("Signature: ", response);
        } catch (err) {
          // console.log(`Error sending limit buy order: ${err.message}`);
          red(<span>{`Failed: ${err.message}`}</span>, 2_000);
        }
      } else if (!isBuyOrder && parseFloat(sendUptoSize)) {
        let priceInTicks = new BN(
          phoenixClient.floatPriceToTicks(
            parseFloat(limitPrice),
            marketAddress,
          ),
        );
        let sizeInBaseLosts = new BN(
          phoenixClient.baseAtomsToBaseLots(
            parseFloat(sendUptoSize) * Math.pow(10, baseTokenMetadata.decimals),
            marketAddress,
          ),
        );

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

          for(let ix of unwrapSOLIxs) {
            transaction.add(ix);
          }

          updateStatus(<span>{`Waiting for you to sign ⏱...`}</span>);
          let response = await walletState.sendTransaction(
            transaction,
            connection,
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
          // console.log("Signature: ", response);
        } catch (err) {
          // console.log(`Error sending limit sell order: ${err}`);
          red(<span>{`Failed: ${err.message}`}</span>, 2_000);
        }
      }
      resetAllFields();
    }

    setIsPlaceOrderButtonLoading((_) => false);
  };

  // Reset all fields
  const resetAllFields = () => {
    setLimitPrice("");
    setSendUptoSize("");
    setReceiveUptoSize("");
  };

  return (
    <div
      className={styles.clobTraderContainer}
      // style={{
      //   filter: walletState.connected ? `` : `blur(5px)`
      // }}
    >
      <div className={styles.tabsContainer}>
        <div className={styles.buyTabContainer}>
          <button
            className={styles.buyButton}
            key={"buyButton"}
            style={{
              borderTop: isBuyOrder ? "3px solid #3DE383" : "",
            }}
            onClick={() => {
              handleBuySellToggle("buy");
            }}
          >
            Buy
          </button>
        </div>
        <div className={styles.sellTabContainer}>
          <button
            className={styles.sellButton}
            key={"sellButton"}
            style={{
              borderTop: !isBuyOrder ? "3px solid #e33d3d" : "",
            }}
            onClick={() => {
              handleBuySellToggle("sell");
            }}
          >
            Sell
          </button>
        </div>
      </div>

      <Form>
        <Form.Group controlId="formInput" className={styles.formGroupContainer}>
          <div className={styles.shortcutButtonsContainer}>
            <div className={styles.resetButtonContainer}>
              <span
                className={styles.resetFieldsButton}
                onClick={() => {
                  resetAllFields();
                }}
              >
                Reset
              </span>
            </div>
          </div>
        </Form.Group>
        <Form.Group controlId="formInput" className={styles.formGroupContainer}>
          <div className={styles.formLabelAndFieldContainer}>
            <Form.Label className={styles.formLabelContainer}>
              <span>Limit price</span>
            </Form.Label>
            <Form.Control
              placeholder="0.00"
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
                <span>Quantity</span>
              </span>
            </Form.Label>
            <Form.Control
              placeholder={`0.00 ${isBuyOrder ? (quoteTokenMetadata ? quoteTokenMetadata.ticker : "") : baseTokenMetadata ? baseTokenMetadata.ticker : ""}`}
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
            {walletState.connected ? (
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
        <Form.Group controlId="formInput" className={styles.formGroupContainer}>
          <div className={styles.tradeInfoContainer}>
            {walletState.connected ? (
              <KeyValueComponent
                keyElement={<p>Total fee</p>}
                keyElementStyle={{}}
                valueElement={
                  spotGridMarket ? (
                    <p>{`${(parseFloat(spotGridMarket.taker_fee_bps) + ROOT_PROTOCOL_FEE_BPS) / 100}%`}</p>
                  ) : (
                    <p>{`-%`}</p>
                  )
                }
                valueElementStyle={{}}
                justification={KeyValueJustification.SpaceBetween}
                keyElementContainerStyle={{}}
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

export default CLOBTrader;
