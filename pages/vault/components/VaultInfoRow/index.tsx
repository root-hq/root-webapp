import React, { useEffect, useState } from "react";
import styles from "./VaultInfoRow.module.css";
import { Container, Row, Col } from "react-bootstrap";
import { TokenMetadata, UnifiedVault } from "../../../../utils/supabase";
import FundsManagerColumn from "./components/FundsManagerColumn";
import { L3UiBook } from "@ellipsis-labs/phoenix-sdk";
import L3UiBookDisplay from "../../../../components/L3UiBookDisplay";
import { getL3Book } from "../../../../utils/phoenix";
import {
  DEFAULT_ORDERBOOK_UPDATE_FREQUENCY_IN_MS,
  DEFAULT_ORDERBOOK_VIEW_DEPTH,
} from "../../../../constants";

export interface VaultInfoRow {
  vaultData: UnifiedVault;
  baseTokenMetadata: TokenMetadata;
  quoteTokenMetadata: TokenMetadata;
  baseTokenPrice: number;
  baseTokenBalance: number;
  quoteTokenPrice: number;
  quoteTokenBalance: number;
}

const VaultInfoRow = ({
  vaultData,
  baseTokenMetadata,
  quoteTokenMetadata,
  baseTokenPrice,
  baseTokenBalance,
  quoteTokenPrice,
  quoteTokenBalance,
}: VaultInfoRow) => {
  const [isL3UiBookLoaded, setIsL3UiBookLoaded] = useState(false);
  const [l3UiBookState, setL3UiBookState] = useState({
    bids: [],
    asks: [],
  } as L3UiBook);

  useEffect(() => {
    const populateL3UiBook = async () => {
      // setIsL3UiBookLoaded(() => (false));
      // setL3UiBookState(() => ({bids: [], asks: []} as L3UiBook));

      const freshBook = await getL3Book(
        vaultData.market_address,
        DEFAULT_ORDERBOOK_VIEW_DEPTH,
      );

      setL3UiBookState(() => ({ ...freshBook }));
      // setIsL3UiBookLoaded(() => (true));
    };

    const intervalId = setInterval(
      populateL3UiBook,
      DEFAULT_ORDERBOOK_UPDATE_FREQUENCY_IN_MS,
    );

    return () => clearInterval(intervalId);
  }, []);

  return (
    <Container>
      <Row className={styles.vaultInfoRowContainer}>
        <Col
          className={`${styles.vaultInfoColumn} ${styles.leftVaultContainer}`}
        >
          {baseTokenMetadata &&
          baseTokenBalance &&
          quoteTokenMetadata &&
          quoteTokenBalance ? (
            <>
              <div className={styles.fundsManagerContainer}>
                <FundsManagerColumn
                  baseTokenMetadata={baseTokenMetadata}
                  quoteTokenMetadata={quoteTokenMetadata}
                />
              </div>
            </>
          ) : (
            <></>
          )}
        </Col>
        <Col
          className={`${styles.vaultInfoColumn} ${styles.rightVaultContainer}`}
        >
          <div className={styles.bookContainer}>
            <L3UiBookDisplay l3UiBook={l3UiBookState} />
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default VaultInfoRow;
