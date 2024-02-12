// components/MarketDropdown.js

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import {
  PhoenixMarket,
  TokenMetadata,
} from "../../../../../../utils/supabase";
import styles from "./MarketSelectorDropdown.module.css";
import Image from "next/image";
import { EnumeratedMarketToMetadata } from "../../../../[market]";
import { Form } from "react-bootstrap";
import { useRootState } from "components/RootStateContextType";

export interface MarketSelectorDropdownProps {
  enumeratedMarkets: EnumeratedMarketToMetadata[];
  selectedBaseTokenMetadata: TokenMetadata;
  selectedQuoteTokenMetadata: TokenMetadata;
  topLevelActiveMarketState: PhoenixMarket;
  setTopLevelActiveMarketState: React.Dispatch<
    React.SetStateAction<PhoenixMarket>
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

  const { isMobile } = useRootState();

  const marketSelectorDropdownRef = useRef(null);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [activeBaseTokenMetadata, setActiveBaseTokenMetadata] = useState(
    selectedBaseTokenMetadata,
  );
  const [activeQuoteTokenMetadata, setActiveQuoteTokenMetadata] = useState(
    selectedQuoteTokenMetadata,
  );
  const [searchText, setSearchText] = useState("");

  const handleMarketChange = (
    market: PhoenixMarket,
    baseMetadata: TokenMetadata,
    quoteMetadata: TokenMetadata,
  ) => {
    setSearchText(_ => "");
    setTopLevelActiveMarketState(market);
    setDropdownOpen(false);
    setActiveBaseTokenMetadata(baseMetadata);
    setActiveQuoteTokenMetadata(quoteMetadata);
    // Redirect to the desired URL for the selected market
    router.push(`/market/${market.phoenix_market_address}`);
  };
  
  const handleSearchTextChange = (e) => {
    setSearchText(_ => e.target.value.toLowerCase());
  }

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
                width={25}
                height={25}
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
                width={25}
                height={25}
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
              <span>{`${baseMetadata.ticker} / ${quoteMetadata.ticker}`}</span>
            ) : (
              <></>
            )}
          </div>
          {/* <div className={styles.tickerText}>
            {quoteMetadata && quoteMetadata.ticker ? (
              <span>{`${quoteMetadata.ticker}`}</span>
            ) : (
              <></>
            )}
          </div> */}
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        marketSelectorDropdownRef.current &&
        !marketSelectorDropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.marketDropdown} ref={marketSelectorDropdownRef}>
      <button className={styles.dropdownButton} onClick={toggleDropdown}>
        {getTokenPair(activeBaseTokenMetadata, activeQuoteTokenMetadata, true)}
      </button>
      {isDropdownOpen && (
        <div className={styles.dropdownContent}>
          <div className={styles.tokenSearchContainer}>
            <Form.Group controlId="formInput" className={styles.formGroupContainer}>
              <div className={styles.formLabelAndFieldContainerNoBottomMargin}>
                <Form.Control
                  placeholder={`Search token`}
                  // disabled={!walletState.connected}
                  style={{
                    backgroundColor: "transparent",
                    border: "1px solid rgba(87, 87, 87, 0.25)",
                    fontSize: !isMobile.current ? "1.0rem" : "0.8rem",
                    textAlign: "left",
                    color: "#ddd",
                    caretColor: "#ddd",
                    margin: "0.5rem",
                    padding: "0.5rem"
                  }}
                  min="0"
                  step="0.01" // Allow any decimal value
                  className={styles.formFieldContainer}
                  onChange={(e) => handleSearchTextChange(e)}
                  value={searchText} // Use inputText instead of inputAmount to show the decimal value
                />
              </div>
          </Form.Group>
          </div>
          {enumeratedMarkets.filter(
            (market) => (
              (market.baseTokenMetadata.ticker.toLowerCase().includes(searchText) || market.quoteTokenMetadata.ticker.toLowerCase().includes(searchText)) ||
              (market.baseTokenMetadata.name.toLowerCase().includes(searchText) || market.quoteTokenMetadata.name.toLowerCase().includes(searchText))
            )
          ).map((enumeratedMarket, index) => (
            <div
              className={styles.otherMarketRowContainer}
              key={enumeratedMarket.phoenixMarket.phoenix_market_address}
              onClick={() =>
                handleMarketChange(
                  enumeratedMarket.phoenixMarket,
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
