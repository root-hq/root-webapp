import React, { useEffect, useState } from "react";
import styles from "./MarketPage.module.css";

const OrderConsumer = dynamic(() => import("./components/OrderConsumer"), {
  ssr: false,
});
const CLOBTrader = dynamic(
  () => import("./components/OrderProducer/CLOBTrader"),
  { ssr: false },
);
const FloatingTradeButton = dynamic(
  () => import("../../components/FloatingTradeButton"),
  { ssr: false },
);

import {
  SpotGridMarket,
  TokenMetadata,
  getAllTokenMetadata,
} from "../../utils/supabase";

import {
  getAllMarkets,
  getMarketForPhoenixMarket,
} from "../../utils/supabase/SpotGridMarket";

import { web3 } from "@coral-xyz/anchor";
import { Client } from "@ellipsis-labs/phoenix-sdk";

import dynamic from "next/dynamic";
import { useRootState } from "../../components/RootStateContextType";
import { WEBSOCKETS_UPDATE_THROTTLING_INTERVAL_IN_MS } from "constants/";

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
  let { phoenixClient, setPhoenixClient, connection, setConnection, refreshBidsAndAsks } = useRootState();

  const [selectedSpotGridMarket, setSelectedSpotGridMarket] =
    useState<SpotGridMarket>();

  const [marketDataBuffer, setMarketDataBuffer] = useState<Buffer>(null);

  const [isMobileTradeModalOpen, setIsMobileTradeModalOpen] = useState<boolean>(false);

  const handleMobileTradeModalToggle = () => {
    setIsMobileTradeModalOpen(_ => !isMobileTradeModalOpen);
  }

  let lastMessageTimestamp = 0;

  useEffect(() => {
    setSelectedSpotGridMarket((prev) => spotGridMarketOnPage);
  }, [spotGridMarketOnPage]);

  useEffect(() => {
    const setupConnectionBackup = async () => {
      if (spotGridMarketOnPage) {        
        if (!phoenixClient) {
          let endpoint = process.env.RPC_ENDPOINT;
          if (!endpoint) {
            endpoint = `https://api.mainnet-beta.solana.com`;
          }

          let conn = connection;
          if(!conn) {
            conn = new web3.Connection(endpoint, {
              commitment: "processed",
            });
          }

          const client = await Client.create(conn);

          client.addMarket(spotGridMarketOnPage.phoenix_market_address);

          setPhoenixClient(client);
          setConnection(conn);
        }
        else {
          console.log("Root state loaded all fine");
        }
      }
    };

    setupConnectionBackup();
  }, [spotGridMarketOnPage, connection]);

  useEffect(() => {
    if(spotGridMarketOnPage) {
      const ws = new WebSocket(process.env.WS_ENDPOINT);

      ws.onopen = () => {
        ws.send(JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'accountSubscribe',
          params: [
            spotGridMarketOnPage.phoenix_market_address,
            {
              "encoding": "base64+zstd",
              "commitment": "processed"
            }
          ]
        }));
      };

      // Handle incoming messages
      ws.onmessage = async (event) => {
        const currentTime = Date.now();
        const data = JSON.parse(event.data);
        if(currentTime - lastMessageTimestamp > WEBSOCKETS_UPDATE_THROTTLING_INTERVAL_IN_MS) {
          if (data.method === 'accountNotification') {
            const accountData = data.params.result.value;
            if (accountData?.data[0] === undefined) {
              console.log(`Error fetching orderbook data`);
              return;
            }
  
            const compressedMarketData = Buffer.from(accountData?.data[0], "base64");
            setMarketDataBuffer(_ => compressedMarketData);
          }

          lastMessageTimestamp = currentTime;
        }
      };

      // Clean up WebSocket connection
      return () => {
        ws.close();
      };
    }
  }, [spotGridMarketOnPage]);

  useEffect(() => {
    refreshBidsAndAsks(marketDataBuffer);
  }, [marketDataBuffer]);

  return (
    <div className={styles.mainContainer}>
      <div className={styles.marketPageContainer}
        style={{
          filter: !isMobileTradeModalOpen ? `` : `blur(5px)`
        }}
      >
        <div className={styles.orderConsumerContainer}>
          <div className={styles.orderConsumerChartContainer}>
            <OrderConsumer
              enumeratedMarkets={enumeratedMarkets}
              selectedSpotGridMarket={selectedSpotGridMarket}
              baseTokenMetadata={baseTokenMetadata}
              quoteTokenMetadata={quoteTokenMetadata}
              connection={connection}
            />
          </div>
        </div>
        <div className={styles.orderProducerContainer}>
          <CLOBTrader
            spotGridMarket={selectedSpotGridMarket}
            baseTokenMetadata={baseTokenMetadata}
            quoteTokenMetadata={quoteTokenMetadata}
          />
        </div>
        <div
          onClick={() => {
            handleMobileTradeModalToggle()
          }}
        >
          <FloatingTradeButton isMobileTradeModalOpen = {isMobileTradeModalOpen} />
        </div>
      </div>
      {
        isMobileTradeModalOpen ?
          <div className={styles.mobileTradeModalContainer}>
              <CLOBTrader
              spotGridMarket={selectedSpotGridMarket}
              baseTokenMetadata={baseTokenMetadata}
              quoteTokenMetadata={quoteTokenMetadata}
              />

            <div
              onClick={() => {
                handleMobileTradeModalToggle()
              }}
              style={{
                filter: `none`
              }}
            >
              <FloatingTradeButton isMobileTradeModalOpen = {isMobileTradeModalOpen} />
            </div>
          </div>
        :
          <></>
      }
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
        return value.mint === market.base_token_mint;
      });

      let quoteMetadata = allTokenMetadata.find((value) => {
        return value.mint === market.quote_token_mint;
      });

      if (
        market.spot_grid_market_address ===
        spotGridMarketOnPage.spot_grid_market_address
      ) {
        baseTokenMetadata = allTokenMetadata.find((value) => {
          return value.mint === spotGridMarketOnPage.base_token_mint;
        });

        quoteTokenMetadata = allTokenMetadata.find((value) => {
          return value.mint === spotGridMarketOnPage.quote_token_mint;
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
      spotGridMarketOnPage: spotGridMarketOnPage ? spotGridMarketOnPage : null,
      enumeratedMarkets: enumeratedMarkets ? enumeratedMarkets : null,
      baseTokenMetadata:
        baseTokenMetadata === undefined ? null : baseTokenMetadata,
      quoteTokenMetadata:
        quoteTokenMetadata === undefined ? null : quoteTokenMetadata,
    },
  };
};

export default MarketPage;
