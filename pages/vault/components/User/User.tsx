import React from "react";
import styles from "./User.module.css";
import FundsManagerColumn from "./components/FundsManagerColumn";
import { TokenMetadata } from "../../../../utils/supabase";
import PerformanceContainer from "./components/PerformanceContainer";

export interface UserProps {
  baseTokenMetadata: TokenMetadata;
  baseTokenBalance: number;
  quoteTokenMetadata: TokenMetadata;
  quoteTokenBalance: number;
}
const User = ({
  baseTokenMetadata,
  baseTokenBalance,
  quoteTokenMetadata,
  quoteTokenBalance,
}: UserProps) => {
  return (
    <div className={styles.userContainer}>
      <div className={styles.performanceContainer}>
        <PerformanceContainer />
      </div>
      <div className={styles.depositContainer}>
        <FundsManagerColumn
          baseTokenMetadata={baseTokenMetadata}
          baseTokenBalance={baseTokenBalance}
          quoteTokenMetadata={quoteTokenMetadata}
          quoteTokenBalance={quoteTokenBalance}
        />
      </div>
    </div>
  );
};

export default User;
