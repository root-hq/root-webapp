import React, { useEffect, useState } from "react";
import styles from "./MarketInfo.module.css";
import { Capacity, useCreateMarketContext } from "components/CreateMarketContextType";
import { Form } from "react-bootstrap";
import { WRAPPED_SOL_MAINNET, USDC_MAINNET } from "constants/";
import { getTokenInfo } from "utils";
import { web3 } from "@coral-xyz/anchor";

const MarketInfo = () => {

    const { quoteTokenMint, baseUnitsPerBaseLot, capacity, tickSizeInQuoteUnitsPerBaseUnit, setBaseUnitsPerBaseLot, setQuoteUnitsPerQuoteLot, setCapacity, setTickSizeInQuoteUnitsPerBaseUnit, getCapacityConfig} = useCreateMarketContext();

    useEffect(() => {
        const loadQuoteLotSize = async() => {
            if(quoteTokenMint) {
                const qtInfo = await getTokenInfo(new web3.PublicKey(quoteTokenMint));
                setQuoteUnitsPerQuoteLot(_ => (1 / Math.pow(10, qtInfo.decimals)).toString());    
            }
        }

        loadQuoteLotSize();
    }, [quoteTokenMint]);

    return (
        <div className={styles.tokenInfoContainer}>
            <div className={styles.headerContainer}>
                <h3>2. Enter market details</h3>
            </div>
            <div className={styles.formGroupContainer}>
                <Form.Group controlId="formInput" className={styles.formGroup}>
                    <div className={styles.formLabelAndFieldContainerNoBottomMargin}>
                        <Form.Label className={styles.formLabelContainer}>
                            <span>Minimum order size</span>
                        </Form.Label>
                        <Form.Control
                            placeholder={`Eg. 0.0001`}
                            style={{
                                backgroundColor: "transparent",
                                fontSize: "1rem",
                                fontWeight: "bold",
                                textAlign: "right",
                                color: "#ddd",
                                border: "1px solid rgba(87, 87, 87, 0.5)",
                                caretColor: "#ddd",
                                padding: "1rem",
                            }}
                            min="0"
                            step="0.01" // Allow any decimal value
                            className={styles.formFieldContainer}
                            onChange={(e) => {
                                setBaseUnitsPerBaseLot(_ => e.target.value)
                            }}
                            value={baseUnitsPerBaseLot} // Use inputText instead of inputAmount to show the decimal value
                        />
                    </div>
                </Form.Group>
            </div>
            <div className={styles.formGroupContainer}>
                <Form.Group controlId="formInput" className={styles.formGroup}>
                    <div className={styles.formLabelAndFieldContainerNoBottomMargin}>
                        <Form.Label className={styles.formLabelContainer}>
                            <span>Minimum price change</span>
                        </Form.Label>
                        <Form.Control
                            placeholder={`Eg. 0.0001`}
                            style={{
                                backgroundColor: "transparent",
                                fontSize: "1rem",
                                fontWeight: "bold",
                                textAlign: "right",
                                color: "#ddd",
                                border: "1px solid rgba(87, 87, 87, 0.5)",
                                caretColor: "#ddd",
                                padding: "1rem",
                            }}
                            min="0"
                            step="0.01" // Allow any decimal value
                            className={styles.formFieldContainer}
                            onChange={(e) => {
                                setTickSizeInQuoteUnitsPerBaseUnit(_ => e.target.value)
                            }}
                            value={tickSizeInQuoteUnitsPerBaseUnit} // Use inputText instead of inputAmount to show the decimal value
                        />
                    </div>
                </Form.Group>
            </div>
            <div className={styles.formGroupContainer}>
                <Form.Group controlId="formInput" className={styles.formGroup}>
                    <div className={styles.formLabelAndFieldContainerNoBottomMargin}>
                        <Form.Label className={styles.formLabelContainer}>
                            <span>Capacity</span>
                        </Form.Label>
                        <div className={styles.capacityButtonsContainer}>
                            <div className={styles.capacityButton}
                                style = {{
                                    color: capacity === Capacity.Low ? `#477df2` : ``,
                                    fontWeight: capacity === Capacity.Low ? `bold` : ``
                                }}
                                onClick={() => {
                                    setCapacity(_ => Capacity.Low)
                                }}
                            >
                                <span>Starter</span>
                            </div>
                            <div className={styles.capacityButton}
                                style = {{
                                    color: capacity === Capacity.Medium ? `#477df2` : ``,
                                    fontWeight: capacity === Capacity.Medium ? `bold` : ``
                                }}
                                onClick={() => {
                                    setCapacity(_ => Capacity.Medium)
                                }}
                            >
                                <span>Growth</span>
                            </div>
                            <div className={styles.capacityButton}
                                style = {{
                                    color: capacity === Capacity.High ? `#477df2` : ``,
                                    fontWeight: capacity === Capacity.High ? `bold` : ``
                                }}
                                onClick={() => {
                                    setCapacity(_ => Capacity.High)
                                }}
                            >
                                <span>Scale</span>
                            </div>
                        </div>
                    </div>
                </Form.Group>
            </div>
            <div className={styles.capacityTextContainer}>
                <span className={styles.capacityText}>
                    {`Maximum of ${getCapacityConfig()[0] * 2} active orders, maximum of ${getCapacityConfig()[1]} traders at any given time`}
                </span>
            </div>
            <div className={styles.capacityTextContainer}>
                <span className={styles.capacityText}>
                    {`Expected cost: ${(0.000006970 * (
                        capacity === Capacity.Low ?
                        84368
                        :
                            capacity === Capacity.Medium ?
                            444960
                            :
                                870944
                    )).toFixed(9)} SOL`}
                </span>
            </div>
        </div>
    )
}

export default MarketInfo;