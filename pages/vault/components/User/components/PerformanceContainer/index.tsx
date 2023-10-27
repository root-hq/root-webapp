import React, { useState } from "react";
import styles from "./PerformanceContainer.module.css";
import { Button } from "react-bootstrap";

export interface PerformanceContainerProps {}

enum SelectedDuration {
  Day,
  Week,
  Year,
}

enum SelectedMetric {
  Apr,
  Markout,
  Volume
}

const PerformanceContainer = () => {
  const [selectedDuration, setSelectedDuration] = useState<SelectedDuration>(
    SelectedDuration.Week,
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

  const handleMetricChange = (e) => {
    const metric = e.target.value;
    if (metric === "Apr") {
      setSelectedMetric((prev) => SelectedMetric.Apr);
    } else if (metric === "Markout") {
      setSelectedMetric((prev) => SelectedMetric.Markout);
    } else if (metric === "Volume") {
      setSelectedMetric((prev) => SelectedMetric.Volume);
    }
  };

  const [selectedMetric, setSelectedMetric] = useState<SelectedMetric>(SelectedMetric.Apr);

  return (
    <div className={styles.performanceContainer}>
      <div className={styles.optionsContainer}>
        <div className={styles.metricSelectorContainer}>
          <Button
            className={styles.metricSelector}
            onClick={(e) => {
              handleMetricChange(e);
            }}
            value={"Apr"}
            style={{
              color:
                selectedMetric === SelectedMetric.Apr ? "#ddd" : "#888",
              fontWeight:
                selectedMetric === SelectedMetric.Apr ? "bold" : "normal",
            }}
          >
            APR
          </Button>
          <Button
            className={styles.metricSelector}
            onClick={(e) => {
              handleMetricChange(e);
            }}
            value={"Volume"}
            style={{
              color:
                selectedMetric === SelectedMetric.Volume ? "#ddd" : "#888",
              fontWeight:
                selectedMetric === SelectedMetric.Volume ? "bold" : "normal",
            }}
          >
            Volume
          </Button>
          {/* <Button
            className={styles.metricSelector}
            onClick={(e) => {
              handleMetricChange(e);
            }}
            value={"Markout"}
            style={{
              color:
                selectedMetric === SelectedMetric.Markout ? "#ddd" : "#888",
              fontWeight:
                selectedMetric === SelectedMetric.Markout ? "bold" : "normal",
            }}
          >
            MARKOUTS
          </Button> */}
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
        </div>
      </div>
      <div className={styles.metricValueContainer}>
        {
          selectedMetric === SelectedMetric.Apr ?
            <span className={styles.metricValue}>29.31%</span>
          :
            <span className={styles.metricValue}>$ 313,990</span>
        }
      </div>
    </div>
  );
};

export default PerformanceContainer;
