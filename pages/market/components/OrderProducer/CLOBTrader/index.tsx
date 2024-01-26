import React, { useState } from 'react';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import styles from "./CLOBTrader.module.css";
import { Button } from 'react-bootstrap';

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
                <Button
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
                </Button>
            </div>
            <div className={styles.sellTabContainer}>
                <Button 
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
                </Button>
            </div>
       </div>
    </div>
  );
}

export default CLOBTrader;
