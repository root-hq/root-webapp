import React, { useState } from "react";
import styles from "./FundsManagerColumn.module.css";
import { Button } from "react-bootstrap";
import { TokenMetadata } from "../../../../../../utils/supabase";
import Image from "next/image";
import TokenField from "../TokenField";

export interface FundsManagerColumnProps {
  baseTokenMetadata: TokenMetadata;
  baseTokenBalance: number,
  quoteTokenMetadata: TokenMetadata;
  quoteTokenBalance: number,
}

const FundsManagerColumn = ({
  baseTokenMetadata,
  baseTokenBalance,
  quoteTokenMetadata,
  quoteTokenBalance
}: FundsManagerColumnProps) => {
  const DEPOSIT_TAB = "Deposit";
  const WITHDRAW_TAB = "Withdraw";

  const [activeTab, setActiveTab] = useState("Deposit");

  const handleTabSelect = (selectedTab) => {
    console.log("doing: ", selectedTab);
    setActiveTab(selectedTab);
  };
  return (
    <div className={styles.fundsManagerContainer}>
      <div className={styles.fundsManagerButtonContainer}>
        <div
          className={styles.tabButtonContainer}
          onClick={() => handleTabSelect(DEPOSIT_TAB)}
          style={{
            color: activeTab === DEPOSIT_TAB ? "white" : "#888",
            border:
              activeTab === DEPOSIT_TAB
                ? `1px solid rgba(255, 255, 255, 1)`
                : `1px solid rgba(255, 255, 255, 0.5)`,
          }}
        >
          <Button
            className={styles.tabButton}
            style={{
              color: activeTab === DEPOSIT_TAB ? "white" : "#888",
            }}
          >
            Deposit
          </Button>
        </div>
        <div
          className={styles.tabButtonContainer}
          onClick={() => handleTabSelect(WITHDRAW_TAB)}
          style={{
            // color: activeTab === DEPOSIT_TAB ? 'white' : '#888',
            border:
              activeTab === WITHDRAW_TAB
                ? `1px solid rgba(255, 255, 255, 1)`
                : `1px solid rgba(255, 255, 255, 0.5)`,
          }}
        >
          <Button
            className={styles.tabButton}
            style={{
              color: activeTab === WITHDRAW_TAB ? "white" : "#888",
            }}
          >
            Withdraw
          </Button>
        </div>
      </div>
      <div className={styles.tokenFieldsContainer}>
        <div className={styles.tokenField}>
          <TokenField
            tokenMetadata={baseTokenMetadata}
            tokenBalance={baseTokenBalance}
          />
        </div>
        <div className={styles.tokenField}>
          <TokenField
            tokenMetadata={quoteTokenMetadata}
            tokenBalance={quoteTokenBalance}
          />
        </div>
      </div>
    </div>
  );
};

export default FundsManagerColumn;
