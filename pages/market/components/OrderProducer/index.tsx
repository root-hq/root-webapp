import React, { useEffect, useState } from "react";
import styles from "./OrderProducer.module.css";
import { SpotGridMarket, TokenMetadata } from "../../../../utils/supabase";
import { Button, Form } from "react-bootstrap";
import Image from "next/image";
import { useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("../../../../components/Wallet")).WalletMultiButton,
  { ssr: false },
);
import { Connection } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { web3 } from "@coral-xyz/anchor";

export interface OrderProducerProps {
  spotGridMarket: SpotGridMarket;
  baseTokenMetadata: TokenMetadata;
  quoteTokenMetadata: TokenMetadata;
}

const OrderProducer = ({ 
  spotGridMarket,
  baseTokenMetadata,
  quoteTokenMetadata
 }: OrderProducerProps) => {

  const walletState = useWallet();

  // State variables for form fields
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [numGrids, setNumGrids] = useState("");
  const [amountQuote, setAmountQuote] = useState("");
  const [baseTokenBalance, setBaseTokenBalance] = useState(0.0);
  const [quoteTokenBalance, setQuoteTokenBalance] = useState(0.0);

  let connection: Connection;
  if(process.env.RPC_ENDPOINT) {
    connection = new Connection(process.env.RPC_ENDPOINT, { commitment: "processed" });
  }
  else {
    connection = new Connection(`https://api.mainnet-beta.solana.com/`, { commitment: "processed" });
  }

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
  }, [walletState]);

  // Handle change for minimum price
  const handleMinPriceChange = (e) => {
    e.preventDefault();

    const minPrice = removeCommas(e.target.value);

    formatNumbersWithCommas(minPrice, setMinPrice);
  };

  // Handle change for maximum price
  const handleMaxPriceChange = (e) => {
    e.preventDefault();

    const maxPrice = removeCommas(e.target.value);

    formatNumbersWithCommas(maxPrice, setMaxPrice);
  };

  // Handle change for number of grids
  const handleNumGridsChange = (e) => {
    setNumGrids(e.target.value);
  };

  // Handle change for amount in USD
  const handleAmountQuoteChange = (e) => {
    e.preventDefault();

    const amount = removeCommas(e.target.value);

    formatNumbersWithCommas(amount, setAmountQuote);
  };

  // Form submission handler
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
  };

  const formatNumbersWithCommas = (val: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    if (val === "") {
      setter("");
    }

    if (val.match(/^[+]?[0-9]+(\.[0-9]*)?$/)) {
      const formattedAgain = formatWithCommas(val);
      setter(formattedAgain);
    }
  };

  const removeCommas = (value) => {
    return value.replace(/,/g, "");
  };

  const formatWithCommas = (value) => {
    const withoutCommas = removeCommas(value);

    const parts = withoutCommas.split(".");
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const formattedValue =
      parts.length > 1 ? `${integerPart}.${parts[1]}` : integerPart;
    return formattedValue;
  };

  return (
    <div className={styles.orderProducerContainer}>
      <div className={styles.formHeaderContainer}>
        <h2>Create a new bot</h2>
      </div>
      <div className={styles.createBotForm}>
        <div className={styles.tokenFieldContainer}>
          <div className={styles.inputFieldContainer}>
            <div className={styles.inputField}>
              <Form>
                <Form.Group controlId="formInput" className={styles.formGroupContainer}>
                  <div className={styles.formLabelAndFieldContainer}>
                    <Form.Label className={styles.formLabelContainer}>
                      <span>Min price</span>
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
                      onChange={(e) => handleMinPriceChange(e)}
                      value={minPrice} // Use inputText instead of inputAmount to show the decimal value
                    />
                  </div>
                </Form.Group>
                <Form.Group controlId="formInput" className={styles.formGroupContainer}>
                  <div className={styles.formLabelAndFieldContainer}>
                    <Form.Label className={styles.formLabelContainer}>
                      <span>Max price</span>
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
                      onChange={(e) => handleMaxPriceChange(e)}
                      value={maxPrice} // Use inputText instead of inputAmount to show the decimal value
                    />
                  </div>
                </Form.Group>
                <Form.Group controlId="formInput" className={styles.formGroupContainer}>
                  <div className={styles.formLabelAndFieldContainer}>
                    <Form.Label className={styles.formLabelContainer}>
                      <span>Num. orders</span>
                    </Form.Label>
                    <Form.Control
                      placeholder="0"
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
                      onChange={(e) => handleNumGridsChange(e)}
                      value={numGrids} // Use inputText instead of inputAmount to show the decimal value
                    />
                  </div>
                </Form.Group>
                <Form.Group controlId="formInput" className={styles.formGroupContainer}>
                  <div className={styles.formLabelAndFieldContainerNoBottomMargin}>
                    <Form.Label className={styles.formLabelContainer}>
                      <span>Size</span>
                    </Form.Label>
                    <Form.Control
                      placeholder={`0.00 ${quoteTokenMetadata ? quoteTokenMetadata.ticker : ''}`}
                      disabled={!walletState.connected}
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
                      onChange={(e) => handleAmountQuoteChange(e)}
                      value={amountQuote} // Use inputText instead of inputAmount to show the decimal value
                    />
                  </div>
                  <div className={styles.tokenBalanceContainer}>
                    {walletState.connected ? (
                      <div className={styles.userBalanceContainer}>
                        <span>
                          <i className="fa-solid fa-wallet fa-2xs"></i>
                          {` `}
                          {`${quoteTokenBalance}`}
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
                  <div className={styles.createButtonContainer}>
                    {
                      walletState.connected ?
                        <Button
                          className={styles.createButton}
                          disabled={!walletState.connected}
                        >
                          Create
                        </Button>
                      :
                      <div className={styles.connectButtonContainer}>
                        <WalletMultiButtonDynamic />
                      </div>
                    }
                  </div>
                </Form.Group>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderProducer;
