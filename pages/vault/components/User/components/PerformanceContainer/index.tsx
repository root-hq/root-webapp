import React, { useState } from "react";
import styles from "./PerformanceContainer.module.css";
import { Button } from "react-bootstrap";

export interface PerformanceContainerProps {}

enum SelectedDuration {
  Day,
  Week,
  Year,
}

const PerformanceContainer = () => {
  const [selectedDuration, setSelectedDuration] = useState<SelectedDuration>(
    SelectedDuration.Day,
  );

  const handleDurationChange = (e) => {
    const duration = e.target.value;
    if (duration === "24h") {
      setSelectedDuration((prev) => SelectedDuration.Day);
    } else if (duration === "7d") {
      setSelectedDuration((prev) => SelectedDuration.Week);
    } else if (duration === "1y") {
      setSelectedDuration((prev) => SelectedDuration.Year);
    }
  };

  return (
    <div className={styles.performanceContainer}>
      <div className={styles.optionsContainer}>
        <div className={styles.metricContainer}>
          <span className={styles.metric}>APR</span>
        </div>
        <div className={styles.durationSelectorContainer}>
          <Button
            className={styles.durationSelector}
            onClick={(e) => {
              handleDurationChange(e);
            }}
            value={"24h"}
            style={{
              color:
                selectedDuration === SelectedDuration.Day ? "#ddd" : "#888",
              fontWeight:
                selectedDuration === SelectedDuration.Day ? "bold" : "normal",
            }}
          >
            24h
          </Button>
          <Button
            className={styles.durationSelector}
            onClick={(e) => {
              handleDurationChange(e);
            }}
            value={"7d"}
            style={{
              color:
                selectedDuration === SelectedDuration.Week ? "#ddd" : "#888",
              fontWeight:
                selectedDuration === SelectedDuration.Week ? "bold" : "normal",
            }}
          >
            7d
          </Button>
          <Button
            className={styles.durationSelector}
            onClick={(e) => {
              handleDurationChange(e);
            }}
            value={"1y"}
            style={{
              color:
                selectedDuration === SelectedDuration.Year ? "#ddd" : "#888",
              fontWeight:
                selectedDuration === SelectedDuration.Year ? "bold" : "normal",
            }}
          >
            1y
          </Button>
        </div>
      </div>
      <div className={styles.metricValueContainer}>
        <span className={styles.metricValue}>29.31%</span>
      </div>
    </div>
  );
};

export default PerformanceContainer;
