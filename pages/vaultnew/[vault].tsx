import React, { useEffect, useState } from "react";
import styles from "./VaultPage.module.css";
import {
  TokenMetadata,
  TokenPrice,
  UnifiedVault,
  getTokenMetadata,
  getVault,
} from "../../utils/supabase";
import Vault from "./components/Vault/Vault";
import User from "./components/User/User";
import { VaultBalance, getVaultBalance } from "../../utils/root/utils";
import { getTokenPrice } from "../../utils/token";
import { getTokenPriceDataWithDate } from "../../utils/supabase/tokenPrice";
import { getL3Book, getMarketMidPrice } from "../../utils/phoenix";
import { L3UiBook } from "@ellipsis-labs/phoenix-sdk";
import { DEFAULT_ORDERBOOK_VIEW_DEPTH } from "../../constants";

export interface VaultPageProps {
  vaultData: UnifiedVault;
  l3UiBook: L3UiBook;
  baseTokenMetadata: TokenMetadata;
  quoteTokenMetadata: TokenMetadata;
  baseTokenPrice: number;
  baseTokenBalance: number;
  quoteTokenPrice: number;
  quoteTokenBalance: number;
}

const VaultPage = ({
  vaultData,
  l3UiBook,
  baseTokenMetadata,
  quoteTokenMetadata,
  baseTokenPrice,
  baseTokenBalance,
  quoteTokenPrice,
  quoteTokenBalance,
}: VaultPageProps) => {
  const [windowSize, setWindowSize] = useState([0, 0]);

  // UseEffect to handle windowSizing for custom CSS
  // when window size changes
  useEffect(() => {
    const handleWindowResize = () => {
      setWindowSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  const [priceSeries, setPriceSeries] = useState([] as number[][]);

  const [l3UiBookState, setL3UiBookState] = useState({
    bids: [],
    asks: [],
  });
  const [newPrice, setNewPrice] = useState(0);
  const [previousPrice, setPreviousPrice] = useState(0);
  const [midPriceChangeDirection, setMidPriceChangeDirection] = useState("");

  useEffect(() => {
    const refreshPriceData = async () => {
      try {
        const today = new Date();
        const newMidPrice = parseFloat(
          (await getMarketMidPrice(vaultData.market_address)).toFixed(3),
        );

        setNewPrice((prevPrice) => newMidPrice);

        if (newMidPrice >= previousPrice) {
          setMidPriceChangeDirection((previousChange) => "▲");
        } else {
          setMidPriceChangeDirection((previousChange) => "▼");
        }

        setPreviousPrice((prevPrice2) => newMidPrice);
        if (priceSeries.length === 0) {
          const freshPrices = (
            await getTokenPriceDataWithDate(vaultData.market_address, today)
          ).map((val: TokenPrice) => [val.timestamp, val.price]);

          setPriceSeries((prevPrices) => [...freshPrices]);
        } else {
          setPriceSeries((prevPrices) => [
            ...prevPrices.slice(1),
            [Date.now(), newMidPrice],
          ]);
        }
      } catch (error) {
        console.error("Error fetching price data:", error);
      }
    };

    // Fetch price data initially
    refreshPriceData();

    // Set up an interval to fetch price data every 5 seconds (adjust as needed)
    const intervalId = setInterval(() => {
      refreshPriceData();
    }, 2000);

    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [previousPrice]); // Empty dependency array to run the effect only once on mount

  useEffect(() => {
    const refreshBook = async () => {
      const newBook = await getL3Book(
        vaultData.market_address,
        DEFAULT_ORDERBOOK_VIEW_DEPTH,
      );
      setL3UiBookState((prevBook) => newBook);
    };

    refreshBook();

    const intervalId = setInterval(() => {
      refreshBook();
    }, 2000);

    return () => clearInterval(intervalId);
  }, [vaultData.market_address]);

  return (
    <div className={styles.vaultPageContainer}>
      {vaultData ? (
        <>
          <div className={styles.vaultDataContainer}>
            <Vault
              vaultData={vaultData}
              baseTokenMetadata={baseTokenMetadata}
              quoteTokenMetadata={quoteTokenMetadata}
              midPrice={previousPrice}
              priceSeries={priceSeries}
              l3UiBook={l3UiBookState}
              priceChangeDirection={midPriceChangeDirection}
              tokenImgWidth={windowSize[0] > 425 ? 40 : 35}
              tokenImgHeight={windowSize[0] > 425 ? 40 : 35}
            />
          </div>
          <div className={styles.userDataContainer}>
            <User />
          </div>
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

export async function getServerSideProps({ params }) {
  const { vault } = params;

  const vaultData = await getVault(vault);
  let baseTokenMetadata: TokenMetadata = null;
  let quoteTokenMetadata: TokenMetadata = null;
  let l3UiBook = {
    bids: [],
    asks: [],
  } as L3UiBook;
  let vaultBalance: VaultBalance = null;
  let baseTokenPrice: number = null;
  let quoteTokenPrice: number = null;

  if (
    vaultData &&
    vaultData.base_token_address &&
    vaultData.quote_token_address
  ) {
    [baseTokenMetadata, quoteTokenMetadata, l3UiBook, vaultBalance] =
      await Promise.all([
        getTokenMetadata(vaultData.base_token_address),
        getTokenMetadata(vaultData.quote_token_address),
        getL3Book(vaultData.market_address, DEFAULT_ORDERBOOK_VIEW_DEPTH),
        getVaultBalance(vault),
      ]);

    if (baseTokenMetadata && baseTokenMetadata.ticker) {
      baseTokenPrice = await getTokenPrice(baseTokenMetadata.ticker, "USD");
    }

    if (quoteTokenMetadata && quoteTokenMetadata.ticker) {
      quoteTokenPrice = await getTokenPrice(quoteTokenMetadata.ticker, "USD");
    }
  }

  return {
    props: {
      vaultData: vaultData ? vaultData : null,
      baseTokenMetadata: baseTokenMetadata ? baseTokenMetadata : null,
      quoteTokenMetadata: quoteTokenMetadata ? quoteTokenMetadata : null,
      l3UiBook: l3UiBook ? l3UiBook : null,
      baseTokenPrice: baseTokenPrice ? baseTokenPrice : null,
      baseTokenBalance: vaultBalance.baseTokenBalance
        ? vaultBalance.baseTokenBalance
        : null,
      quoteTokenPrice: quoteTokenPrice ? quoteTokenPrice : null,
      quoteTokenBalance: vaultBalance.quoteTokenBalance
        ? vaultBalance.quoteTokenBalance
        : null,
    },
  };
}

export default VaultPage;
