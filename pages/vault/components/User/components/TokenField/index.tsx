import React, { useState } from "react";
import styles from "./TokenField.module.css";
import { TokenMetadata } from "../../../../../../utils/supabase";
import Image from "next/image";
import { Form } from "react-bootstrap";
import { useWallet } from "@solana/wallet-adapter-react";
import { VaultBalance, calculateTokenDeposit } from "../../../../../../utils/root/utils";

export interface TokenFieldStateUtils {
  inputText: string,
  setInputText: React.Dispatch<React.SetStateAction<string>>,
  inputAmount: number,
  setInputAmount: React.Dispatch<React.SetStateAction<number>>
}

export interface TokenFieldProps {
  vaultAddress: string;
  vaultTokenBalance: VaultBalance;
  tokenMetadata: TokenMetadata;
  oppositeTokenMetadata: TokenMetadata;
  tokenBalance: number;
  tokenFieldStateUtils: TokenFieldStateUtils;
  oppositeStateUtils: TokenFieldStateUtils;
  isBaseTokenField: boolean;
}

const TokenField = ({ vaultAddress, vaultTokenBalance, tokenMetadata, oppositeTokenMetadata, tokenBalance, tokenFieldStateUtils, oppositeStateUtils, isBaseTokenField }: TokenFieldProps) => {

  let inputText = tokenFieldStateUtils.inputText;
  let setInputText = tokenFieldStateUtils.setInputText;
  let inputAmount = tokenFieldStateUtils.inputAmount;
  let setInputAmount = tokenFieldStateUtils.setInputAmount;

  let oppositeInputText = oppositeStateUtils.inputText;
  let setOppositeInputText = oppositeStateUtils.setInputText;
  let oppositeInputAmount = oppositeStateUtils.inputAmount;
  let setOppositeInputAmount = oppositeStateUtils.setInputAmount;

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

  const handleStateUpdate = (amount: string, isForOppositeToken: boolean) => {
    if(!isForOppositeToken) {
      if (amount === "") {
        setInputText("");
        setInputAmount(0);
      }
  
      if (amount.match(/^[+]?[0-9]+(\.[0-9]*)?$/)) {
        const formattedAgain = formatWithCommas(amount);
        setInputText(formattedAgain);
        setInputAmount(Number(formattedAgain));
      }
    }
    else {
      if (amount === "") {
        setOppositeInputText("");
        setOppositeInputAmount(0);
      }
  
      if (amount.match(/^[+]?[0-9]+(\.[0-9]*)?$/)) {
        const formattedAgain = formatWithCommas(amount);
        setOppositeInputText(formattedAgain);
        setOppositeInputAmount(Number(formattedAgain));
      }
    }
  }

  const handleAmountChange = (e: React.ChangeEvent<any>) => {
    e.preventDefault();

    const amount = removeCommas(e.target.value);

    const otherAmount = calculateTokenDeposit(
      vaultTokenBalance,
      amount,
      isBaseTokenField
    );

    handleStateUpdate(amount, false);
    handleStateUpdate(otherAmount.toString(), true);
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
