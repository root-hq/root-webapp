import React, { useState } from "react";
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
                  <div className={styles.formLabelAndFieldContainer}>
                    <Form.Label className={styles.formLabelContainer}>
                      <span>Size</span>
                    </Form.Label>
                    <Form.Control
                      placeholder={`0.00 ${quoteTokenMetadata.ticker}`}
                      disabled={!walletState.connected}
                      style={{
                        backgroundColor: "transparent",
                        fontSize: "1.1rem",
                        fontWeight: "bold",
                        textAlign: "right",
                        color: "#ddd",
                        border: "none",
                        caretColor: "#ddd",
                      }}
                      min="0"
                      step="0.01" // Allow any decimal value
                      className={styles.formFieldContainer}
                      onChange={(e) => handleAmountQuoteChange(e)}
                      value={amountQuote} // Use inputText instead of inputAmount to show the decimal value
                    />
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
