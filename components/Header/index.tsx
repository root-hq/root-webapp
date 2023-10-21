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
      <div className={styles.socialButtonContainer}>
        <div className={styles.socialButton}>
          <Link href={`https://twitter.com/roothq_`} target="_blank">
            <i className="fa-brands fa-twitter"></i>
          </Link>
        </div>
        <div className={styles.socialButton}>
          <Link href={`https://github.com/root-hq`} target="_blank">
            <i className="fa-brands fa-github"></i>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Header;
