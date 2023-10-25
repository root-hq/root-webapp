import React from "react";
import styles from "./TokenField.module.css";
import { TokenMetadata } from "../../../../../../utils/supabase";
import Image from "next/image";
import { Form } from "react-bootstrap";

export interface TokenFieldProps {
  tokenMetadata: TokenMetadata;
  tokenBalance: number;
}

const TokenField = ({ tokenMetadata, tokenBalance }: TokenFieldProps) => {
  return (
    <div className={styles.tokenFieldWithBalanceContainer}>
      <div className={styles.userBalanceContainer}>
        <span>
          <i className="fa-solid fa-wallet fa-2xs"></i>
          {` `}
          {`${tokenBalance}`}
        </span>
      </div>
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
                  type="number"
                  // placeholder="Enter a positive real number"
                  style={{
                    backgroundColor: 'transparent',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    textAlign: 'right',
                    color: '#ddd',
                    border: 'none',
                    caretColor: 'red',
                    caret: 'green',
                    appearance: 'textfield'
                  }}
                  min="0"
                  step="any" // Allow any decimal value
                  className={styles.customInputField}
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
