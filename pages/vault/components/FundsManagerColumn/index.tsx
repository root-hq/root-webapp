import React, { useState } from "react";
import styles from "./FundsManagerColumn.module.css";
import { Tabs, Tab, Row, Col, Container, Button, Form } from "react-bootstrap";
import { TokenMetadata } from "../../../../utils/supabase";
import Image from "next/image";

export interface FundsManagerColumnProps {
    baseTokenMetadata: TokenMetadata,
    quoteTokenMetadata: TokenMetadata
}

const FundsManagerColumn = ({ baseTokenMetadata, quoteTokenMetadata }: FundsManagerColumnProps) => {

    const DEPOSIT_TAB = "Deposit";
    const WITHDRAW_TAB = "Withdraw"; 

    const [activeTab, setActiveTab] = useState('Deposit');

    const handleTabSelect = (selectedTab) => {
        console.log('doing: ', selectedTab);
        setActiveTab(selectedTab);
    };
    return(
        <div className={styles.fundsManagerContainer}>
            <div className={styles.fundsManagerButtonContainer}>
                <div
                    className={styles.tabButtonContainer}
                    onClick={() => handleTabSelect(DEPOSIT_TAB)}
                    style = {{
                        color: activeTab === DEPOSIT_TAB ? 'white' : '#888',
                        border: activeTab === DEPOSIT_TAB ? `1px solid rgba(255, 255, 255, 1)` : `1px solid rgba(255, 255, 255, 0.5)`
                    }}
                >
                    <Button
                        className={styles.tabButton}
                        style = {{
                            color: activeTab === DEPOSIT_TAB ? 'white' : '#888',
                        }}
                    >
                        Deposit
                    </Button>
                </div>
                <div
                    className={styles.tabButtonContainer}
                    onClick={() => handleTabSelect(WITHDRAW_TAB)}
                    style = {{
                        // color: activeTab === DEPOSIT_TAB ? 'white' : '#888',
                        border: activeTab === WITHDRAW_TAB ? `1px solid rgba(255, 255, 255, 1)` : `1px solid rgba(255, 255, 255, 0.5)`
                    }}
                >
                    <Button
                        className={styles.tabButton}
                        style = {{
                            color: activeTab === WITHDRAW_TAB ? 'white' : '#888'
                        }}   
                    >
                        Withdraw
                    </Button>
                </div>
            </div>
            <div className={styles.tokenFieldContainer}>
                {/* <div className={styles.userBalanceContainer}>
                    <span className={styles.userBalanceText}>Balance</span>
                </div>
                <div className={styles.fieldContainer}>
                    <div className={styles.tokenDetailsContainer}>
                        <Image
                            src={baseTokenMetadata.img_url}
                            width={35}
                            height={35}
                            alt={`${baseTokenMetadata.ticker} img`}
                            className={styles.tokenImage}
                        />
                        <span className={styles.tokenName}>{baseTokenMetadata.ticker}</span>
                    </div>
                    <div className={styles.inputFieldContainer}>
                        <Form>
                            <Form.Group>
                                <Form.Control type="text-area"/>
                            </Form.Group>
                        </Form>
                    </div>
                </div> */}
            </div>
            <div className={styles.joinWaitlistContainer}>
                    <Button
                        className={styles.joinWaitlistButton}
                    >JOIN   WAITLIST</Button>
                </div>
        </div>
    );
}

export default FundsManagerColumn;