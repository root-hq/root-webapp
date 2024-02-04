import React, { useEffect, useRef, useState } from 'react';
import styles from "./CLOBTrader.module.css";
import { JUPITER_V6_PROGRAM, MAX_BPS, OrderType, ROOT_PROTOCOL_FEE_BPS, WRAPPED_SOL_MAINNET, getAllOrderTypes, getOrderTypeText } from '../../../../../constants';
import { SpotGridMarket, TokenMetadata } from '../../../../../utils/supabase';
import { ComputeBudgetProgram, Connection, LAMPORTS_PER_SOL, VersionedTransaction } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { web3 } from '@coral-xyz/anchor';
import { delay, formatNumbersWithCommas, removeCommas } from '../../../../../utils';
import { Button, Form } from 'react-bootstrap';
import dynamic from "next/dynamic";
import KeyValueComponent, { KeyValueJustification } from '../../../../../components/KeyValueComponent';
import Image from 'next/image';
import { Client, OrderPacket, SelfTradeBehavior, Side, getClaimSeatIx, getCreateTokenAccountInstructions } from '@ellipsis-labs/phoenix-sdk';
import {BN } from "@coral-xyz/anchor";
import { fetchQuote, swapOnJupiterTx } from '../../../../../utils/jupiter';
import { getPriorityFeeEstimate } from '../../../../../utils/helius';
import { useBottomStatus } from '../../../../../components/BottomStatus';

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("../../../../../components/Wallet")).WalletMultiButton,
  { ssr: false },
);

export interface CLOBTraderProps {
    spotGridMarket: SpotGridMarket;
    baseTokenMetadata: TokenMetadata;
    quoteTokenMetadata: TokenMetadata;
    phoenixClient: Client
}

const CLOBTrader = ({
    spotGridMarket,
    baseTokenMetadata,
    quoteTokenMetadata,
    phoenixClient
}: CLOBTraderProps) => {
  const [isBuyOrder, setIsBuyOrder] = useState(true);
  const [orderType, setOrderType] = useState<OrderType>(OrderType.Limit);
  
  const dropdownRef = useRef(null);
  const [isOrderTypeDropdownOpen, setOrderTypeDropdownOpen] = useState(false);

  const [baseTokenBalance, setBaseTokenBalance] = useState(0.0);
  const [quoteTokenBalance, setQuoteTokenBalance] = useState(0.0);
  const [limitPrice, setLimitPrice] = useState("");
  const [sendUptoSize, setSendUptoSize] = useState("");
  const [receiveUptoSize, setReceiveUptoSize] = useState("");
  const [isPlaceOrderButtonLoading, setIsPlaceOrderButtonLoading] = useState(false);


  let connection: Connection;
  if(process.env.RPC_ENDPOINT) {
    connection = new Connection(process.env.RPC_ENDPOINT, { commitment: "processed" });
  }
  else {
    connection = new Connection(`https://api.mainnet-beta.solana.com/`, { commitment: "processed" });
  }

  const walletState = useWallet();
  const { updateStatus, green, red } = useBottomStatus();

  useEffect(() => {
    const updateBalance = async() => {
      if(walletState.connected) {
        const baseTokenAddress = await getAssociatedTokenAddress(new web3.PublicKey(baseTokenMetadata.mint), walletState.publicKey);
        const quoteTokenAddress = await getAssociatedTokenAddress(new web3.PublicKey(quoteTokenMetadata.mint), walletState.publicKey);

        let baseBalance = 0;
        try {
          baseBalance = (await connection.getTokenAccountBalance(baseTokenAddress)).value.uiAmount;
        }
        catch(Err) {
          console.log(`Error fetching base ata balance`);
          baseBalance = 0;
        }

        if(baseTokenMetadata.mint === WRAPPED_SOL_MAINNET) {
          let sol_lamports = (await connection.getBalance(walletState.publicKey));
          let sol_balance = sol_lamports / LAMPORTS_PER_SOL;
          baseBalance += sol_balance;
        }

        let quoteBalance = 0;
        try {
          quoteBalance = (await connection.getTokenAccountBalance(quoteTokenAddress)).value.uiAmount;
        }
        catch(err) {
          console.log(`Error fetching quote ata balance`);
          quoteBalance = 0;
        }

        if(quoteTokenMetadata.mint === WRAPPED_SOL_MAINNET) {
          let sol_lamports = (await connection.getBalance(walletState.publicKey));
          let sol_balance = sol_lamports / LAMPORTS_PER_SOL;
          quoteBalance += sol_balance;
        }

        setBaseTokenBalance(_ => baseBalance);
        setQuoteTokenBalance(_ => quoteBalance);
      }
      else {
        setBaseTokenBalance(_ => 0);
        setQuoteTokenBalance(_ => 0);
      }
    }

    updateBalance();
  }, [spotGridMarket, walletState, connection, baseTokenMetadata, quoteTokenMetadata]);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOrderTypeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  let allOrderTypes = getAllOrderTypes();

  const handleBuySellToggle = (type: string) => {
    if(type === "buy") {
        setIsBuyOrder(_ => true);
        resetAllFields()
    }
    else {
        setIsBuyOrder(_ => false);
        resetAllFields()
    }
  }

  const handleOrderTypeUpdate = (
    newOrderType: OrderType
  ) => {
    
    setOrderType(_ => newOrderType);
    resetAllFields();
  };

  const handleLimitPriceChange = (e) => {
    e.preventDefault();

    const limitPrice = removeCommas(e.target.value);

    let limitPriceFloat = parseFloat(limitPrice);

    let sendUptoSizeFloat = 0.0;
    if(sendUptoSize) {
      sendUptoSizeFloat = parseFloat(sendUptoSize);
    }

    let receiveUptoSizeFLoat = 0.0;
    if(receiveUptoSize) {
      receiveUptoSizeFLoat = parseFloat(receiveUptoSize);
    }

    if(limitPriceFloat && sendUptoSizeFloat) {
      let takerFeeBps = parseFloat(spotGridMarket.taker_fee_bps.toString());

      if(isBuyOrder) {
        let receivingAmount = parseFloat(removeCommas(sendUptoSize)) / parseFloat(removeCommas(limitPrice));
        let amountPostFee = receivingAmount * ((MAX_BPS - takerFeeBps) / MAX_BPS);

        formatNumbersWithCommas(amountPostFee.toFixed(baseTokenMetadata.decimals), setReceiveUptoSize);
      }
      else {
        let receivingAmount = parseFloat(removeCommas(sendUptoSize)) * parseFloat(removeCommas(limitPrice));
        let amountPostFee = receivingAmount * ((MAX_BPS - takerFeeBps) / MAX_BPS);

        formatNumbersWithCommas(amountPostFee.toFixed(quoteTokenMetadata.decimals), setReceiveUptoSize);
      }
    }

    if(limitPriceFloat && receiveUptoSizeFLoat) {
      let takerFeeBps = parseFloat(spotGridMarket.taker_fee_bps.toString());

      if(isBuyOrder) {
        let sendingAmount = parseFloat(removeCommas(receiveUptoSize)) * parseFloat(removeCommas(limitPrice));
        let amountPostFee = sendingAmount * ((MAX_BPS + takerFeeBps) / MAX_BPS);

        formatNumbersWithCommas(amountPostFee.toFixed(baseTokenMetadata.decimals), setSendUptoSize);
      }
      else {
        let sendingAmount = parseFloat(removeCommas(receiveUptoSize)) / parseFloat(removeCommas(limitPrice));
        let amountPostFee = sendingAmount * ((MAX_BPS + takerFeeBps) / MAX_BPS);

        formatNumbersWithCommas(amountPostFee.toFixed(quoteTokenMetadata.decimals), setSendUptoSize);
      }
    }

    formatNumbersWithCommas(limitPrice, setLimitPrice);
  };

  // Handle change for maximum price
  const handleSendUptoSizeChange = (e?: any, size?: any) => {

    if(e) {
      e.preventDefault();
    }

    let sendUptoSize;
    
    if(size) {
      sendUptoSize = size;
    }
    else {
      sendUptoSize = removeCommas(e.target.value);
    }

    let sendUptoSizeFloat = parseFloat(sendUptoSize);

    formatNumbersWithCommas(sendUptoSize, setSendUptoSize);  

    if(orderType === OrderType.Limit) {
      let limitPriceFloat = 0.0;
      if(limitPrice) {
        limitPriceFloat = parseFloat(limitPrice);
      }
  
      if(limitPriceFloat && sendUptoSizeFloat) {
        let takerFeeBps = parseFloat(spotGridMarket.taker_fee_bps.toString());

        if(isBuyOrder) {
          let receivingAmount = parseFloat(removeCommas(sendUptoSize)) / parseFloat(removeCommas(limitPrice));
          let amountPostFee = receivingAmount * ((MAX_BPS - takerFeeBps) / MAX_BPS);
  
          formatNumbersWithCommas(amountPostFee.toFixed(baseTokenMetadata.decimals), setReceiveUptoSize);
        }
        else {
          let receivingAmount = parseFloat(removeCommas(sendUptoSize)) * parseFloat(removeCommas(limitPrice));
          let amountPostFee = receivingAmount * ((MAX_BPS - takerFeeBps) / MAX_BPS);
  
          formatNumbersWithCommas(amountPostFee.toFixed(quoteTokenMetadata.decimals), setReceiveUptoSize);
        }
      }
    }
    else if(orderType === OrderType.Market && sendUptoSizeFloat > 0.0) {
      if(isBuyOrder) {
        formatNumbersWithCommas(sendUptoSize, setSendUptoSize);  
        fetchAndSetJupiterQuote(quoteTokenMetadata, baseTokenMetadata, sendUptoSizeFloat, setReceiveUptoSize);
      }
      else {
        formatNumbersWithCommas(sendUptoSize, setSendUptoSize);  
        fetchAndSetJupiterQuote(baseTokenMetadata, quoteTokenMetadata, sendUptoSizeFloat, setReceiveUptoSize);
      }
    }
    else {
      setSendUptoSize(_ => "");
      setReceiveUptoSize(_ => "");
    }
  };

  const handleReceiveUptoSizeChange = (e?: any, size?: any) => {

    if(e) {
      e.preventDefault();
    }

    let receiveUptoSize;

    if(size) {
      receiveUptoSize = removeCommas(size);
    }
    else {
      receiveUptoSize = removeCommas(e.target.value);
    }

    let receiveUptoSizeFloat = parseFloat(receiveUptoSize);

    if(orderType === OrderType.Limit) {
      let limitPriceFloat = 0.0;
      if(limitPrice) {
        limitPriceFloat = parseFloat(limitPrice);
      }
  
      if(limitPriceFloat && receiveUptoSizeFloat) {
        let takerFeeBps = parseFloat(spotGridMarket.taker_fee_bps.toString());
  
          if(isBuyOrder) {
            let sendingAmount = parseFloat(removeCommas(receiveUptoSize)) * parseFloat(removeCommas(limitPrice));
  
            let amountPostFee = sendingAmount * ((MAX_BPS + takerFeeBps) / MAX_BPS);
            formatNumbersWithCommas(amountPostFee.toFixed(baseTokenMetadata.decimals), setSendUptoSize);
          }
          else {
            let sendingAmount = parseFloat(removeCommas(receiveUptoSize)) / parseFloat(removeCommas(limitPrice));
  
            let amountPostFee = sendingAmount * ((MAX_BPS + takerFeeBps) / MAX_BPS);
            formatNumbersWithCommas(amountPostFee.toFixed(quoteTokenMetadata.decimals), setSendUptoSize);
          }
      }
  
      formatNumbersWithCommas(receiveUptoSize, setReceiveUptoSize);  
    }
  }

  const handlePlaceLimitOrderAction = async () => {
    let marketAddress = spotGridMarket.phoenix_market_address.toString();

    if(orderType === OrderType.Market && sendUptoSize) {
      if(!phoenixClient) {
        // console.log("PHOENIX CLIENT NOT SET");
        return;
      }

      if(isBuyOrder) {
        // console.log("Market buy");
        setIsPlaceOrderButtonLoading(_ => true);
        await delay(3_000);
        setIsPlaceOrderButtonLoading(_ => false);
      }
      else {
        // console.log("Market sell");
        setIsPlaceOrderButtonLoading(_ => true);
        await delay(3_000);
        setIsPlaceOrderButtonLoading(_ => false);
      }
    }
    else if(orderType === OrderType.Limit && limitPrice && sendUptoSize) {
      let priorityFeeLevels = null;

      try {
        priorityFeeLevels = (await getPriorityFeeEstimate([marketAddress])).priorityFeeLevels;
      }
      catch(err) {
        console.log(`Error fetching priority fee levels`);
      }

      if(isBuyOrder && parseFloat(receiveUptoSize)) {
        // console.log("Limit buy");
        setIsPlaceOrderButtonLoading(_ => true);
        let priceInTicks = new BN(phoenixClient.floatPriceToTicks(parseFloat(limitPrice), marketAddress));
        let sizeInBaseLosts = new BN(phoenixClient.baseAtomsToBaseLots(parseFloat(receiveUptoSize) * Math.pow(10, baseTokenMetadata.decimals), marketAddress));
        // console.log(`Buying ${sizeInBaseLosts} base lots at ${priceInTicks} price in ticks`);
        
        try {
          let orderPacket = {
            __kind: 'Limit',
            side: Side.Bid,
            priceInTicks,
            numBaseLots: sizeInBaseLosts,
            selfTradeBehavior: SelfTradeBehavior.Abort,
            useOnlyDepositedFunds: false,
            failSilentlyOnInsufficientFunds: false,
            matchLimit: null,
            lastValidSlot: null,
            lastValidUnixTimestampInSeconds: null,
            clientOrderId: new BN(1234)
          } as OrderPacket;
          updateStatus(<span>{`Preparing limit order transaction...`}</span>);
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

          transaction.add(getClaimSeatIx(new web3.PublicKey(marketAddress), walletState.publicKey));

          let baseAtaInitIxs = await getCreateTokenAccountInstructions(connection, walletState.publicKey, walletState.publicKey, new web3.PublicKey(baseTokenMetadata.mint));
          let quoteAtaInitIxs = await getCreateTokenAccountInstructions(connection, walletState.publicKey, walletState.publicKey, new web3.PublicKey(quoteTokenMetadata.mint));
          for(let ix of baseAtaInitIxs) {
            transaction.add(ix);
          }
          for(let ix of quoteAtaInitIxs) {
            transaction.add(ix);
          }

          let ix = phoenixClient.createPlaceLimitOrderInstruction(orderPacket, marketAddress, walletState.publicKey);
          transaction.add(ix);
          
          updateStatus(<span>{`Waiting for you to sign ⏱...`}</span>);
          let response = await walletState.sendTransaction(transaction, connection);
          green(<span><a href={`https://solscan.io/tx/${response}`} target="_blank">{`Transaction confirmed`}</a></span>, 4_000)
          console.log("Signature: ", response);
        }
        catch(err) {
          console.log(`Error sending limit buy order: ${err.message}`);
          red(<span>{`Failed: ${err.message}`}</span>, 2_000,)
        }

        setIsPlaceOrderButtonLoading(_ => false);
      }
      else if(!isBuyOrder && parseFloat(sendUptoSize)){
        // console.log("Limit sell");
        setIsPlaceOrderButtonLoading(_ => true);
        let priceInTicks = new BN(phoenixClient.floatPriceToTicks(parseFloat(limitPrice), marketAddress));
        let sizeInBaseLosts = new BN(phoenixClient.baseAtomsToBaseLots(parseFloat(sendUptoSize) * Math.pow(10, baseTokenMetadata.decimals), marketAddress));
        // console.log(`Selling ${sizeInBaseLosts} base lots at ${priceInTicks} price in ticks`);
        
        try {
          let orderPacket = {
            __kind: 'Limit',
            side: Side.Ask,
            priceInTicks,
            numBaseLots: sizeInBaseLosts,
            selfTradeBehavior: SelfTradeBehavior.Abort,
            useOnlyDepositedFunds: false,
            failSilentlyOnInsufficientFunds: false,
            matchLimit: null,
            lastValidSlot: null,
            lastValidUnixTimestampInSeconds: null,
            clientOrderId: new BN(1234)
          } as OrderPacket;
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

          transaction.add(getClaimSeatIx(new web3.PublicKey(marketAddress), walletState.publicKey));

          let baseAtaInitIxs = await getCreateTokenAccountInstructions(connection, walletState.publicKey, walletState.publicKey, new web3.PublicKey(baseTokenMetadata.mint));
          let quoteAtaInitIxs = await getCreateTokenAccountInstructions(connection, walletState.publicKey, walletState.publicKey, new web3.PublicKey(quoteTokenMetadata.mint));
          for(let ix of baseAtaInitIxs) {
            transaction.add(ix);
          }
          for(let ix of quoteAtaInitIxs) {
            transaction.add(ix);
          }

          updateStatus(<span>{`Preparing limit order transaction...`}</span>);
          let ix = phoenixClient.createPlaceLimitOrderInstruction(orderPacket, marketAddress, walletState.publicKey);
          transaction.add(ix);

          updateStatus(<span>{`Waiting for you to sign ⏱...`}</span>);
          let response = await walletState.sendTransaction(transaction, connection);
          green(<span><a href={`https://solscan.io/tx/${response}`} target="_blank">{`Transaction confirmed`}</a></span>, 4_000)
          console.log("Signature: ", response);
        }
        catch(err) {
          console.log(`Error sending limit sell order: ${err}`);
          red(<span>{`Failed: ${err.message}`}</span>, 2_000)
        }
        
        setIsPlaceOrderButtonLoading(_ => false);
      }
    }
  }

  const handlePlaceMarketOrderAction = async () => {
    setIsPlaceOrderButtonLoading(_ => true);
    if(orderType === OrderType.Market) {

      let serializedTx = null;

      let priorityFeeLevels = 0;

      try {
        let levels = (await getPriorityFeeEstimate([JUPITER_V6_PROGRAM])).priorityFeeLevels;
        priorityFeeLevels = levels["high"];
      }
      catch(err) {
        console.log(`Error fetching priority fee levels`);
      }

      updateStatus(<span>{`Preparing swap transaction...`}</span>);
      if(isBuyOrder) {
        let size = parseFloat(sendUptoSize) * Math.pow(10, quoteTokenMetadata.decimals);

        const tx = await swapOnJupiterTx({
          userPublicKey: walletState.publicKey.toString(),
          inputMint: quoteTokenMetadata.mint,
          outputMint: baseTokenMetadata.mint,
          amountIn: size,
          slippage: 1,
          priorityFeeInMicroLamportsPerUnit: priorityFeeLevels
        });

        serializedTx = tx;
      }
      else {
        let size = parseFloat(sendUptoSize) * Math.pow(10, baseTokenMetadata.decimals);

        const tx = await swapOnJupiterTx({
          userPublicKey: walletState.publicKey.toString(),
          inputMint: baseTokenMetadata.mint,
          outputMint: quoteTokenMetadata.mint,
          amountIn: size,
          slippage: 1,
          priorityFeeInMicroLamportsPerUnit: priorityFeeLevels
        });

        serializedTx = tx;
      }

      try {
        if(serializedTx) {
          const swapTransactionBuf = Buffer.from(serializedTx, 'base64');
          var transaction = VersionedTransaction.deserialize(swapTransactionBuf);          
  
          const {
            context: { slot: minContextSlot },
            value: { blockhash, lastValidBlockHeight }
          } = await connection.getLatestBlockhashAndContext();
  
          updateStatus(<span>{`Waiting for you to sign ⏱...`}</span>);
          let response = await walletState.sendTransaction(transaction, connection, { minContextSlot, skipPreflight: true });
          green(<span><a href={`https://solscan.io/tx/${response}`} target="_blank">{`Transaction confirmed`}</a></span>, 4_000)
          console.log("Signature: ", response);
        }
      }
      catch(err) {
        console.log(`Error preparing Jupiter swap tx: ${err.message}`);
        red(<span>{`Failed: ${err.message}`}</span>, 2_000,)
      }
    }
    // resetStatus();
    setIsPlaceOrderButtonLoading(_ => false);
  }

  const toggleOrderTypeDropdown = () => {
    setOrderTypeDropdownOpen(!isOrderTypeDropdownOpen);
  };

  // Reset all fields
  const resetAllFields = () => {
    setLimitPrice("")
    setSendUptoSize("");
    setReceiveUptoSize("");
  }

  const fetchAndSetJupiterQuote = async(
    from: TokenMetadata,
    to: TokenMetadata,
    size: number,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    try {
      const jupiterQuote = await fetchQuote(
        from.mint,
        to.mint,
        size * (Math.pow(10, from.decimals)),
        1
      );

      const outAmount = jupiterQuote.outAmount;
      const outAmountFormatted = (new BN(outAmount)).toNumber();
      const quote = outAmountFormatted / (Math.pow(10, to.decimals));

      setter(_ => quote.toString());
    }
    catch(err) {
      console.log("Error fetching and setting Jupiter quote: ", err);
      setter(_ => "");
    }
  }
  
  return (
    <div className={styles.clobTraderContainer}>
       <div className={styles.tabsContainer}>
            <div className={styles.buyTabContainer}>
                <button
                    className={styles.buyButton}
                    key = {'buyButton'}
                    style = {{
                        borderTop: isBuyOrder ? '2px solid green' : '',
                        borderBottom: isBuyOrder ? 'none' : '1px solid rgba(87, 87, 87, 0.25)'
                    }}
                    onClick={() => {
                        handleBuySellToggle("buy")
                    }}
                >
                    Buy
                </button>
            </div>
            <div className={styles.sellTabContainer}>
                <button 
                    className={styles.sellButton}
                    key = {'sellButton'}
                    style = {{
                        borderTop: !isBuyOrder ? '2px solid red' : '',
                        borderBottom: !isBuyOrder ? 'none' : '1px solid rgba(87, 87, 87, 0.25)'
                    }}
                    onClick={() => {
                        handleBuySellToggle("sell")
                    }}
                >
                    Sell
                </button>
            </div>
       </div>
       <div
          className={styles.shortcutButtonsContainer}
        >
          <span
            className={styles.resetFieldsButton}
            onClick={() => {
              resetAllFields()
            }}
          >Reset</span>
        </div>
       <div className={styles.orderTypeChooseContainer} ref={dropdownRef}>
            <div
                className={styles.dropdownButtonContainer}
                onClick={
                    () => {
                        toggleOrderTypeDropdown()
                    }
                }
            >
                <button className={styles.dropdownButton}>
                    <div className={styles.dropdownInnerContainer}>
                        <span>{getOrderTypeText(orderType)}</span>
                        <div className={styles.caretContainer}>
                            {isOrderTypeDropdownOpen ? (
                            <i className="fa-solid fa-caret-up"></i>
                            ) : (
                            <i className="fa-solid fa-caret-down"></i>
                            )}
                        </div>
                    </div>
                </button>
            </div>
              {
                isOrderTypeDropdownOpen ?
                  <div className={styles.dropdownButtonSecondaryContainer}>
                    {
                      allOrderTypes.map((type) => {
                        if(type !== orderType) {
                          return (
                            <button key = {type.toString()} className={styles.dropdownButtonSecondary} onClick={
                              () => {
                                  toggleOrderTypeDropdown()
                                  handleOrderTypeUpdate(type)
                              }
                            }>
                              <div className={styles.dropdownInnerContainer}>
                                <span>{getOrderTypeText(type)}</span>
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
       <Form>
          <Form.Group controlId="formInput" className={styles.formGroupContainer}>
            {
              orderType === OrderType.Limit ?
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
                      padding: "1rem"
                    }}
                    min="0"
                    step="0.01" // Allow any decimal value
                    className={styles.formFieldContainer}
                    onChange={(e) => handleLimitPriceChange(e)}
                    value={limitPrice} // Use inputText instead of inputAmount to show the decimal value
                  />
                </div>
              :
                <></>
            }
          </Form.Group>
          <Form.Group controlId="formInput" className={styles.formGroupContainer}>
            <div className={styles.formLabelAndFieldContainerNoBottomMargin}>
              <Form.Label className={styles.formLabelContainer}>
                <span className={styles.fieldTitleContainer}>
                  <span>{isBuyOrder ? 'Buy' : 'Sell'} size</span>
                  {
                    isBuyOrder ?
                      quoteTokenMetadata ?
                        <Image
                          src={quoteTokenMetadata.img_url}
                          width={22}
                          height={22}
                          alt={`${quoteTokenMetadata.ticker} img`}
                          className={styles.tokenImage}
                        />
                      :
                        <></>
                    :
                      baseTokenMetadata ?
                        <Image
                          src={baseTokenMetadata.img_url}
                          width={22}
                          height={22}
                          alt={`${baseTokenMetadata.ticker} img`}
                          className={styles.tokenImage}
                        />
                      :
                        <></>
                  }
                </span>
              </Form.Label>
              <Form.Control
                placeholder={`0.00 ${isBuyOrder ? quoteTokenMetadata ? quoteTokenMetadata.ticker : '' : baseTokenMetadata ? baseTokenMetadata.ticker : ''}`}
                // disabled={!walletState.connected}
                style={{
                  backgroundColor: "transparent",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  textAlign: "right",
                  color: "#ddd",
                  border: "none",
                  caretColor: "#ddd",
                  padding: "1rem"
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
                    onClick={
                      () => {
                        // formatNumbersWithCommas(isBuyOrder ? quoteTokenBalance.toString() : baseTokenBalance.toString(), setSendUptoSize);
                        isBuyOrder ?
                          handleSendUptoSizeChange(null, quoteTokenBalance.toString())
                        :
                        handleSendUptoSizeChange(null, baseTokenBalance.toString())
                      }
                    }
                  >
                    <i className="fa-solid fa-wallet fa-2xs"></i>
                    {` `}
                    {` ${isBuyOrder ? quoteTokenBalance : baseTokenBalance}`}
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
            <div className={styles.formLabelAndFieldContainerNoBottomMargin}>
              <Form.Label className={styles.formLabelContainer}>
                <span className={styles.fieldTitleContainer}>
                  <span>Receive</span>
                  {
                    isBuyOrder ?
                      baseTokenMetadata ?
                        <Image
                          src={baseTokenMetadata.img_url}
                          width={22}
                          height={22}
                          alt={`${baseTokenMetadata.ticker} img`}
                          className={styles.tokenImage}
                        />
                      :
                        <></>
                    :
                      quoteTokenMetadata ?
                        <Image
                          src={quoteTokenMetadata.img_url}
                          width={22}
                          height={22}
                          alt={`${quoteTokenMetadata.ticker} img`}
                          className={styles.tokenImage}
                        />
                      :
                        <></>
                  }
                </span>
              </Form.Label>
              <Form.Control
                placeholder={`0.00 ${isBuyOrder ? baseTokenMetadata ? baseTokenMetadata.ticker : '' : quoteTokenMetadata ? quoteTokenMetadata.ticker : ''}`}
                disabled={orderType === OrderType.Market}
                style={{
                  backgroundColor: "transparent",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  textAlign: "right",
                  color: "#ddd",
                  border: "none",
                  caretColor: "#ddd",
                  padding: "1rem"
                }}
                min="0"
                step="0.01" // Allow any decimal value
                className={styles.formFieldContainer}
                onChange={(e) => {
                  handleReceiveUptoSizeChange(e)
                }}
                value={receiveUptoSize} // Use inputText instead of inputAmount to show the decimal value
              />
            </div>
          </Form.Group>
          <div className={styles.tradeInfoContainer}>
            {
              orderType === OrderType.Limit ?
                <KeyValueComponent 
                  keyElement={
                    <p>Total fee</p>
                  }
                  keyElementStyle={
                    {

                    }
                  }
                  valueElement={
                    spotGridMarket ?
                      <p>{`${(parseFloat(spotGridMarket.taker_fee_bps.toString()) + ROOT_PROTOCOL_FEE_BPS)/100}%`}</p>
                    :
                      <p>{`-%`}</p>
                  }
                  valueElementStyle={
                    {

                    }
                  }
                  justification={KeyValueJustification.SpaceBetween}
                  keyElementContainerStyle={
                    {
                      
                    }
                  }
                />
              :
                <></>
            }
          </div>
          <Form.Group controlId="formInput" className={styles.formGroupContainer}>
            {
              walletState.connected ?
                <div className={styles.placeOrderButtonContainer}>
                  <Button
                    className={styles.placeOrderButton}
                    disabled={!walletState.connected}
                    onClick={() => {
                      if(orderType === OrderType.Limit) {
                        handlePlaceLimitOrderAction()
                      }
                      else if(orderType === OrderType.Market) {
                        handlePlaceMarketOrderAction()
                      }
                    }}
                    style={{
                      backgroundColor: isBuyOrder ? 'rgba(61, 227, 131, 0.10)' : 'rgba(227, 61, 61, 0.10)',
                      color: isBuyOrder ? '#3DE383' : '#e33d3d'
                    }}
                  >
                    {
                      isPlaceOrderButtonLoading ?
                      <div className={styles.spinnerBox}>
                        <div
                          className={styles.threeQuarterSpinner}
                          style = {{
                            border: isBuyOrder ? `3px solid #3DE383` : `3px solid #e33d3d`,
                            borderTop: `3px solid transparent`
                          }}
                        ></div>
                      </div>
                      :
                        <>{`${isBuyOrder ? 'Buy' : 'Sell'}`}</>
                    }
                  </Button>
                </div>
              :
                <></>
            }
          </Form.Group>
        </Form>
    </div>
  );
}

export default CLOBTrader;
