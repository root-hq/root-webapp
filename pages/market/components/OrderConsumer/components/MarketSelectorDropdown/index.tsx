// components/MarketDropdown.js

import React, { useState } from "react";
import { useRouter } from "next/router";
import {
  SpotGridMarket,
  TokenMetadata,
} from "../../../../../../utils/supabase";

export interface MarketSelectorDropdownProps {
  allMarkets: SpotGridMarket[];
  allTokenMetadata: TokenMetadata[];
  selectedMarket: SpotGridMarket;
  selectedBaseTokenMetadata: TokenMetadata;
  selectedQuoteTokenMetadata: TokenMetadata;
}

const MarketSelectorDropdown = ({
  allMarkets,
  allTokenMetadata,
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

  const handleMarketChange = (market: SpotGridMarket) => {
    setActiveMarket(market);
    setDropdownOpen(false);
    // Redirect to the desired URL for the selected market
    router.push(`/market/${market.phoenix_market_address}`);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="market-dropdown">
      <button className="dropdown-button" onClick={toggleDropdown}>
        <div>
          <img src={activeBaseTokenMetadata.img_url} alt="Token 1" />
          <img src={activeQuoteTokenMetadata.img_url} alt="Token 2" />
        </div>
        <span>{`${activeBaseTokenMetadata.ticker} - ${activeQuoteTokenMetadata.ticker}`}</span>
      </button>
      {isDropdownOpen && (
        <div className="dropdown-content">
          {allMarkets.map((market, index) => (
            <div key={index} onClick={() => handleMarketChange(market)}>
              <span>{`${market.phoenix_market_address}`}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketSelectorDropdown;
