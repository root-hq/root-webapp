import React from 'react';
import { useBottomStatus } from '../BottomStatusContext';
import styles from './BottomStatusBar.module.css';

const BottomStatusBar: React.FC = () => {
  const { status, textStyle, statusBarStyle } = useBottomStatus();

  return (
    <div
      className={styles.bottomStatusBarContainer}
      style = {
        statusBarStyle ? statusBarStyle : {}
      }
    >
      <div
        className={styles.statusMessage}
        style = {
          textStyle ? textStyle : {}
        }
      >
        {status}
      </div>
    </div>
  );
};

export default BottomStatusBar;
