import React from "react";
import styles from "./KeyValueComponent.module.css";

export enum KeyValueJustification {
  SpaceBetween,
  SpaceAround,
}

export interface KeyValueComponentProps {
  keyElement: React.JSX.Element;
  keyElementStyle: React.CSSProperties;
  valueElement: React.JSX.Element;
  valueElementStyle: React.CSSProperties;
  justification: KeyValueJustification;
  keyElementContainerStyle?: React.CSSProperties;
  valueElementContainerStyle?: React.CSSProperties;
}

export const KeyValueComponent = ({
  keyElement,
  keyElementStyle,
  valueElement,
  valueElementStyle,
  justification,
  keyElementContainerStyle,
  valueElementContainerStyle,
}: KeyValueComponentProps) => {
  return (
    <div
      className={styles.keyValueContainer}
      style={{
        justifyContent:
          justification === KeyValueJustification.SpaceBetween
            ? "space-between"
            : "space-around",
      }}
    >
      <div
        className={styles.keyTextContainer}
        style={keyElementContainerStyle ? keyElementContainerStyle : {}}
      >
        <span style={keyElementStyle}>{keyElement}</span>
      </div>
      <div
        className={styles.valueTextContainer}
        style={valueElementContainerStyle ? valueElementContainerStyle : {}}
      >
        <span style={valueElementStyle}>{valueElement}</span>
      </div>
    </div>
  );
};

export default KeyValueComponent;
