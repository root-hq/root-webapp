import React, { useEffect, useState } from "react";
import styles from "./MarketPage.module.css";
import OrderConsumer from "./components/OrderConsumer";
import OrderProducer from "./components/OrderProducer";
import {
  SpotGridMarket,
  TokenMetadata,
  getAllTokenMetadata,
  getTokenMetadata,
} from "../../utils/supabase";
import {
  getAllMarkets,
  getMarket,
  getMarketForPhoenixMarket,
} from "../../utils/supabase/SpotGridMarket";

export interface EnumeratedMarketToMetadata {
  spotGridMarket: SpotGridMarket;
  baseTokenMetadata: TokenMetadata;
  quoteTokenMetadata: TokenMetadata; 
}

export interface MarketPageProps {
  enumeratedMarkets: EnumeratedMarketToMetadata[];
  spotGridMarketOnPage: SpotGridMarket;
  baseTokenMetadata: TokenMetadata;
  quoteTokenMetadata: TokenMetadata;
}

const MarketPage = ({
  enumeratedMarkets,
  spotGridMarketOnPage,
  baseTokenMetadata,
  quoteTokenMetadata,
}: MarketPageProps) => {
  const [selectedSpotGridMarket, setSelectedSpotGridMarket] =
    useState<SpotGridMarket>();

  useEffect(() => {
    setSelectedSpotGridMarket((prev) => spotGridMarketOnPage);
    console.log("set hai");
  }, [spotGridMarketOnPage]);

  return (
    <div className={styles.marketPageContainer}>
      <div className={styles.orderConsumerContainer}>
        <OrderConsumer
          enumeratedMarkets={enumeratedMarkets}
          selectedSpotGridMarket={selectedSpotGridMarket}
          baseTokenMetadata={baseTokenMetadata}
          quoteTokenMetadata={quoteTokenMetadata}
        />
      </div>
      <div className={styles.orderProducerContainer}>
        <OrderProducer spotGridMarket={selectedSpotGridMarket} />
      </div>
    </div>
  );
};

export const getServerSideProps = async ({ params }) => {
  const { market } = params;

  let spotGridMarketOnPage: SpotGridMarket = null;
  let allTokenMetadata: TokenMetadata[] = null;
  let baseTokenMetadata: TokenMetadata = null;
  let quoteTokenMetadata: TokenMetadata = null;
  let allSpotGridMarkets: SpotGridMarket[] = [];
  let enumeratedMarkets: EnumeratedMarketToMetadata[] = [];

  [spotGridMarketOnPage, allTokenMetadata, allSpotGridMarkets] =
    await Promise.all([
      getMarketForPhoenixMarket(market),
      getAllTokenMetadata(),
      getAllMarkets(),
    ]);

  if (allSpotGridMarkets && allSpotGridMarkets.length > 0) {
    allSpotGridMarkets.forEach((market) => {
      let baseMetadata = allTokenMetadata.find((value) => {
        return value.mint === market.base_token_mint.toString();
      });
  
      let quoteMetadata = allTokenMetadata.find((value) => {
        return value.mint === market.quote_token_mint.toString();
      });
  
      if(market.spot_grid_market_address === spotGridMarketOnPage.spot_grid_market_address) {
        baseTokenMetadata = allTokenMetadata.find((value) => {
          return value.mint === spotGridMarketOnPage.base_token_mint.toString();
        });
    
        quoteTokenMetadata = allTokenMetadata.find((value) => {
          return value.mint === spotGridMarketOnPage.quote_token_mint.toString();
        });  
      }
  
      enumeratedMarkets.push({
        spotGridMarket: market,
        baseTokenMetadata: baseMetadata,
        quoteTokenMetadata: quoteMetadata
      } as EnumeratedMarketToMetadata);
    });
  }

  

  return {
    props: {
      spotGridMarketOnPage: spotGridMarketOnPage,
      enumeratedMarkets,
      baseTokenMetadata:
        baseTokenMetadata === undefined ? null : baseTokenMetadata,
      quoteTokenMetadata:
        quoteTokenMetadata === undefined ? null : quoteTokenMetadata,
    },
  };
};

export default MarketPage;
