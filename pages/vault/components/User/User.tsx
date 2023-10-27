import React from "react";
import styles from "./User.module.css";
import FundsManagerColumn from "./components/FundsManagerColumn";
import { TokenMetadata } from "../../../../utils/supabase";
import PerformanceContainer from "./components/PerformanceContainer";
import UserFunds from "./components/UserFunds";
import { useWallet } from "@solana/wallet-adapter-react";

export interface UserProps {
  vaultAddress: string,
  baseTokenMetadata: TokenMetadata;
  baseTokenBalance: number;
  quoteTokenMetadata: TokenMetadata;
  quoteTokenBalance: number;
}
const User = ({
  vaultAddress,
  baseTokenMetadata,
  baseTokenBalance,
  quoteTokenMetadata,
  quoteTokenBalance,
}: UserProps) => {

  const walletState = useWallet();

  return (
    <div className={styles.userContainer}>
      <div className={styles.performanceContainer}>
        <PerformanceContainer />
      </div>
      <div className={styles.depositContainer}>
        <FundsManagerColumn
          vaultAddress={vaultAddress}
          baseTokenMetadata={baseTokenMetadata}
          baseTokenBalance={baseTokenBalance}
          quoteTokenMetadata={quoteTokenMetadata}
          quoteTokenBalance={quoteTokenBalance}
        />
      </div>
      <div className={styles.userPortfolioContainer}>
        {
          walletState.connected ?
            <UserFunds
              baseTokenMetadata={baseTokenMetadata}
              quoteTokenMetadata={quoteTokenMetadata}
            />
          :
            <></>
        }
      </div>
    </div>
  );
};

export default User;
