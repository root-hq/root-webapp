import React, { useEffect, useState } from "react";
import styles from "./FloatingTradeButton.module.css";

export interface FloatingTradeButtonProps {
    isMobileTradeModalOpen: boolean;
}

const FloatingTradeButton = ({
    isMobileTradeModalOpen
}: FloatingTradeButtonProps) => {

    const [showText, setShowText] = useState<string>(`Trade`);

    useEffect(() => {
        const toggle = () => {
            if(isMobileTradeModalOpen) {
                setShowText(_ => `Close`);
            }
            else {
                setShowText(_ => `Trade`);
            }
        }
        
        toggle();
    }, [isMobileTradeModalOpen]);
    
    return (
        <div className={styles.floatingTradeButtonContainer}>
            <span>{showText}</span>
        </div>
    )
}

export default FloatingTradeButton;