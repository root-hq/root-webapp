import React from "react";
import styles from './KeyValueComponent.module.css';

export enum KeyValueJustification {
    SpaceBetween,
    SpaceAround
}

export interface KeyValueComponentProps {
    keyElement: React.JSX.Element,
    keyTextStyle: React.CSSProperties,
    valueElement: React.JSX.Element,
    valueTextStyle: React.CSSProperties,
    justification: KeyValueJustification,
}

export const KeyValueComponent = ({keyElement, keyTextStyle,  valueElement, valueTextStyle, justification}: KeyValueComponentProps) => {
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
                <span style = {keyTextStyle}>{keyElement}</span>
            </div>
            <div className={styles.valueTextContainer}>
                <span style = {valueTextStyle}>{valueElement}</span>
            </div>
        </div>
    );
}

export default KeyValueComponent;