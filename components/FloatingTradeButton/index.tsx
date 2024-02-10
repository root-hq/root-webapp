import React, { useEffect, useState } from "react";
import styles from "./FloatingTradeButton.module.css";

export interface FloatingTradeButtonProps {
    isMobileTradeModalOpen: boolean;
}

const FloatingTradeButton = ({
    isMobileTradeModalOpen
}: FloatingTradeButtonProps) => {

    const [showElement, setShowElement] = useState<React.JSX.Element>(<span><i className="fa-solid fa-plus"></i></span>);

    useEffect(() => {
        const toggle = () => {
            if(isMobileTradeModalOpen) {
                setShowElement(_ => <span><i className="fa-solid fa-xmark"></i></span>);
            }
            else {
                setShowElement(_ => <span><i className="fa-solid fa-plus"></i></span>);
            }
        }
        
        toggle();
    }, [isMobileTradeModalOpen]);
    
    return (
        <div className={styles.floatingTradeButtonContainer}
            style={{
                backgroundColor: isMobileTradeModalOpen ? `#e33d3d` : ``
            }}
        >
            <span>{
                showElement
            }</span>
        </div>
    )
}

export default FloatingTradeButton;