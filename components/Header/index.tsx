import React from 'react';
import Logo from '../Logo';
import styles from './Header.module.css';

const Header = () => {
  return (
    <div
      className={styles.headerContainer}
        // style={{
        //   maxWidth: '1200px'
        // }}
    >
      <div>
        <Logo />
      </div>
      <div className={styles.socialButtonContainer}>
        <div className={styles.socialButton}>
            <a
                href = {`https://twitter.com/roothq_`}
                target = "_blank"
            >
                <i className="fa-brands fa-twitter"></i>
            </a>
        </div>
        <div className={styles.socialButton}>
            <a
                href = {`https://github.com/root-hq`}
                target = "_blank"
            >
                <i className="fa-brands fa-github"></i>
            </a>
        </div>
      </div>
    </div>
  );
};

export default Header;
