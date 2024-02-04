import React, { useEffect, useRef, useState } from "react";
import styles from "./MarketPage.module.css";
import OrderConsumer from "./components/OrderConsumer";
import OrderProducer from "./components/OrderProducer/SpotGridBotTrader";
import CLOBTrader from "./components/OrderProducer/CLOBTrader";
import {
  SpotGridMarket,
  TokenMetadata,
  getAllTokenMetadata,
} from "../../utils/supabase";
import {
  getAllMarkets,
  getMarketForPhoenixMarket,
} from "../../utils/supabase/SpotGridMarket";
import { SeriesManagerInstance } from "./components/OrderConsumer/components/LightweightChart";
import { IChartApi } from "lightweight-charts";
import { web3 } from "@coral-xyz/anchor";
import { Client } from "@ellipsis-labs/phoenix-sdk";
import { Connection } from "@solana/web3.js";

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

  const seriesManager = useRef<SeriesManagerInstance>(null);
  const [phoenixClient, setPhoenixClient] = useState<Client>(null);
  const chartManager = useRef<IChartApi>(null);
  const leastDatedata = useRef<Date>(null);
  const leastKnownBar = useRef<number>();

  const [selectedSpotGridMarket, setSelectedSpotGridMarket] =
    useState<SpotGridMarket>();

  useEffect(() => {
    setSelectedSpotGridMarket((prev) => spotGridMarketOnPage);
  }, [spotGridMarketOnPage]);


  let connection: Connection;
  if(process.env.RPC_ENDPOINT) {
    connection = new Connection(process.env.RPC_ENDPOINT, { commitment: "processed" });
  }
  else {
    connection = new Connection(`https://api.mainnet-beta.solana.com/`, { commitment: "processed" });
  }

  useEffect(() => {
    const setupPhoenixClient = async() => {
      if(spotGridMarketOnPage) {
        if(!phoenixClient) {
          let endpoint = process.env.RPC_ENDPOINT;
          if(!endpoint) {
            endpoint = `https://api.mainnet-beta.solana.com`;
          }

          const connection = new web3.Connection(endpoint, {
            commitment: "processed",
          });

          const client = await Client.create(connection);

          client.addMarket(spotGridMarketOnPage.phoenix_market_address.toString());
          // console.log("New client initialized");
          // console.log("Client: ", client);
          setPhoenixClient(_ => client);
        }
      }
    }

    setupPhoenixClient();
  }, [spotGridMarketOnPage, connection]);


  return (
    <div className={styles.marketPageContainer}>
      <div className={styles.orderConsumerContainer}>
        <OrderConsumer
          enumeratedMarkets={enumeratedMarkets}
          selectedSpotGridMarket={selectedSpotGridMarket}
          baseTokenMetadata={baseTokenMetadata}
          quoteTokenMetadata={quoteTokenMetadata}
          phoenixClient={phoenixClient}
          seriesManagerHandler={seriesManager}
          chartManagerHandler={chartManager}
          leastDisplayDate={leastDatedata}
          leastKnownBar={leastKnownBar}
        />
      </div>
      <div className={styles.orderProducerContainer}>
        {/* <OrderProducer spotGridMarket={selectedSpotGridMarket} baseTokenMetadata={baseTokenMetadata} quoteTokenMetadata={quoteTokenMetadata} /> */}
        <CLOBTrader spotGridMarket={selectedSpotGridMarket} baseTokenMetadata={baseTokenMetadata} quoteTokenMetadata={quoteTokenMetadata} phoenixClient={phoenixClient}/>
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

      if (
        market.spot_grid_market_address ===
        spotGridMarketOnPage.spot_grid_market_address
      ) {
        baseTokenMetadata = allTokenMetadata.find((value) => {
          return value.mint === spotGridMarketOnPage.base_token_mint.toString();
        });

        quoteTokenMetadata = allTokenMetadata.find((value) => {
          return (
            value.mint === spotGridMarketOnPage.quote_token_mint.toString()
          );
        });
      }

      enumeratedMarkets.push({
        spotGridMarket: market,
        baseTokenMetadata: baseMetadata,
        quoteTokenMetadata: quoteMetadata,
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
