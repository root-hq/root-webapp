import React from "react";
import Logo from "../Logo";
import styles from "./Header.module.css";
import Link from "next/link";

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
          <span className={styles.walletButtonText}>Account</span>
        </div>
      </div>
    </div>
  );
};

export default Header;
