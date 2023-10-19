import React, { useState } from "react";
import styles from "./FundsManagerColumn.module.css";
import { Tabs, Tab, Row, Col, Container, Button } from "react-bootstrap";

const FundsManagerColumn = () => {

    const [activeTab, setActiveTab] = useState('Deposit');

    const handleTabSelect = (selectedTab) => {
        setActiveTab(selectedTab);
    };
    return(
        <div className={styles.fundsManagerContainer}>
            <div className={styles.tabButtonContainer}>
                <Button className={styles.tabButton}>
                    Deposit
                </Button>
            </div>
            <div className={styles.tabButtonContainer}>
                <Button className={styles.tabButton}>
                    Withdraw
                </Button>
            </div>
        </div>
    );
}

export default FundsManagerColumn;