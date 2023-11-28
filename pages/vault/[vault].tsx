import React, { useEffect, useState } from "react";
import styles from "./VaultPage.module.css";
import {
  TokenMetadata,
  TokenPrice,
  UnifiedVault,
  VolumeResult,
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
import {
  CHART_MOVING_AVERAGE_WINDOW_SIZE,
  DEFAULT_ORDERBOOK_VIEW_DEPTH,
  OPEN_ORDERS_REFRESH_FREQUENCY_IN_MS,
  PRICE_REFRESH_FREQUENCY_IN_MS,
} from "../../constants";
import { useWallet } from "@solana/wallet-adapter-react";
import { web3 } from "@coral-xyz/anchor";
import { getTokenAccountBalance } from "../../utils/token/balance";
import { getMarketVolume } from "../../utils/supabase";

export interface VaultPageProps {
  vaultData: UnifiedVault;
  baseTokenMetadata: TokenMetadata;
  quoteTokenMetadata: TokenMetadata;
  vaultTokenBalance: VaultBalance;
  baseTokenPrice: number;
  quoteTokenPrice: number;
  marketVolume: VolumeResult;
}

function calculateMovingAverage(data, windowSize) {
  var result = [];

  if (windowSize === 0) {
    return data;
  }

  for (var i = 0; i < data.length; i++) {
    var timestamp = data[i][0];
    var price = data[i][1];

    if (price !== null && price !== undefined) {
      var start = Math.max(0, i - windowSize + 1);
      var end = i + 1;
      var sum = 0;
      var count = 0;

      for (var j = start; j < end; j++) {
        var currentValue = data[j] && data[j][1];
        if (currentValue !== null && currentValue !== undefined) {
          sum += currentValue;
          count++;
        }
      }

      if (count > 0) {
        var avg = sum / count;
        result.push([timestamp, avg]);
      } else {
        // Handle case where all values in the window are null or undefined
        result.push([timestamp, null]);
      }
    } else {
      // Handle case where the current value is null or undefined
      result.push([timestamp, null]);
    }
  }
  return result;
}

const VaultPage = ({
  vaultData,
  baseTokenMetadata,
  quoteTokenMetadata,
  baseTokenPrice,
  quoteTokenPrice,
  vaultTokenBalance,
  marketVolume,
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
        let newMidPrice = parseFloat(
          (await getMarketMidPrice(vaultData.market_address)).toFixed(3),
        );

        setNewPrice((prevPrice) => (newMidPrice > 0 ? newMidPrice : prevPrice));

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

          const movingAverages = calculateMovingAverage(
            freshPrices,
            CHART_MOVING_AVERAGE_WINDOW_SIZE,
          );
          setPriceSeries((prevPrices) => [...movingAverages]);
        } else {
          const movingAverages = calculateMovingAverage(
            [...priceSeries.slice(1), [Date.now(), newMidPrice]],
            CHART_MOVING_AVERAGE_WINDOW_SIZE,
          );

          setPriceSeries((prevPrices) => [...movingAverages]);
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
    }, PRICE_REFRESH_FREQUENCY_IN_MS);

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
    }, OPEN_ORDERS_REFRESH_FREQUENCY_IN_MS);

    return () => clearInterval(intervalId);
  }, [vaultData.market_address]);

  const [baseTokenUserBalance, setBaseTokenUserBalance] = useState(0);
  const [quoteTokenUserBalance, setQuoteTokenUserBalance] = useState(0);
  const walletState = useWallet();

  useEffect(() => {
    const updateBalances = async () => {
      if (!walletState.connected || walletState.disconnecting) {
        setBaseTokenUserBalance((prev) => 0);
        setQuoteTokenUserBalance((prev) => 0);
      } else {
        try {
          const userBaseTokenBalance = await getTokenAccountBalance(
            walletState.publicKey,
            new web3.PublicKey(vaultData.base_token_address),
          );
          const userQuoteTokenBalance = await getTokenAccountBalance(
            walletState.publicKey,
            new web3.PublicKey(vaultData.quote_token_address),
          );

          setBaseTokenUserBalance((prev) => userBaseTokenBalance);
          setQuoteTokenUserBalance((prev) => userQuoteTokenBalance);
        } catch (err) {
          console.log(`Something went wrong updating balances: ${err}`);
        }
      }
    };

    updateBalances();
  }, [walletState]);

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
              chartHeight={
                windowSize[0] > 0 && windowSize[0] <= 425 ? 300 : 500
              }
              tokenImgWidth={windowSize[0] > 425 ? 40 : 35}
              tokenImgHeight={windowSize[0] > 425 ? 40 : 35}
            />
          </div>
          <div className={styles.userDataContainer}>
            <User
              vaultAddress={vaultData.vault_address}
              isBaseDepositPracticed={vaultData.is_base_deposit_practiced}
              isQuoteDepositPracticed={vaultData.is_quote_deposit_practiced}
              vaultTokenBalance={vaultTokenBalance}
              baseTokenMetadata={baseTokenMetadata}
              baseTokenBalance={baseTokenUserBalance}
              quoteTokenMetadata={quoteTokenMetadata}
              quoteTokenBalance={quoteTokenUserBalance}
              marketVolume={marketVolume}
            />
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
  let vaultBalance: VaultBalance = null;
  let baseTokenPrice: number = null;
  let quoteTokenPrice: number = null;
  let marketVolume: VolumeResult = null;

  if (
    vaultData &&
    vaultData.base_token_address &&
    vaultData.quote_token_address
  ) {
    [baseTokenMetadata, quoteTokenMetadata, vaultBalance, marketVolume] =
      await Promise.all([
        getTokenMetadata(vaultData.base_token_address),
        getTokenMetadata(vaultData.quote_token_address),
        getVaultBalance(vault),
        getMarketVolume(vaultData.market_address),
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
      baseTokenPrice: baseTokenPrice ? baseTokenPrice : null,
      baseTokenBalance: vaultBalance.baseTokenBalance
        ? vaultBalance.baseTokenBalance
        : null,
      quoteTokenPrice: quoteTokenPrice ? quoteTokenPrice : null,
      quoteTokenBalance: vaultBalance.quoteTokenBalance
        ? vaultBalance.quoteTokenBalance
        : null,
      vaultTokenBalance: vaultBalance ? vaultBalance : null,
      marketVolume: marketVolume ? marketVolume : null,
    },
  };
}

export default VaultPage;
