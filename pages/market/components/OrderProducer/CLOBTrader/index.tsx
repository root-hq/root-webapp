import React, { useState } from 'react';
import styles from "./CLOBTrader.module.css";

const CLOBTrader = () => {
  const [isToggleBuy, setIsToggleBuy] = useState(true);

  const handleToggle = (type: string) => {
    if(type === "buy") {
        setIsToggleBuy(_ => true);
    }
    else {
        setIsToggleBuy(_ => false);
    }
  }

  return (
    <div className={styles.clobTraderContainer}>
       <div className={styles.tabsContainer}>
            <div className={styles.buyTabContainer}>
                <button
                    className={styles.buyButton}
                    style = {{
                        borderTop: isToggleBuy ? '2px solid green' : '',
                        borderBottom: isToggleBuy ? 'none' : '1px solid rgba(87, 87, 87, 0.25)'
                    }}
                    onClick={() => {
                        handleToggle("buy")
                    }}
                >
                    Buy
                </button>
            </div>
            <div className={styles.sellTabContainer}>
                <button 
                    className={styles.sellButton}
                    style = {{
                        borderTop: !isToggleBuy ? '2px solid red' : '',
                        borderBottom: !isToggleBuy ? 'none' : '1px solid rgba(87, 87, 87, 0.25)'
                    }}
                    onClick={() => {
                        handleToggle("sell")
                    }}
                >
                    Sell
                </button>
            </div>
       </div>
    </div>
  );
}

export default CLOBTrader;
