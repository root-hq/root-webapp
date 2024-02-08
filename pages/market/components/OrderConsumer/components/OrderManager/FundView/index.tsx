import React, { useEffect, useState } from "react";
import styles from "./FundView.module.css";
import { TokenMetadata } from "utils";

export interface FundViewProps {
  tokenMetadata: TokenMetadata;
  walletBalance: number;
  activeOrdersBalance: number;
  withdrawableBalance: number;
}

const FundView = ({
  tokenMetadata,
  walletBalance,
  activeOrdersBalance,
  withdrawableBalance,
}: FundViewProps) => {
  const [totalBalance, setTotalBalance] = useState<number>();

  useEffect(() => {
    let balance = walletBalance + activeOrdersBalance + withdrawableBalance;
    setTotalBalance((_) => balance);
  }, [tokenMetadata, walletBalance, activeOrdersBalance, withdrawableBalance]);

  return (
    <div className={styles.fundViewOuterContainer}>
      <div className={styles.fundViewContainer}>
        <div className={styles.columnNameRow}>
          <span className={styles.columnName}>
            {tokenMetadata ? tokenMetadata.ticker : ""}
          </span>
        </div>
        <div className={styles.columnNameRow}>
          <span className={styles.columnName}>
            {walletBalance ? walletBalance.toFixed(tokenMetadata ? tokenMetadata.decimals : 4) : "0.0"}
          </span>
        </div>
        <div className={styles.columnNameRow}>
          <span className={styles.columnName}>
            {activeOrdersBalance ? activeOrdersBalance.toFixed(tokenMetadata ? tokenMetadata.decimals : 4) : "0.0"}
          </span>
        </div>
        <div className={styles.columnNameRow}>
          <span className={styles.columnName}>
            {withdrawableBalance ? withdrawableBalance.toFixed(tokenMetadata ? tokenMetadata.decimals : 4) : "0.0"}
          </span>
        </div>
        <div className={styles.columnNameRow}>
          <span className={styles.columnName}>
            {totalBalance ? totalBalance.toFixed(tokenMetadata ? tokenMetadata.decimals : 4) : "0.0"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FundView;
