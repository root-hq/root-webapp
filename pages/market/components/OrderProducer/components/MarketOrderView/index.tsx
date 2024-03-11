import React, { useEffect, useState } from "react";
import styles from "./MarketOrderView.module.css";
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
  JUPITER_V6_PROGRAM,
  ROOT_PROTOCOL_FEE_BPS,
  WRAPPED_SOL_MAINNET,
} from "constants/";
import KeyValueComponent, {
  KeyValueJustification,
} from "components/KeyValueComponent";
import { getPriorityFeeEstimate } from "utils/helius";
import { BN } from "@coral-xyz/anchor";
import { VersionedTransaction } from "@solana/web3.js";
import { useRootState } from "components/RootStateContextType";
import { fetchQuote, swapOnJupiterTx } from "utils/jupiter";
import Link from "next/link";

export interface MarketOrderViewProps {
  phoenixMarket: PhoenixMarket;
  baseTokenMetadata: TokenMetadata;
  quoteTokenMetadata: TokenMetadata;
  isBuyOrder: boolean;
  baseTokenBalance: number;
  quoteTokenBalance: number;
  nativeSOLBalance: number;
  resetFieldsSignal: number;
}

const MarketOrderView = ({
  phoenixMarket,
  baseTokenMetadata,
  quoteTokenMetadata,
  isBuyOrder,
  baseTokenBalance,
  quoteTokenBalance,
  nativeSOLBalance,
  resetFieldsSignal,
}: MarketOrderViewProps) => {
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

  const handleResetAllFields = () => {
    setLimitPrice("");
    setSendUptoSize("");
    setReceiveUptoSize("");
    resetStatus();
  };

  useEffect(() => {
    handleResetAllFields();
  }, [resetFieldsSignal]);

  const handleSendUptoSizeChange = (e?: any, size?: any) => {
    if (e) {
      e.preventDefault();
    }

    if (size === undefined) {
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

    if (isBuyOrder) {
      formatNumbersWithCommas(sendUptoSize, setSendUptoSize);
      fetchAndSetJupiterQuote(
        quoteTokenMetadata,
        baseTokenMetadata,
        sendUptoSizeFloat,
        setReceiveUptoSize,
      );
    } else {
      formatNumbersWithCommas(sendUptoSize, setSendUptoSize);
      fetchAndSetJupiterQuote(
        baseTokenMetadata,
        quoteTokenMetadata,
        sendUptoSizeFloat,
        setReceiveUptoSize,
      );
    }
  };

  const handlePlaceMarketOrderAction = async () => {
    setIsPlaceOrderButtonLoading((_) => true);

    let serializedTx = null;

    let priorityFeeLevels = 0;

    try {
      let levels = (await getPriorityFeeEstimate([JUPITER_V6_PROGRAM]))
        .priorityFeeLevels;
      priorityFeeLevels = levels["veryHigh"];
    } catch (err) {
      console.log(`Error fetching priority fee levels`);
    }

    updateStatus(<span>{`Preparing swap transaction...`}</span>);
    if (isBuyOrder) {
      let size =
        parseFloat(removeCommas(sendUptoSize)) * Math.pow(10, quoteTokenMetadata.decimals);

      const tx = await swapOnJupiterTx({
        userPublicKey: walletState.publicKey.toString(),
        inputMint: quoteTokenMetadata.mint,
        outputMint: baseTokenMetadata.mint,
        amountIn: size,
        slippage: 1,
        priorityFeeInMicroLamportsPerUnit: priorityFeeLevels,
      });

      serializedTx = tx;
    } else {
      let size =
        parseFloat(removeCommas(sendUptoSize)) * Math.pow(10, baseTokenMetadata.decimals);

      const tx = await swapOnJupiterTx({
        userPublicKey: walletState.publicKey.toString(),
        inputMint: baseTokenMetadata.mint,
        outputMint: quoteTokenMetadata.mint,
        amountIn: size,
        slippage: 1,
        priorityFeeInMicroLamportsPerUnit: priorityFeeLevels,
      });

      serializedTx = tx;
    }

    try {
      if (serializedTx) {
        const swapTransactionBuf = Buffer.from(serializedTx, "base64");
        var transaction = VersionedTransaction.deserialize(swapTransactionBuf);

        const {
          context: { slot: minContextSlot },
          value: { blockhash, lastValidBlockHeight },
        } = await connection.getLatestBlockhashAndContext();

        updateStatus(<span>{`Awaiting confirmation ⏱...`}</span>);
        let response = await walletState.sendTransaction(
          transaction,
          connection,
          { minContextSlot, skipPreflight: true },
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
        console.log("Signature: ", response);
        handleResetAllFields();
      }
    } catch (err) {
      console.log(`Error preparing Jupiter swap tx: ${err.message}`);
      red(<span>{`Failed: ${err.message}`}</span>, 2_000);
    }
    
    setIsPlaceOrderButtonLoading((_) => false);
  };

  const fetchAndSetJupiterQuote = async (
    from: TokenMetadata,
    to: TokenMetadata,
    size: number,
    setter: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    try {
      const jupiterQuote = await fetchQuote(
        from.mint,
        to.mint,
        size * Math.pow(10, from.decimals),
        1,
      );

      const outAmount = jupiterQuote.outAmount;
      const outAmountFormatted = new BN(outAmount).toNumber();
      const quote = outAmountFormatted / Math.pow(10, to.decimals);

      setter((_) => quote.toString());
    } catch (err) {
      console.log("Error fetching and setting Jupiter quote: ", err);
      setter((_) => "");
    }
  };

  return (
    <div className={styles.marketOrderViewContainer}>
      <Form>
        <Form.Group controlId="formInput" className={styles.formGroupContainer}>
          <div className={styles.formLabelAndFieldContainerNoBottomMargin}>
            <Form.Label className={styles.formLabelContainer}>
              <span className={styles.fieldTitleContainer}>
                <span>
                  Size{" "}
                  {`(${
                    baseTokenMetadata && quoteTokenMetadata
                      ? isBuyOrder
                        ? quoteTokenMetadata.ticker
                        : baseTokenMetadata.ticker
                      : ``
                  })`}
                </span>
              </span>
            </Form.Label>
            <Form.Control
              placeholder={`${
                phoenixMarket
                  ? decimalPlacesFromTickSize(phoenixMarket.tick_size) >= 6
                    ? `0.0001`
                    : phoenixMarket.tick_size
                  : ``
              } ${baseTokenMetadata && quoteTokenMetadata ? (isBuyOrder ? quoteTokenMetadata.ticker : baseTokenMetadata.ticker) : ``}`}
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
        {receiveUptoSize ? (
          <Form.Group
            controlId="formInput"
            className={styles.formGroupContainer}
          >
            <div className={styles.formLabelAndFieldContainerReceiveUptoSize}>
              <Form.Label className={styles.formLabelContainer}>
                <span className={styles.fieldTitleContainer}>
                  <span>{`Receive upto`}</span>
                </span>
              </Form.Label>
              <Form.Label className={styles.formFieldContainerShortWidth}>
                <span className={styles.fieldTitleContainer}>
                  <span>{`${phoenixMarket ? justFormatNumbersWithCommas(parseFloat(receiveUptoSize).toFixed(decimalPlacesFromTickSize(phoenixMarket.tick_size))) : justFormatNumbersWithCommas(receiveUptoSize)} ${
                    baseTokenMetadata && quoteTokenMetadata
                      ? isBuyOrder
                        ? baseTokenMetadata.ticker
                        : quoteTokenMetadata.ticker
                      : ``
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
              <></>
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
                handlePlaceMarketOrderAction();
              }}
              style={{
                backgroundColor: isBuyOrder
                  ? "rgba(61, 227, 131, 0.90)"
                  : "rgba(227, 61, 61, 0.90)",
                color: "#0f1118",
              }}
            >
              {isPlaceOrderButtonLoading ? (
                <div className={styles.spinnerBox}>
                  <div
                    className={styles.threeQuarterSpinner}
                    style={{
                      border: "3px solid #0f1118",
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

export default MarketOrderView;
