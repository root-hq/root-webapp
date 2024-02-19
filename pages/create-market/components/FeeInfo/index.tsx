import React, { useState } from "react";
import styles from "./FeeInfo.module.css";
import { useCreateMarketContext } from "components/CreateMarketContextType";
import { Form } from "react-bootstrap";
import { WRAPPED_SOL_MAINNET, USDC_MAINNET, ROOT_PROTOCOL_LAMPORT_COLLECTOR } from "constants/";

const FeeInfo = () => {

    const { feeCollector, takerFeeInBps, setFeeCollector, setTakerFeeInBps} = useCreateMarketContext();

    return (
        <div className={styles.tokenInfoContainer}>
            <div className={styles.headerContainer}>
                <h3>3. Enter fee details</h3>
            </div>
            <div className={styles.formGroupContainer}>
                <Form.Group controlId="formInput" className={styles.formGroup}>
                    <div className={styles.formLabelAndFieldContainerNoBottomMargin}>
                        <Form.Label className={styles.formLabelContainer}>
                            <span>Taker fee in bps</span>
                        </Form.Label>
                        <Form.Control
                            placeholder={`Eg. 2`}
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
                                setTakerFeeInBps(_ => e.target.value)
                            }}
                            value={takerFeeInBps} // Use inputText instead of inputAmount to show the decimal value
                        />
                    </div>
                </Form.Group>
            </div>
            <div className={styles.formGroupContainer}>
                <Form.Group controlId="formInput" className={styles.formGroup}>
                    <div className={styles.formLabelAndFieldContainerNoBottomMargin}>
                        <Form.Label className={styles.formLabelContainer}>
                            <span>Fee collector</span>
                        </Form.Label>
                        <Form.Control
                            placeholder={`Eg. ${ROOT_PROTOCOL_LAMPORT_COLLECTOR}`}
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
                                setFeeCollector(_ => e.target.value)
                            }}
                            value={feeCollector} // Use inputText instead of inputAmount to show the decimal value
                        />
                    </div>
                </Form.Group>
            </div>
        </div>
    )
}

export default FeeInfo;