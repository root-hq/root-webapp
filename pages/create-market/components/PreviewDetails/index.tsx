import React, { useState } from "react";
import styles from "./PreviewDetails.module.css";
import { Capacity, useCreateMarketContext } from "components/CreateMarketContextType";
import { Form } from "react-bootstrap";
import { WRAPPED_SOL_MAINNET, USDC_MAINNET, ROOT_PROTOCOL_LAMPORT_COLLECTOR } from "constants/";
import { justFormatNumbersWithCommas } from "utils";

const PreviewDetails = () => {

    const {
        baseTokenMint,
        quoteTokenMint,
        baseUnitsPerBaseLot,
        quoteUnitsPerQuoteLot,
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
                            <span>Base lots per base unit</span>
                        </Form.Label>
                        <Form.Label className={styles.formFieldContainer}>
                            <span>{justFormatNumbersWithCommas((1 / parseFloat(baseUnitsPerBaseLot)).toString())}</span>
                        </Form.Label>
                    </div>
                </Form.Group>
            </div>
            <div className={styles.formGroupContainer}>
                <Form.Group controlId="formInput" className={styles.formGroup}>
                    <div className={styles.formLabelAndFieldContainerNoBottomMargin}>
                        <Form.Label className={styles.formLabelContainer}>
                            <span>Quote lots per quote unit</span>
                        </Form.Label>
                        <Form.Label className={styles.formFieldContainer}>
                            <span>{justFormatNumbersWithCommas((1 / parseFloat(quoteUnitsPerQuoteLot)).toString())}</span>
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
                            <span>Tick size in quote lots per base unit</span>
                        </Form.Label>
                        <Form.Label className={styles.formFieldContainer}>
                            <span>{justFormatNumbersWithCommas((parseFloat(tickSizeInQuoteUnitsPerBaseUnit) / parseFloat(quoteUnitsPerQuoteLot)).toFixed(0))}</span>
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
            <span style = {{marginTop: `2rem`, color: `#e3c334`}}>{`IMPORTANT: Your connected wallet will have a special authority over this market.`}</span>
            <span style = {{marginTop: `1rem`, color: `#e3c334`}}>{`Highly recommended to use a Ledger or SquadsX multisig extension`}</span>
        </div>
    )
}

export default PreviewDetails;