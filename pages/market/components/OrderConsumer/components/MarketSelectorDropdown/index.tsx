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

export interface MarketSelectorDropdownProps {
  enumeratedMarkets: EnumeratedMarketToMetadata[];
  selectedMarket: SpotGridMarket;
  selectedBaseTokenMetadata: TokenMetadata;
  selectedQuoteTokenMetadata: TokenMetadata;
}

const MarketSelectorDropdown = ({
  enumeratedMarkets,
  selectedMarket,
  selectedBaseTokenMetadata,
  selectedQuoteTokenMetadata,
}: MarketSelectorDropdownProps) => {
  const router = useRouter();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [activeMarket, setActiveMarket] = useState(selectedMarket);
  const [activeBaseTokenMetadata, setActiveBaseTokenMetadata] = useState(
    selectedBaseTokenMetadata,
  );
  const [activeQuoteTokenMetadata, setActiveQuoteTokenMetadata] = useState(
    selectedQuoteTokenMetadata,
  );

  const handleMarketChange = (market: SpotGridMarket, baseMetadata: TokenMetadata, quoteMetadata: TokenMetadata) => {
    setActiveMarket(market);
    setDropdownOpen(false);
    setActiveBaseTokenMetadata(baseMetadata);
    setActiveQuoteTokenMetadata(quoteMetadata);
    // Redirect to the desired URL for the selected market
    router.push(`/market/${market.phoenix_market_address}`);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const getTokenPair = (baseMetadata: TokenMetadata, quoteMetadata: TokenMetadata) => {
    return (
        <div className={styles.tokenPairContainer}>
          <div className={styles.imageContainer}>
            <div className={styles.tokenImageContainer}>
              <Image
                src={baseMetadata.img_url}
                width={30}
                height={30}
                alt={`${baseMetadata.ticker} img`}
                className={styles.tokenImage}
              />
            </div>
            <div className={styles.tokenImageContainer}>
              <Image
                src={quoteMetadata.img_url}
                width={30}
                height={30}
                alt={`${quoteMetadata.ticker} img`}
                className={styles.tokenImage}
              />
            </div>
          </div>
          <span>{`${baseMetadata.ticker} - ${quoteMetadata.ticker}`}</span>
        </div>
    );
  }

  return (
    <div className={styles.MarketDropdown}>
      <button className={styles.dropdownButton} onClick={toggleDropdown}>
        {getTokenPair(activeBaseTokenMetadata, activeQuoteTokenMetadata)}
        
      </button>
      {isDropdownOpen && (
        <div className={styles.dropdownContent}>
          {enumeratedMarkets.map((enumeratedMarket, index) => (
            <div key={index} onClick={() => handleMarketChange(enumeratedMarket.spotGridMarket, enumeratedMarket.baseTokenMetadata, enumeratedMarket.quoteTokenMetadata)}>
              {getTokenPair(enumeratedMarket.baseTokenMetadata, enumeratedMarket.quoteTokenMetadata)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketSelectorDropdown;
