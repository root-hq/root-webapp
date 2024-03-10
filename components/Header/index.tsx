import React, { useState } from "react";
import Logo from "../Logo";
import styles from "./Header.module.css";
import Link from "next/link";
import dynamic from "next/dynamic";
import { PageTab } from "constants/";
import { useRootState } from "components/RootStateContextType";
import { useRouter } from "next/router";
const WalletMultiButtonDynamic = dynamic(
  async () => (await import("../Wallet")).WalletMultiButton,
  { ssr: false },
);

const Header = () => {

  const router = useRouter();
  const isMarket = router.query[`market`];
  const isBot = router.query[`bot`];

  const { activeTab, setActiveTab } = useRootState();

  const handleActiveTabChange = (newTab: PageTab) => {
    setActiveTab(newTab);
    if(newTab === PageTab.Bots) {
      router.push('/bot/4DoNfFBfF7UokCC2FQzriy7yHK6DY6NVdYpuekQ5pRgg');
    }
    else if(newTab === PageTab.Trade) {
      router.push('/market/4DoNfFBfF7UokCC2FQzriy7yHK6DY6NVdYpuekQ5pRgg');
    }
  }
  
  return (
    <div className={styles.headerContainer}>
      <div className={styles.logoContainer}>
        <div className={styles.logo}>
          <Link href="/">
            <Logo />
          </Link>
        </div>
      </div>
      <div className={styles.tabButtonsContainer}>
        <div className={styles.tabButton}
          onClick={() => {
            handleActiveTabChange(PageTab.Trade)
          }}
          style={{
            color: activeTab === PageTab.Trade ? `#477df2` : ``,
            fontWeight: activeTab === PageTab.Trade ? `bold` : ``
          }}
        >
          Trade
        </div>
        <div className={styles.tabButton}
          onClick={() => {
            handleActiveTabChange(PageTab.Bots)
          }}
          style = {{
            color: activeTab === PageTab.Bots ? `#477df2` : ``,
            fontWeight: activeTab === PageTab.Bots ? `bold` : ``
          }}
        >
          Bots
        </div>
      </div>
      <div className={styles.actionButtonsContainer}>
        {/* <div className={styles.fundsButtonContainer}>
          <span><i className="fa-solid fa-circle-dollar-to-slot"></i></span>
          <span>Funds</span>
        </div> */}
        <div className={styles.walletButtonContainer}>
          <WalletMultiButtonDynamic />
        </div>
      </div>
    </div>
  );
};

export default Header;
