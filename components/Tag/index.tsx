import React from "react";
import styles from './Tag.module.css';

export interface TagProps {
    value: React.JSX.Element,
    valueStyle?: React.CSSProperties,
    containerStyle?: React.CSSProperties,
}

const Tag = ({value, valueStyle, containerStyle}: TagProps) => {
    return (
        <div
            style={
                containerStyle
            }
        >
            <span
                style={
                    valueStyle
                }
            >{value}</span>
        </div>
    );
}

export default Tag;