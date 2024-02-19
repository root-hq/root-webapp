import React, { useState } from "react";
import styles from "./PreviewDetails.module.css";
import { Capacity, useCreateMarketContext } from "components/CreateMarketContextType";
import { Form } from "react-bootstrap";
import { WRAPPED_SOL_MAINNET, USDC_MAINNET, ROOT_PROTOCOL_LAMPORT_COLLECTOR } from "constants/";

const PreviewDetails = () => {

    const {
        baseTokenMint,
        quoteTokenMint,
        baseLotsPerBaseUnit,
        quoteLotsPerQuoteUnit,
        rawBaseUnitsPerBaseUnit,
        tickSizeInQuoteUnitsPerBaseUnit,
        capacity,
        takerFeeInBps,
        feeCollector
    } = useCreateMarketContext();

    return (
        <div className={styles.tokenInfoContainer}>
            <div className={styles.headerContainer}>
                <h3>4. Preview</h3>
            </div>
            <div className={styles.formGroupContainer}>
                <Form.Group controlId="formInput" className={styles.formGroup}>
                    <div className={styles.formLabelAndFieldContainerNoBottomMargin}>
                        <Form.Label className={styles.formLabelContainer}>
                            <span>Base token mint</span>
                        </Form.Label>
                        <Form.Label className={styles.formFieldContainer}>
                            <span>{baseTokenMint}</span>
                        </Form.Label>
                    </div>
                </Form.Group>
            </div>
            <div className={styles.formGroupContainer}>
                <Form.Group controlId="formInput" className={styles.formGroup}>
                    <div className={styles.formLabelAndFieldContainerNoBottomMargin}>
                        <Form.Label className={styles.formLabelContainer}>
                            <span>Quote token mint</span>
                        </Form.Label>
                        <Form.Label className={styles.formFieldContainer}>
                            <span>{quoteTokenMint}</span>
                        </Form.Label>
                    </div>
                </Form.Group>
            </div>
            <div className={styles.formGroupContainer}>
                <Form.Group controlId="formInput" className={styles.formGroup}>
                    <div className={styles.formLabelAndFieldContainerNoBottomMargin}>
                        <Form.Label className={styles.formLabelContainer}>
                            <span>Base units per base lot</span>
                        </Form.Label>
                        <Form.Label className={styles.formFieldContainer}>
                            <span>{baseLotsPerBaseUnit}</span>
                        </Form.Label>
                    </div>
                </Form.Group>
            </div>
            <div className={styles.formGroupContainer}>
                <Form.Group controlId="formInput" className={styles.formGroup}>
                    <div className={styles.formLabelAndFieldContainerNoBottomMargin}>
                        <Form.Label className={styles.formLabelContainer}>
                            <span>Quote units per quote lot</span>
                        </Form.Label>
                        <Form.Label className={styles.formFieldContainer}>
                            <span>{quoteLotsPerQuoteUnit}</span>
                        </Form.Label>
                    </div>
                </Form.Group>
            </div>
            <div className={styles.formGroupContainer}>
                <Form.Group controlId="formInput" className={styles.formGroup}>
                    <div className={styles.formLabelAndFieldContainerNoBottomMargin}>
                        <Form.Label className={styles.formLabelContainer}>
                            <span>Raw base units per base unit</span>
                        </Form.Label>
                        <Form.Label className={styles.formFieldContainer}>
                            <span>{rawBaseUnitsPerBaseUnit}</span>
                        </Form.Label>
                    </div>
                </Form.Group>
            </div>
            <div className={styles.formGroupContainer}>
                <Form.Group controlId="formInput" className={styles.formGroup}>
                    <div className={styles.formLabelAndFieldContainerNoBottomMargin}>
                        <Form.Label className={styles.formLabelContainer}>
                            <span>Tick size in quote units per base unit</span>
                        </Form.Label>
                        <Form.Label className={styles.formFieldContainer}>
                            <span>{tickSizeInQuoteUnitsPerBaseUnit}</span>
                        </Form.Label>
                    </div>
                </Form.Group>
            </div>
            <div className={styles.formGroupContainer}>
                <Form.Group controlId="formInput" className={styles.formGroup}>
                    <div className={styles.formLabelAndFieldContainerNoBottomMargin}>
                        <Form.Label className={styles.formLabelContainer}>
                            <span>Capacity</span>
                        </Form.Label>
                        <Form.Label className={styles.formFieldContainer}>
                            <span>{
                                capacity === Capacity.Low ?
                                    `Regular`
                                :
                                    capacity === Capacity.Medium ?
                                        `Growth`
                                    :
                                        `Scale`
                            }</span>
                        </Form.Label>
                    </div>
                </Form.Group>
            </div>
            <div className={styles.formGroupContainer}>
                <Form.Group controlId="formInput" className={styles.formGroup}>
                    <div className={styles.formLabelAndFieldContainerNoBottomMargin}>
                        <Form.Label className={styles.formLabelContainer}>
                            <span>Taker fee bps</span>
                        </Form.Label>
                        <Form.Label className={styles.formFieldContainer}>
                            <span>{takerFeeInBps}</span>
                        </Form.Label>
                    </div>
                </Form.Group>
            </div>
            <div className={styles.formGroupContainer}>
                <Form.Group controlId="formInput" className={styles.formGroup}>
                    <div className={styles.formLabelAndFieldContainerNoBottomMargin}>
                        <Form.Label className={styles.formLabelContainer}>
                            <span>Fee collector</span>
                        </Form.Label>
                        <Form.Label className={styles.formFieldContainer}>
                            <span>{feeCollector}</span>
                        </Form.Label>
                    </div>
                </Form.Group>
            </div>
        </div>
    )
}

export default PreviewDetails;