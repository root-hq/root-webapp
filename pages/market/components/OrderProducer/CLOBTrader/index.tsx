import React, { useEffect, useRef, useState } from 'react';
import styles from "./CLOBTrader.module.css";
import { MAX_BPS, OrderType, ROOT_PROTOCOL_FEE_BPS, getAllOrderTypes, getOrderTypeText } from '../../../../../constants';
import { SpotGridMarket, TokenMetadata } from '../../../../../utils/supabase';
import { Connection, sendAndConfirmTransaction } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { web3 } from '@coral-xyz/anchor';
import { delay, formatNumbersWithCommas, getMarketMetadata, removeCommas } from '../../../../../utils';
import { Button, Form } from 'react-bootstrap';
import dynamic from "next/dynamic";
import KeyValueComponent, { KeyValueJustification } from '../../../../../components/KeyValueComponent';
import Image from 'next/image';
import { Client, OrderPacket, SelfTradeBehavior, Side, getMakerSetupInstructionsForMarket } from '@ellipsis-labs/phoenix-sdk';
import {BN } from "@coral-xyz/anchor";

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("../../../../../components/Wallet")).WalletMultiButton,
  { ssr: false },
);

export interface CLOBTraderProps {
    spotGridMarket: SpotGridMarket;
    baseTokenMetadata: TokenMetadata;
    quoteTokenMetadata: TokenMetadata;
}

const CLOBTrader = ({
    spotGridMarket,
    baseTokenMetadata,
    quoteTokenMetadata
}: CLOBTraderProps) => {
  const [isBuyOrder, setIsBuyOrder] = useState(true);
  const [orderType, setOrderType] = useState<OrderType>(OrderType.Market);  
  const dropdownRef = useRef(null);
  const [isOrderTypeDropdownOpen, setOrderTypeDropdownOpen] = useState(false);

  const [baseTokenBalance, setBaseTokenBalance] = useState(0.0);
  const [quoteTokenBalance, setQuoteTokenBalance] = useState(0.0);
  const [limitPrice, setLimitPrice] = useState("");
  const [sendUptoSize, setSendUptoSize] = useState("");
  const [receiveUptoSize, setReceiveUptoSize] = useState("");
  const [isPlaceOrderButtonLoading, setIsPlaceOrderButtonLoading] = useState(false);

  const [marketMetadata, setMarketMetadata] = useState(null);
  const [phoenixClient, setPhoenixClient] = useState<Client>(null);

  let connection: Connection;
  if(process.env.RPC_ENDPOINT) {
    connection = new Connection(process.env.RPC_ENDPOINT, { commitment: "processed" });
  }
  else {
    connection = new Connection(`https://api.mainnet-beta.solana.com/`, { commitment: "processed" });
  }

  const walletState = useWallet();

  useEffect(() => {
    const updateBalance = async() => {
      if(walletState.connected) {
        const baseTokenAddress = await getAssociatedTokenAddress(new web3.PublicKey(baseTokenMetadata.mint), walletState.publicKey);
        const quoteTokenAddress = await getAssociatedTokenAddress(new web3.PublicKey(quoteTokenMetadata.mint), walletState.publicKey);

        let baseBalance = 0;
        if((await connection.getBalance(baseTokenAddress)) > 0) {
          baseBalance = (await connection.getTokenAccountBalance(baseTokenAddress)).value.uiAmount;
        }

        let quoteBalance = 0;
        if((await connection.getBalance(quoteTokenAddress)) > 0) {
          quoteBalance = (await connection.getTokenAccountBalance(quoteTokenAddress)).value.uiAmount;
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
  }, [walletState, baseTokenMetadata, quoteTokenMetadata]);

  useEffect(() => {
    calculateRecieveUpto()
  }, [limitPrice, sendUptoSize]);
  
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

  useEffect(() => {
    const fetchMetadata = async() => {
      if(spotGridMarket) {
        const metadata = await getMarketMetadata(spotGridMarket.phoenix_market_address.toString());
        setMarketMetadata(_ => metadata);
      }
    }

    const setupPhoenixClient = async() => {
      if(spotGridMarket) {
        let endpoint = process.env.RPC_ENDPOINT;
        if(!endpoint) {
          endpoint = `https://api.mainnet-beta.solana.com`;
        }

        const connection = new web3.Connection(endpoint, {
          commitment: "processed",
        });

        const client = await Client.create(connection);

        setPhoenixClient(_ => client);
      }
    }

    fetchMetadata();
    setupPhoenixClient();
  }, [spotGridMarket]);

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

    formatNumbersWithCommas(limitPrice, setLimitPrice);
  };

  // Handle change for maximum price
  const handleSendUptoSizeChange = (e) => {
    e.preventDefault();

    const sendUptoSize = removeCommas(e.target.value);

    formatNumbersWithCommas(sendUptoSize, setSendUptoSize);
  };

  const handleReceiveUptoSizeChange = (receivingAmount) => {
    const formattedAmount = removeCommas(receivingAmount);

    formatNumbersWithCommas(formattedAmount, setReceiveUptoSize);
  }

  const handlePlaceOrderAction = async () => {
    let marketAddress = spotGridMarket.phoenix_market_address.toString();

    if(orderType === OrderType.Market && sendUptoSize) {
      if(!phoenixClient) {
        console.log("PHOENIX CLIENT NOT SET");
        return;
      }

      if(isBuyOrder) {
        console.log("Market buy");
        setIsPlaceOrderButtonLoading(_ => true);
        await delay(3_000);
        setIsPlaceOrderButtonLoading(_ => false);
      }
      else {
        console.log("Market sell");
        setIsPlaceOrderButtonLoading(_ => true);
        await delay(3_000);
        setIsPlaceOrderButtonLoading(_ => false);
      }
    }
    else if(orderType === OrderType.Limit && limitPrice && sendUptoSize) {
      if(isBuyOrder && parseFloat(receiveUptoSize)) {
        console.log("Limit buy");
        setIsPlaceOrderButtonLoading(_ => true);
        let priceInTicks = new BN(phoenixClient.floatPriceToTicks(parseFloat(limitPrice), marketAddress));
        let sizeInBaseLosts = new BN(phoenixClient.baseAtomsToBaseLots(parseFloat(receiveUptoSize) * Math.pow(10, baseTokenMetadata.decimals), marketAddress));
        console.log(`Buying ${sizeInBaseLosts} base lots at ${priceInTicks} price in ticks`);
        
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
          let transaction = new web3.Transaction();
          const marketState = phoenixClient.marketStates.get(marketAddress);

          let setupIxs = await getMakerSetupInstructionsForMarket(connection, marketState, walletState.publicKey);
          let ix = phoenixClient.createPlaceLimitOrderInstruction(orderPacket, marketAddress, walletState.publicKey);
          for(let i of setupIxs) {
            transaction.add(i);
          }
          transaction.add(ix);
          
          const {
            context: { slot: minContextSlot },
            value: { blockhash, lastValidBlockHeight }
          } = await connection.getLatestBlockhashAndContext();
          transaction.recentBlockhash = blockhash;
          transaction.feePayer = walletState.publicKey;
          transaction.lastValidBlockHeight = lastValidBlockHeight;
  
          let response = await walletState.sendTransaction(transaction, connection, { minContextSlot });
          console.log("Signature: ", response);
        }
        catch(err) {
          console.log(`Error sending limit buy order: ${err}`);
        }

        setIsPlaceOrderButtonLoading(_ => false);
      }
      else if(!isBuyOrder && parseFloat(sendUptoSize)){
        console.log("Limit sell");
        setIsPlaceOrderButtonLoading(_ => true);
        await delay(3_000);
        let priceInTicks = new BN(phoenixClient.floatPriceToTicks(parseFloat(limitPrice), marketAddress));
        let sizeInBaseLosts = new BN(phoenixClient.baseAtomsToBaseLots(parseFloat(sendUptoSize) * Math.pow(10, baseTokenMetadata.decimals), marketAddress));
        console.log(`Selling ${sizeInBaseLosts} base lots at ${priceInTicks} price in ticks`);
        
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
          const marketState = phoenixClient.marketStates.get(marketAddress);

          let setupIxs = await getMakerSetupInstructionsForMarket(connection, marketState, walletState.publicKey);
          let ix = phoenixClient.createPlaceLimitOrderInstruction(orderPacket, marketAddress, walletState.publicKey);
          for(let i of setupIxs) {
            transaction.add(i);
          }
          transaction.add(ix);

          const {
            context: { slot: minContextSlot },
            value: { blockhash, lastValidBlockHeight }
          } = await connection.getLatestBlockhashAndContext();
          transaction.recentBlockhash = blockhash;
          transaction.feePayer = walletState.publicKey;
          transaction.lastValidBlockHeight = lastValidBlockHeight;
  
          let response = await walletState.sendTransaction(transaction, connection, { minContextSlot });
          console.log("Signature: ", response);
        }
        catch(err) {
          console.log(`Error sending limit sell order: ${err}`);
        }
        
        setIsPlaceOrderButtonLoading(_ => false);
      }
    }
  }

  const toggleOrderTypeDropdown = () => {
    setOrderTypeDropdownOpen(!isOrderTypeDropdownOpen);
  };

  const calculateRecieveUpto = async () => {
    if(orderType === OrderType.Limit) {
      if(limitPrice && sendUptoSize) {
        let takerFeeBps = 0;
        if(marketMetadata) {
          takerFeeBps = marketMetadata.takerFeeBps;
        }

        if(isBuyOrder) {
          let receivingAmount = parseFloat(removeCommas(sendUptoSize)) / parseFloat(removeCommas(limitPrice));

          let amountPostFee = receivingAmount * ((MAX_BPS - takerFeeBps) / MAX_BPS);
          handleReceiveUptoSizeChange(amountPostFee.toFixed(baseTokenMetadata.decimals));
        }
        else {
          let receivingAmount = parseFloat(removeCommas(sendUptoSize)) * parseFloat(removeCommas(limitPrice));
          
          let amountPostFee = receivingAmount * ((MAX_BPS - takerFeeBps) / MAX_BPS);
          handleReceiveUptoSizeChange(amountPostFee.toFixed(quoteTokenMetadata.decimals))
        }
      }
      else {
        handleReceiveUptoSizeChange("")
      }
    }
    else {
      // Simulate using Phoenix orderbook
    }
  }

  // Reset all fields
  const resetAllFields = () => {
    setLimitPrice("")
    setSendUptoSize("");
    setReceiveUptoSize("");
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
                    <>
                        {
                            allOrderTypes.map((type) => {
                                if(type !== orderType) {
                                    return (
                                        <button className={styles.dropdownButtonSecondary} onClick={
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
                    </>
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
                      <Image
                        src={quoteTokenMetadata.img_url}
                        width={22}
                        height={22}
                        alt={`${quoteTokenMetadata.ticker} img`}
                        className={styles.tokenImage}
                      />
                    :
                      <Image
                        src={baseTokenMetadata.img_url}
                        width={22}
                        height={22}
                        alt={`${baseTokenMetadata.ticker} img`}
                        className={styles.tokenImage}
                      />
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
                        formatNumbersWithCommas(isBuyOrder ? quoteTokenBalance.toString() : baseTokenBalance.toString(), setSendUptoSize);
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
                      <Image
                        src={baseTokenMetadata.img_url}
                        width={22}
                        height={22}
                        alt={`${baseTokenMetadata.ticker} img`}
                        className={styles.tokenImage}
                      />
                    :
                      <Image
                        src={quoteTokenMetadata.img_url}
                        width={22}
                        height={22}
                        alt={`${quoteTokenMetadata.ticker} img`}
                        className={styles.tokenImage}
                      />
                  }
                </span>
              </Form.Label>
              <Form.Control
                placeholder={`0.00 ${isBuyOrder ? baseTokenMetadata ? baseTokenMetadata.ticker : '' : quoteTokenMetadata ? quoteTokenMetadata.ticker : ''}`}
                // disabled={orderType === OrderType.Limit}
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
                  console.log("Change");
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
                    marketMetadata ?
                      <p>{`${(marketMetadata.takerFeeBps + ROOT_PROTOCOL_FEE_BPS)/100}%`}</p>
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
                      handlePlaceOrderAction()
                    }} 
                  >
                    {
                      isPlaceOrderButtonLoading ?
                      <div className={styles.spinnerBox}>
                        <div className={styles.threeQuarterSpinner}></div>
                      </div>
                      :
                        <>Place {`${isBuyOrder ? 'buy' : 'sell'}`}</>
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
