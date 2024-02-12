import React, { useEffect, useState } from "react";
import styles from "./FloatingTradeButton.module.css";
import { useRootState } from "components/RootStateContextType";

export interface FloatingTradeButtonProps {
  isMobileTradeModalOpen: boolean;
}

const FloatingTradeButton = ({
  isMobileTradeModalOpen,
}: FloatingTradeButtonProps) => {
  const [showElement, setShowElement] = useState<React.JSX.Element>(
    <span>{`Trade`}</span>,
  );

  const { isMobile } = useRootState();

  useEffect(() => {
    const toggle = () => {
      if (isMobileTradeModalOpen && isMobile.current) {
        setShowElement((_) => (
          <span>
            <i className="fa-solid fa-xmark"></i>
          </span>
        ));
      } else {
        setShowElement((_) => <span>{`Trade`}</span>);
      }
    };

    toggle();
  }, [isMobileTradeModalOpen, isMobile.current]);

  return (
    <div
      className={styles.floatingTradeButtonContainer}
      style={{
        border: `1px solid rgba(87, 87, 87, 1.0)`,
        cursor: `pointer`,
        backgroundColor:
          isMobileTradeModalOpen && isMobile.current ? `#e33d3d` : ``,
        fontSize: isMobileTradeModalOpen && isMobile.current ? `1.5rem` : ``,
        borderRadius: isMobileTradeModalOpen && isMobile.current ? `50%` : ``,
        width: isMobileTradeModalOpen && isMobile.current ? `40px` : ``,
        height: isMobileTradeModalOpen && isMobile.current ? `40px` : ``,
        padding: isMobileTradeModalOpen && isMobile.current ? `0rem` : ``,
      }}
    >
      <span>{showElement}</span>
    </div>
  );
};

export default FloatingTradeButton;
