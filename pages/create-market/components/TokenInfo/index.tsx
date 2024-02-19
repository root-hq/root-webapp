import React, { useState } from "react";
import styles from "./TokenInfo.module.css";
import { useCreateMarketContext } from "components/CreateMarketContextType";
import { Form } from "react-bootstrap";
import { WRAPPED_SOL_MAINNET, USDC_MAINNET } from "constants/";

const TokenInfo = () => {

    const { baseTokenMint, quoteTokenMint, rawBaseUnitsPerBaseUnit, setBaseTokenMint, setQuoteTokenMint, setRawBaseUnitsPerBaseUnit} = useCreateMarketContext();

    return (
        <div className={styles.tokenInfoContainer}>
            <div className={styles.headerContainer}>
                <h3>1. Enter token details</h3>
            </div>
            <div className={styles.formGroupContainer}>
                <Form.Group controlId="formInput" className={styles.formGroup}>
                    <div className={styles.formLabelAndFieldContainerNoBottomMargin}>
                        <Form.Label className={styles.formLabelContainer}>
                            <span>Base token mint</span>
                        </Form.Label>
                        <Form.Control
                            placeholder={`Eg. ${WRAPPED_SOL_MAINNET}`}
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
                                setBaseTokenMint(_ => e.target.value)
                            }}
                            value={baseTokenMint} // Use inputText instead of inputAmount to show the decimal value
                        />
                    </div>
                </Form.Group>
            </div>
            <div className={styles.formGroupContainer}>
                <Form.Group controlId="formInput" className={styles.formGroup}>
                    <div className={styles.formLabelAndFieldContainerNoBottomMargin}>
                        <Form.Label className={styles.formLabelContainer}>
                            <span>Quote token mint</span>
                        </Form.Label>
                        <Form.Control
                            placeholder={`Eg. ${USDC_MAINNET}`}
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
                                setQuoteTokenMint(_ => e.target.value)
                            }}
                            value={quoteTokenMint} // Use inputText instead of inputAmount to show the decimal value
                        />
                    </div>
                </Form.Group>
            </div>
            <div className={styles.formGroupContainer}>
                <Form.Group controlId="formInput" className={styles.formGroup}>
                    <div className={styles.formLabelAndFieldContainerNoBottomMargin}>
                        <Form.Label className={styles.formLabelContainer}>
                            <span>Base units multiplier</span>
                        </Form.Label>
                        <Form.Control
                            placeholder={`Eg. 1.0`}
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
                                setRawBaseUnitsPerBaseUnit(_ => e.target.value)
                            }}
                            value={rawBaseUnitsPerBaseUnit} // Use inputText instead of inputAmount to show the decimal value
                        />
                    </div>
                </Form.Group>
            </div>
        </div>
    )
}

export default TokenInfo;