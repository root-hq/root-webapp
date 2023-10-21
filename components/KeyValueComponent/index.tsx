import React from "react";
import styles from './KeyValueComponent.module.css';

export enum KeyValueJustification {
    SpaceBetween,
    SpaceAround
}

export interface KeyValueComponentProps {
    keyElement: React.JSX.Element,
    keyElementStyle: React.CSSProperties,
    valueElement: React.JSX.Element,
    valueElementStyle: React.CSSProperties,
    justification: KeyValueJustification,
}

export const KeyValueComponent = ({keyElement, keyElementStyle,  valueElement, valueElementStyle, justification}: KeyValueComponentProps) => {
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
                <span style = {keyElementStyle}>{keyElement}</span>
            </div>
            <div className={styles.valueTextContainer}>
                <span style = {valueElementStyle}>{valueElement}</span>
            </div>
        </div>
    );
}

export default KeyValueComponent;