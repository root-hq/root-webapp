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
                <div className={styles.tabButtonContainer}>
                    <Button
                        className={styles.tabButton}
                        onClick={() => handleTabSelect(DEPOSIT_TAB)}
                        style = {{
                            color: activeTab === DEPOSIT_TAB ? 'white' : '#888'
                        }}
                    >
                        Deposit
                    </Button>
                </div>
                <div className={styles.tabButtonContainer}>
                    <Button
                        className={styles.tabButton}
                        onClick={() => handleTabSelect('Withdraw')}
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
                <div className={styles.comingSoonText}>
                    <span>Coming Soon</span>
                </div>
            </div>
        </div>
    );
}

export default FundsManagerColumn;