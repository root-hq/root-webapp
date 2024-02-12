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
  PhoenixMarket,
  TokenMetadata,
  getAllTokenMetadata,
} from "../../utils/supabase";

import {
  getAllMarkets,
  getMarket,
} from "../../utils/supabase/PhoenixMarket";

import { web3 } from "@coral-xyz/anchor";
import { Client } from "@ellipsis-labs/phoenix-sdk";

import dynamic from "next/dynamic";
import { useRootState } from "../../components/RootStateContextType";
import { WEBSOCKETS_UPDATE_THROTTLING_INTERVAL_IN_MS } from "constants/";

export interface EnumeratedMarketToMetadata {
  phoenixMarket: PhoenixMarket;
  baseTokenMetadata: TokenMetadata;
  quoteTokenMetadata: TokenMetadata;
}

export interface MarketPageProps {
  enumeratedMarkets: EnumeratedMarketToMetadata[];
  phoenixMarketOnPage: PhoenixMarket;
  baseTokenMetadata: TokenMetadata;
  quoteTokenMetadata: TokenMetadata;
}

const MarketPage = ({
  enumeratedMarkets,
  phoenixMarketOnPage,
  baseTokenMetadata,
  quoteTokenMetadata,
}: MarketPageProps) => {
  let {
    phoenixClient,
    setPhoenixClient,
    connection,
    setConnection,
    refreshBidsAndAsks,
    innerWidth,
    innerHeight,
    isMobile,
  } = useRootState();

  const [selectedPhoenixMarket, setSelectedPhoenixMarket] =
    useState<PhoenixMarket>();

  const [marketDataBuffer, setMarketDataBuffer] = useState<Buffer>(null);

  const [isMobileTradeModalOpen, setIsMobileTradeModalOpen] =
    useState<boolean>(false);

  const handleMobileTradeModalToggle = () => {
    setIsMobileTradeModalOpen((_) => !isMobileTradeModalOpen);
  };

  let lastMessageTimestamp = 0;

  useEffect(() => {
    console.log("Selected SPM: ", phoenixMarketOnPage);
    setSelectedPhoenixMarket((prev) => phoenixMarketOnPage);
  }, [phoenixMarketOnPage]);

  useEffect(() => {
    const handleResize = () => {
      innerWidth.current = window.innerWidth;
      innerHeight.current = window.innerHeight;
      isMobile.current = window.innerWidth <= 1025;
    };

    handleResize(); // Call it initially

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const setupConnectionBackup = async () => {
      if (phoenixMarketOnPage) {
        if (!phoenixClient) {
          let endpoint = process.env.RPC_ENDPOINT;
          if (!endpoint) {
            endpoint = `https://api.mainnet-beta.solana.com`;
          }

          let conn = connection;
          if (!conn) {
            conn = new web3.Connection(endpoint, {
              commitment: "processed",
            });
          }

          const client = await Client.create(conn);

          client.addMarket(phoenixMarketOnPage.phoenix_market_address);

          setPhoenixClient(client);
          setConnection(conn);
        } else {
          console.log("Root state loaded all fine");
        }
      }
    };

    setupConnectionBackup();
  }, [phoenixMarketOnPage, connection]);

  useEffect(() => {
    if (phoenixMarketOnPage) {
      const ws = new WebSocket(process.env.WS_ENDPOINT);

      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "accountSubscribe",
            params: [
              phoenixMarketOnPage.phoenix_market_address,
              {
                encoding: "base64+zstd",
                commitment: "processed",
              },
            ],
          }),
        );
      };

      // Handle incoming messages
      ws.onmessage = async (event) => {
        const currentTime = Date.now();
        const data = JSON.parse(event.data);
        if (
          currentTime - lastMessageTimestamp >
          WEBSOCKETS_UPDATE_THROTTLING_INTERVAL_IN_MS
        ) {
          if (data.method === "accountNotification") {
            const accountData = data.params.result.value;
            if (accountData?.data[0] === undefined) {
              console.log(`Error fetching orderbook data`);
              return;
            }

            const compressedMarketData = Buffer.from(
              accountData?.data[0],
              "base64",
            );
            setMarketDataBuffer((_) => compressedMarketData);
          }

          lastMessageTimestamp = currentTime;
        }
      };

      // Clean up WebSocket connection
      return () => {
        ws.close();
      };
    }
  }, [phoenixMarketOnPage]);

  useEffect(() => {
    refreshBidsAndAsks(marketDataBuffer);
  }, [marketDataBuffer]);

  return (
    <div className={styles.mainContainer}>
      <div
        className={styles.marketPageContainer}
        style={{
          filter: !(isMobile.current && isMobileTradeModalOpen)
            ? ``
            : `blur(5px)`,
        }}
      >
        <div className={styles.orderConsumerContainer}>
          <div className={styles.orderConsumerChartContainer}>
            <OrderConsumer
              enumeratedMarkets={enumeratedMarkets}
              selectedPhoenixMarket={selectedPhoenixMarket}
              baseTokenMetadata={baseTokenMetadata}
              quoteTokenMetadata={quoteTokenMetadata}
              connection={connection}
            />
          </div>
        </div>
        <div className={styles.orderProducerContainer}>
          <CLOBTrader
            phoenixMarket={selectedPhoenixMarket}
            baseTokenMetadata={baseTokenMetadata}
            quoteTokenMetadata={quoteTokenMetadata}
          />
        </div>
        <div
          onClick={() => {
            handleMobileTradeModalToggle();
          }}
        >
          <FloatingTradeButton
            isMobileTradeModalOpen={isMobileTradeModalOpen}
          />
        </div>
      </div>
      {isMobileTradeModalOpen && isMobile.current ? (
        <div className={styles.mobileTradeModalContainer}>
          <CLOBTrader
            phoenixMarket={selectedPhoenixMarket}
            baseTokenMetadata={baseTokenMetadata}
            quoteTokenMetadata={quoteTokenMetadata}
          />

          <div
            onClick={() => {
              handleMobileTradeModalToggle();
            }}
            style={{
              filter: `none`,
            }}
          >
            <FloatingTradeButton
              isMobileTradeModalOpen={isMobileTradeModalOpen}
            />
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export const getServerSideProps = async ({ params }) => {
  const { market } = params;

  let phoenixMarketOnPage: PhoenixMarket = null;
  let allTokenMetadata: TokenMetadata[] = null;
  let baseTokenMetadata: TokenMetadata = null;
  let quoteTokenMetadata: TokenMetadata = null;
  let allPhoenixMarkets: PhoenixMarket[] = [];
  let enumeratedMarkets: EnumeratedMarketToMetadata[] = [];

  [phoenixMarketOnPage, allTokenMetadata, allPhoenixMarkets] =
    await Promise.all([
      getMarket(market),
      getAllTokenMetadata(),
      getAllMarkets(),
    ]);

  if (allPhoenixMarkets && allPhoenixMarkets.length > 0) {
    allPhoenixMarkets.forEach((market) => {
      let baseMetadata = allTokenMetadata.find((value) => {
        return value.mint === market.base_token_mint;
      });

      let quoteMetadata = allTokenMetadata.find((value) => {
        return value.mint === market.quote_token_mint;
      });

      if (
        market.phoenix_market_address ===
        phoenixMarketOnPage.phoenix_market_address
      ) {
        baseTokenMetadata = allTokenMetadata.find((value) => {
          return value.mint === phoenixMarketOnPage.base_token_mint;
        });

        quoteTokenMetadata = allTokenMetadata.find((value) => {
          return value.mint === phoenixMarketOnPage.quote_token_mint;
        });
      }

      enumeratedMarkets.push({
        phoenixMarket: market,
        baseTokenMetadata: baseMetadata,
        quoteTokenMetadata: quoteMetadata,
      } as EnumeratedMarketToMetadata);
    });
  }

  return {
    props: {
      phoenixMarketOnPage: phoenixMarketOnPage ? phoenixMarketOnPage : null,
      enumeratedMarkets: enumeratedMarkets ? enumeratedMarkets : null,
      baseTokenMetadata:
        baseTokenMetadata === undefined ? null : baseTokenMetadata,
      quoteTokenMetadata:
        quoteTokenMetadata === undefined ? null : quoteTokenMetadata,
    },
  };
};

export default MarketPage;
