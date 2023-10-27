import React from 'react';
import styles from "./UserFunds.module.css";
import KeyValueComponent, { KeyValueJustification } from '../../../../../../components/KeyValueComponent';
import { TokenMetadata } from '../../../../../../utils/supabase';

export interface UserFundsProps {
    baseTokenMetadata: TokenMetadata,
    quoteTokenMetadata: TokenMetadata
}

const UserFunds = ({
    baseTokenMetadata,
    quoteTokenMetadata
}: UserFundsProps) => {
    return (
        <div className={styles.userFundsContainer}>
            <div className={styles.userFundsTitleContainer}>
                <span className={styles.userFundsTitle}>
                    Your portfolio
                </span>
            </div>
            <div className={styles.userFundsDetailsContainer}>
                <div className={styles.userFundsDetail}>
                    {
                        baseTokenMetadata && baseTokenMetadata.ticker ?
                            <KeyValueComponent
                                keyElement={
                                    <span>{`${baseTokenMetadata.ticker} balance`}</span>
                                }
                                keyElementStyle={{
                                    color: '#888',
                                    fontWeight: 'bold'
                                }}
                                valueElement={
                                    <span>{`25.52`}</span>
                                }
                                valueElementStyle={{
                                    color: '#fff',
                                    fontWeight: 'bold'
                                }}
                                justification={KeyValueJustification.SpaceBetween}
                            />
                        :
                            <></>
                    }
                </div>
                <div className={styles.userFundsDetail}>
                    {
                        quoteTokenMetadata && quoteTokenMetadata.ticker ?
                            <KeyValueComponent
                                keyElement={
                                    <span>{`${quoteTokenMetadata.ticker} balance`}</span>
                                }
                                keyElementStyle={{
                                    color: '#888',
                                    fontWeight: 'bold'
                                }}
                                valueElement={
                                    <span>{`10,365.98`}</span>
                                }
                                valueElementStyle={{
                                    color: '#fff',
                                    fontWeight: 'bold'
                                }}
                                justification={KeyValueJustification.SpaceBetween}
                            />
                        :
                            <></>
                    }
                </div>
            </div>
            <div className={styles.userProfitabilityTextContainer}>
                <KeyValueComponent
                    keyElement={
                        <span>{`Net profits`}</span>
                    }
                    keyElementStyle={{
                        color: '#888',
                        fontWeight: 'bold'
                    }}
                    valueElement={
                        <span>{`+ $11.92`}</span>
                    }
                    valueElementStyle={{
                        color: '#35c674',
                        fontWeight: 'bold'
                    }}
                    justification={KeyValueJustification.SpaceBetween}
                />
            </div>
        </div>
    )
}

export default UserFunds;