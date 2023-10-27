import React, { useState } from "react";
import styles from "./TokenField.module.css";
import { TokenMetadata } from "../../../../../../utils/supabase";
import Image from "next/image";
import { Form } from "react-bootstrap";
import { useWallet } from "@solana/wallet-adapter-react";

export interface TokenFieldProps {
  tokenMetadata: TokenMetadata;
  tokenBalance: number;
}

const TokenField = ({ tokenMetadata, tokenBalance }: TokenFieldProps) => {
  const [inputText, setInputText] = useState<string>("");
  const [inputAmount, setInputAmount] = useState<number>(0);

  const walletState = useWallet();
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

  const handleAmountChange = (e: React.ChangeEvent<any>) => {
    e.preventDefault();

    const amount = removeCommas(e.target.value);

    if (amount === "") {
      setInputText("");
      setInputAmount(0);
    }

    if (amount.match(/^[+]?[0-9]+(\.[0-9]*)?$/)) {
      const formattedAgain = formatWithCommas(amount);
      setInputText(formattedAgain);
      setInputAmount(Number(formattedAgain));
    }
  };

  return (
    <div className={styles.tokenFieldWithBalanceContainer}>
      {tokenBalance > 0 ? (
        <div className={styles.userBalanceContainer}>
          <span>
            <i className="fa-solid fa-wallet fa-2xs"></i>
            {` `}
            {`${tokenBalance}`}
          </span>
        </div>
      ) : (
        <div className={styles.userBalanceContainer}>
          <span>{` `}</span>
        </div>
      )}
      <div className={styles.tokenFieldContainer}>
        <div className={styles.tokenDetailsContainer}>
          {tokenMetadata && tokenMetadata.img_url ? (
            <div className={styles.tokenImageContainer}>
              <Image
                src={tokenMetadata.img_url}
                width={30}
                height={30}
                alt={`${tokenMetadata.ticker} img`}
                className={styles.tokenImage}
              />
            </div>
          ) : (
            <></>
          )}
          {tokenMetadata && tokenMetadata.ticker ? (
            <div className={styles.tokenNameContainer}>
              <span className={styles.tokenName}>
                {`${tokenMetadata.ticker}`}
              </span>
            </div>
          ) : (
            <></>
          )}
        </div>
        <div className={styles.inputFieldContainer}>
          <div className={styles.inputField}>
            <Form>
              <Form.Group controlId="formInput">
                <Form.Control
                  placeholder="0.00"
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
                  className={styles.customInputField}
                  onChange={(e) => handleAmountChange(e)}
                  value={inputText} // Use inputText instead of inputAmount to show the decimal value
                />
              </Form.Group>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenField;
