import React, { useState } from "react";
import styles from "./FundsManagerColumn.module.css";
import { Button, Tooltip, OverlayTrigger } from "react-bootstrap";
import { TokenMetadata } from "../../../../../../utils/supabase";
import TokenField, { TokenFieldStateUtils } from "../TokenField";
import { useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import { VaultBalance } from "../../../../../../utils/root/utils";
const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("../../../../../../components/Wallet")).WalletMultiButton,
  { ssr: false },
);

export interface FundsManagerColumnProps {
  vaultAddress: string,
  vaultTokenBalance: VaultBalance;
  baseTokenMetadata: TokenMetadata;
  baseTokenBalance: number;
  quoteTokenMetadata: TokenMetadata;
  quoteTokenBalance: number;
}

const feeInfoTooltip = (
  <Tooltip id="tooltip">
    <div className={styles.feeTooltipContainer}>
      <span>We charge a performance fee of 20% on all profits earned</span>
    </div>
  </Tooltip>
);

const FundsManagerColumn = ({
  vaultAddress,
  vaultTokenBalance,
  baseTokenMetadata,
  baseTokenBalance,
  quoteTokenMetadata,
  quoteTokenBalance,
}: FundsManagerColumnProps) => {
  const DEPOSIT_TAB = "Deposit";
  const WITHDRAW_TAB = "Withdraw";

  const [activeTab, setActiveTab] = useState("Deposit");

  const handleTabSelect = (selectedTab) => {
    setActiveTab(selectedTab);
  };

  const walletState = useWallet();

  const [baseInputText, setBaseInputText] = useState<string>("");
  const [baseInputAmount, setBaseInputAmount] = useState<number>(0);

  const baseTokenFieldStateUtils = {
    inputText: baseInputText,
    inputAmount: baseInputAmount,
    setInputText: setBaseInputText,
    setInputAmount: setBaseInputAmount
  } as TokenFieldStateUtils;

  const [quoteInputText, setQuoteInputText] = useState<string>("");
  const [quoteInputAmount, setQuoteInputAmount] = useState<number>(0);

  const quoteTokenFieldStateUtils = {
    inputText: quoteInputText,
    inputAmount: quoteInputAmount,
    setInputText: setQuoteInputText,
    setInputAmount: setQuoteInputAmount
  } as TokenFieldStateUtils;

  return (
    <div className={styles.fundsManagerContainer}>
      <div className={styles.fundsManagerButtonContainer}>
        <div
          className={styles.tabButtonContainer}
          onClick={() => handleTabSelect(DEPOSIT_TAB)}
          style={{
            backgroundColor:
              activeTab === WITHDRAW_TAB ? "#1a1a1a" : "transparent",
            border:
              activeTab === DEPOSIT_TAB
                ? `1px solid rgba(255, 255, 255, 1)`
                : `1px solid rgba(255, 255, 255, 0.5)`,
            opacity: activeTab === WITHDRAW_TAB ? "0.6" : "1",
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
            backgroundColor:
              activeTab === DEPOSIT_TAB ? "#1a1a1a" : "transparent",
            border:
              activeTab === WITHDRAW_TAB
                ? `1px solid rgba(255, 255, 255, 1)`
                : `1px solid rgba(255, 255, 255, 0.5)`,
            opacity: activeTab === DEPOSIT_TAB ? "0.6" : "1",
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
            vaultAddress={vaultAddress}
            vaultTokenBalance={vaultTokenBalance}
            tokenMetadata={baseTokenMetadata}
            oppositeTokenMetadata={quoteTokenMetadata}
            tokenBalance={baseTokenBalance}
            tokenFieldStateUtils={baseTokenFieldStateUtils}
            oppositeStateUtils={quoteTokenFieldStateUtils}
            isBaseTokenField={true}
          />
        </div>
        <div className={styles.tokenField}>
          <TokenField
            vaultAddress={vaultAddress}
            vaultTokenBalance={vaultTokenBalance}
            tokenMetadata={quoteTokenMetadata}
            oppositeTokenMetadata={baseTokenMetadata}
            tokenBalance={quoteTokenBalance}
            tokenFieldStateUtils={quoteTokenFieldStateUtils}
            oppositeStateUtils={baseTokenFieldStateUtils}
            isBaseTokenField={false}
          />
        </div>
      </div>
      <div
        className={styles.actionButtonContainer}
        style = {{
          marginTop: walletState.connected ? '2rem' : '1rem'
        }}
      >
        {walletState.connected ? (
          <Button className={styles.actionButton}>
            {activeTab === DEPOSIT_TAB ? (
              <span className={styles.actionButtonText}>Deposit</span>
            ) : (
              <span className={styles.actionButtonText}>
                Withdraw all funds
              </span>
            )}
          </Button>
        ) : (
          <div className={styles.connectButtonContainer}>
            <WalletMultiButtonDynamic />
          </div>
        )}
      </div>
      <div className={styles.feeTextContainer}>
        <OverlayTrigger placement="top" overlay={feeInfoTooltip}>
          <span className={styles.feeText}>
            <u>How fees work?</u>
          </span>
        </OverlayTrigger>
      </div>
    </div>
  );
};

export default FundsManagerColumn;
