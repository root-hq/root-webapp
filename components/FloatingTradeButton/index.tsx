import React, { useEffect, useState } from "react";
import styles from "./FloatingTradeButton.module.css";

export interface FloatingTradeButtonProps {
    isMobileTradeModalOpen: boolean;
}

const FloatingTradeButton = ({
    isMobileTradeModalOpen
}: FloatingTradeButtonProps) => {

    const [showElement, setShowElement] = useState<React.JSX.Element>(<span>{`Trade`}</span>);

    useEffect(() => {
        const toggle = () => {
            if(isMobileTradeModalOpen) {
                setShowElement(_ => <span><i className="fa-solid fa-xmark"></i></span>);
            }
            else {
                setShowElement(_ => (
                    <span>{`Trade`}</span>
                ));
            }
        }
        
        toggle();
    }, [isMobileTradeModalOpen]);
    
    return (
        <div className={styles.floatingTradeButtonContainer}
            style={{
                border: `1px solid rgba(87, 87, 87, 1.0)`,
                cursor: `pointer`,
                backgroundColor: isMobileTradeModalOpen ? `#e33d3d` : ``,
                fontSize: isMobileTradeModalOpen ? `1.5rem` : ``,
                borderRadius: isMobileTradeModalOpen ? `50%` : ``,
                width: isMobileTradeModalOpen ? `40px` : ``,
                height: isMobileTradeModalOpen ? `40px`: ``,
                padding: isMobileTradeModalOpen ? `0rem` : ``,
            }}
        >
            <span>{
                showElement
            }</span>
        </div>
    )
}

export default FloatingTradeButton;