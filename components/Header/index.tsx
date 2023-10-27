import React from "react";
import Logo from "../Logo";
import styles from "./Header.module.css";
import Link from "next/link";
import dynamic from "next/dynamic";
const WalletMultiButtonDynamic = dynamic(
  async () => (await import("../Wallet")).WalletMultiButton,
  { ssr: false },
);

const Header = () => {
  return (
    <div
      className={styles.headerContainer}
      // style={{
      //   maxWidth: '1200px'
      // }}
    >
      <div className={styles.logoContainer}>
        <div className={styles.logo}>
          <Link href="/">
            <Logo />
          </Link>
        </div>
      </div>
      <div className={styles.walletButtonContainer}>
        <div className={styles.walletButton}>
          <WalletMultiButtonDynamic />
        </div>
      </div>
    </div>
  );
};

export default Header;
