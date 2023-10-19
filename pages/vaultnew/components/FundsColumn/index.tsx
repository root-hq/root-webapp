import React from "react";
import styles from "./FundsColumn.module.css";
import KeyValueComponent, { KeyValueJustification } from "../../../../components/KeyValueComponent";

export interface FundsColumnProps {
    baseTokenTicker: string,
    quoteTokenTicker: string,
    baseTokenPrice: number,
    baseTokenBalance: number,
    quoteTokenPrice: number,
    quoteTokenBalance: number
}

const FundsColumn = ({
    baseTokenTicker,
    quoteTokenTicker,
    baseTokenPrice,
    baseTokenBalance,
    quoteTokenPrice,
    quoteTokenBalance
}: FundsColumnProps) => {

    if(!baseTokenPrice) {
        baseTokenPrice = 0;
    }

    if(!baseTokenBalance) {
        baseTokenBalance = 0;
    }

    if(!quoteTokenPrice) {
        quoteTokenPrice = 0;
    }

    if(!quoteTokenBalance) {
        quoteTokenBalance = 0;
    }

    return (
        <div className={styles.userFundsContainer}>
            <div className={styles.vaultDepositContainer}>
                <span className={styles.vaultDepositTitle}>Vault Deposits</span>
            </div>
            {
                baseTokenTicker && quoteTokenTicker ?
                    <>
                        <div className={styles.keyValueContainer}>
                            <KeyValueComponent
                                keyElement={<span>{`${baseTokenTicker} balance`}</span>}
                                keyTextStyle={{
                                    color: `#767676`,
                                    fontWeight: 'bold'
                                }}
                                valueElement={<span>{
                                    baseTokenBalance && typeof baseTokenBalance === 'number' ?
                                        <>{`${baseTokenBalance.toFixed(4)} ($${(baseTokenPrice * baseTokenBalance).toFixed(4)})`}</>
                                    :
                                        <>-</>
                                }</span>}
                                valueTextStyle={{
                                    color: 'white',
                                    fontWeight: 'bold'
                                }}
                                justification={KeyValueJustification.SpaceBetween}
                            />
                        </div>
                        <div className={styles.keyValueContainer}>
                            <KeyValueComponent
                                keyElement={<span>{`${quoteTokenTicker} balance`}</span>}
                                keyTextStyle={{
                                    color: `#767676`,
                                    fontWeight: 'bold'
                                }}
                                valueElement={<span>{
                                    quoteTokenBalance && typeof quoteTokenBalance === 'number' ?
                                        <>{`${quoteTokenBalance.toFixed(4)} ($${(quoteTokenPrice * quoteTokenBalance).toFixed(4)})`}</>
                                    :
                                        <>-</>
                                }</span>}
                                valueTextStyle={{
                                    color: 'white',
                                    fontWeight: 'bold'
                                }}
                                justification={KeyValueJustification.SpaceBetween}
                            />
                        </div>
                    </>
                :
                    <></>
            }
        </div>
    );
}

export default FundsColumn;