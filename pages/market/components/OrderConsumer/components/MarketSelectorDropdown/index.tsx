// components/MarketDropdown.js

import React, { useState } from "react";
import { useRouter } from "next/router";
import {
  SpotGridMarket,
  TokenMetadata,
} from "../../../../../../utils/supabase";
import styles from "./MarketSelectorDropdown.module.css";
import Image from "next/image";
import { EnumeratedMarketToMetadata } from "../../../../[market]";
import { Button } from "react-bootstrap";

export interface MarketSelectorDropdownProps {
  enumeratedMarkets: EnumeratedMarketToMetadata[];
  selectedBaseTokenMetadata: TokenMetadata;
  selectedQuoteTokenMetadata: TokenMetadata;
  topLevelActiveMarketState: SpotGridMarket;
  setTopLevelActiveMarketState: React.Dispatch<
    React.SetStateAction<SpotGridMarket>
  >;
}

const MarketSelectorDropdown = ({
  enumeratedMarkets,
  selectedBaseTokenMetadata,
  selectedQuoteTokenMetadata,
  topLevelActiveMarketState,
  setTopLevelActiveMarketState,
}: MarketSelectorDropdownProps) => {
  const router = useRouter();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [activeBaseTokenMetadata, setActiveBaseTokenMetadata] = useState(
    selectedBaseTokenMetadata,
  );
  const [activeQuoteTokenMetadata, setActiveQuoteTokenMetadata] = useState(
    selectedQuoteTokenMetadata,
  );

  const handleMarketChange = (
    market: SpotGridMarket,
    baseMetadata: TokenMetadata,
    quoteMetadata: TokenMetadata,
  ) => {
    setTopLevelActiveMarketState(market);
    setDropdownOpen(false);
    setActiveBaseTokenMetadata(baseMetadata);
    setActiveQuoteTokenMetadata(quoteMetadata);
    // Redirect to the desired URL for the selected market
    router.push(`/market/${market.phoenix_market_address}`);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const getTokenPair = (
    baseMetadata: TokenMetadata,
    quoteMetadata: TokenMetadata,
    isMainItem: boolean,
  ) => {
    return (
      <div className={styles.tokenPairContainer}>
        <div className={styles.imageContainer}>
          <div className={styles.tokenImageContainer}>
            {baseMetadata && baseMetadata.img_url ? (
              <Image
                src={baseMetadata.img_url}
                width={35}
                height={35}
                alt={`${baseMetadata.ticker} img`}
                className={styles.tokenImage}
              />
            ) : (
              <></>
            )}
          </div>
          <div className={styles.tokenImageContainer}>
            {quoteMetadata && quoteMetadata.img_url ? (
              <Image
                src={quoteMetadata.img_url}
                width={35}
                height={35}
                alt={`${quoteMetadata.ticker} img`}
                className={styles.tokenImage}
              />
            ) : (
              <></>
            )}
          </div>
        </div>
        <div className={styles.marketTickerContainer}>
          <div className={styles.tickerText}>
            {baseMetadata && baseMetadata.ticker ? (
              <span>{`${baseMetadata.ticker}`}</span>
            ) : (
              <></>
            )}
          </div>
          <div className={styles.tickerText}>
            {quoteMetadata && quoteMetadata.ticker ? (
              <span>{`${quoteMetadata.ticker}`}</span>
            ) : (
              <></>
            )}
          </div>
        </div>
        {isMainItem ? (
          <div className={styles.caretContainer}>
            {isDropdownOpen ? (
              <i className="fa-solid fa-caret-up"></i>
            ) : (
              <i className="fa-solid fa-caret-down"></i>
            )}
          </div>
        ) : (
          <></>
        )}
      </div>
    );
  };

  return (
    <div className={styles.marketDropdown}>
      <Button className={styles.dropdownButton} onClick={toggleDropdown}>
        {getTokenPair(activeBaseTokenMetadata, activeQuoteTokenMetadata, true)}
      </Button>
      {isDropdownOpen && (
        <div className={styles.dropdownContent}>
          {enumeratedMarkets.map((enumeratedMarket, index) => (
            <div
              className={styles.otherMarketRowContainer}
              key={index}
              onClick={() =>
                handleMarketChange(
                  enumeratedMarket.spotGridMarket,
                  enumeratedMarket.baseTokenMetadata,
                  enumeratedMarket.quoteTokenMetadata,
                )
              }
            >
              {getTokenPair(
                enumeratedMarket.baseTokenMetadata,
                enumeratedMarket.quoteTokenMetadata,
                false,
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketSelectorDropdown;
