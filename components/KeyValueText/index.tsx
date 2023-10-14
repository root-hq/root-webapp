import React from "react";
import styles from './KeyValueText.module.css';

export enum KeyValueJustification {
    SpaceBetween,
    SpaceAround
}

export interface KeyValueText {
    keyText: string,
    keyTextStyle: React.CSSProperties,
    valueText: string,
    valueTextStyle: React.CSSProperties,
    justification: KeyValueJustification,
}

export const KeyValueText = ({keyText, keyTextStyle,  valueText, valueTextStyle, justification}: KeyValueText) => {
    return (
        <div
            className={styles.keyValueContainer}
            style = {
                {
                    justifyContent: justification === KeyValueJustification.SpaceBetween ? "space-between" : "space-around"
                }
            }
        >
            <div className={styles.keyTextContainer}>
                <span style = {keyTextStyle}>{keyText}</span>
            </div>
            <div className={styles.valueTextContainer}>
                <span style = {valueTextStyle}>{valueText}</span>
            </div>
        </div>
    );
}

export default KeyValueText;