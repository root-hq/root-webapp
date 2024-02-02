import React, { useState } from "react";
import styles from "./OrderManager.module.css";

const OrderManager = () => {

    const [allMarketsSelector, setAllMarketsSelector] = useState<boolean>(true);


    return (
        <div className={styles.orderManagerContainer}>
            <div className={styles.topMenuContainer}>
                <span className={styles.orderTitleContainer}>Orders</span>
                <div className={styles.topMenuButtonContainer}>
                    <div className={styles.allMarketsDropdownContainer}>
                        <>All markets</>
                    </div>
                    <div className={styles.orderStatusDropdownContainer}>
                        <>All orders</>
                    </div>
                    <div className={styles.cancelAllButtonContainer}>
                        <button>Cancel all</button>
                    </div>
                </div>
            </div>
            <div>
                {/* One interface to manage all orders */}
            </div>
        </div>
    )
}

export default OrderManager;