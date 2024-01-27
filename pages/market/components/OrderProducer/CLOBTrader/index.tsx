import React, { useEffect, useRef, useState } from 'react';
import styles from "./CLOBTrader.module.css";
import { OrderType, getAllOrderTypes, getOrderTypeText } from '../../../../../constants';
import { SpotGridMarket, TokenMetadata } from '../../../../../utils/supabase';
import { Connection } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { web3 } from '@coral-xyz/anchor';
import { formatNumbersWithCommas, removeCommas } from '../../../../../utils';

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
  const [limitPrice, setLimitPrice] = useState("0.0");
  const [sizeInBaseUnits, setSizeInBaseUnits] = useState("0.0");

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

        console.log("Base token address: ", baseTokenAddress.toString());
        console.log("Quote token address: ", quoteTokenAddress.toString());

        let baseBalance = 0;
        if((await connection.getBalance(baseTokenAddress)) > 0) {
          baseBalance = (await connection.getTokenAccountBalance(baseTokenAddress)).value.uiAmount;
        }

        let quoteBalance = 0;
        if((await connection.getBalance(quoteTokenAddress)) > 0) {
          quoteBalance = (await connection.getTokenAccountBalance(quoteTokenAddress)).value.uiAmount;
        }

        console.log("base balance: ", baseBalance);
        console.log("quote balance: ", quoteBalance);

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

  let allOrderTypes = getAllOrderTypes();

  const handleBuySellToggle = (type: string) => {
    if(type === "buy") {
        setIsBuyOrder(_ => true);
    }
    else {
        setIsBuyOrder(_ => false);
    }
  }

  const handleOrderTypeUpdate = (
    newOrderType: OrderType
  ) => {
    
    setOrderType(_ => newOrderType);
  };

  const handleLimitPriceChange = (e) => {
    e.preventDefault();

    const limitPrice = removeCommas(e.target.value);

    formatNumbersWithCommas(limitPrice, setLimitPrice);
  };

  // Handle change for maximum price
  const handleSizeInBaseUnitsChange = (e) => {
    e.preventDefault();

    const sizeInBaseUnits = removeCommas(e.target.value);

    formatNumbersWithCommas(sizeInBaseUnits, setSizeInBaseUnits);
  };

  const toggleOrderTypeDropdown = () => {
    setOrderTypeDropdownOpen(!isOrderTypeDropdownOpen);
  };

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

  return (
    <div className={styles.clobTraderContainer}>
       <div className={styles.tabsContainer}>
            <div className={styles.buyTabContainer}>
                <button
                    className={styles.buyButton}
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
    </div>
  );
}

export default CLOBTrader;
