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

import { allTokenMetadata as ALL_TOKEN_METADATA, allPhoenixMarkets as ALL_PHOENIX_MARKETS } from "constants/types";

import {
  PhoenixMarket,
  TokenMetadata,
} from "../../utils/supabase";

import { web3 } from "@coral-xyz/anchor";
import { Client, getConfirmedMarketAccountZstd } from "@ellipsis-labs/phoenix-sdk";

import dynamic from "next/dynamic";
import { useRootState } from "../../components/RootStateContextType";
import { ACTIVE_ORDERS_REFRESH_FREQUENCY_IN_MS } from "constants/";
import { useRouter } from "next/router";

export interface EnumeratedMarketToMetadata {
  phoenixMarket: PhoenixMarket;
  baseTokenMetadata: TokenMetadata;
  quoteTokenMetadata: TokenMetadata;
}

const MarketPage = () => {
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

  const [marketDataBuffer, setMarketDataBuffer] = useState<Buffer>(null);

  const [isMobileTradeModalOpen, setIsMobileTradeModalOpen] =
    useState<boolean>(false);

  const [phoenixMarketData, setPhoenixMarketData] = useState<PhoenixMarket>();
  const [baseTokenMetadata, setBaseTokenMetadata] = useState<TokenMetadata>();
  const [quoteTokenMetadata, setQuoteTokenMetadata] = useState<TokenMetadata>();

  const [enumeratedMarkets, setEnumeratedMarkets] = useState<Map<string, EnumeratedMarketToMetadata>>(new Map());

  const router = useRouter();
  const phoenixMarketOnPage = router.query[`market`];

  let lastMessageTimestamp = 0;

  useEffect(() => {
    const loadData = () => {
      let atm: TokenMetadata[] = ALL_TOKEN_METADATA;
      let apm: PhoenixMarket[] = ALL_PHOENIX_MARKETS;

      let tm_map = new Map<string, TokenMetadata>();
      for(let m of atm) {
        tm_map.set(m.mint, m);
      }
    
      apm.forEach((market) => {
        let bm = tm_map.get(market.base_token_mint);
        let qm = tm_map.get(market.quote_token_mint);

        if(market.phoenix_market_address === phoenixMarketOnPage) {
          setPhoenixMarketData(_ => market);
          setBaseTokenMetadata(_ => bm);
          setQuoteTokenMetadata(_ => qm);
        }

        if(!enumeratedMarkets.get(market.phoenix_market_address)) {
          enumeratedMarkets.set(market.phoenix_market_address, {
            phoenixMarket: market,
            baseTokenMetadata: bm,
            quoteTokenMetadata: qm
          } as EnumeratedMarketToMetadata);
        }
      });
    }

    loadData();
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
      if (phoenixMarketData) {
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

          client.addMarket(phoenixMarketData.phoenix_market_address);

          setPhoenixClient(client);
          setConnection(conn);
        } else {
          console.log("Root state loaded all fine");
        }
      }
    };

    setupConnectionBackup();
  }, [phoenixMarketData, connection]);

  useEffect(() => {
    const pollForMarketData = async () => {
      if(phoenixMarketData) {
        let conn = connection;
        if(!connection) {
          conn = new web3.Connection(process.env.RPC_ENDPOINT);
          setConnection(conn);
        }

        let pc = phoenixClient;
        if(!pc) {
          pc = await Client.create(conn);
          setPhoenixClient(pc);
          pc.addMarket(phoenixMarketData.phoenix_market_address);
        }

        const buffer = await getConfirmedMarketAccountZstd(conn, new web3.PublicKey(phoenixMarketData.phoenix_market_address), 'processed');
        setMarketDataBuffer((_) => buffer);
      }
    }

    pollForMarketData();

    const intervalId = setInterval(() => {
      pollForMarketData();
    }, ACTIVE_ORDERS_REFRESH_FREQUENCY_IN_MS);

    return () => clearInterval(intervalId);
  }, [phoenixMarketData]);

  useEffect(() => {
    refreshBidsAndAsks(marketDataBuffer);
  }, [marketDataBuffer]);

  const handleMobileTradeModalToggle = () => {
    setIsMobileTradeModalOpen((_) => !isMobileTradeModalOpen);
  };

  return (
    <div className={styles.mainContainer}>
      <div>
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
                  selectedPhoenixMarket={phoenixMarketData}
                  baseTokenMetadata={baseTokenMetadata}
                  quoteTokenMetadata={quoteTokenMetadata}
                  connection={connection}
                />
              </div>
            </div>
            <div className={styles.orderProducerContainer}>
              <CLOBTrader
                phoenixMarket={phoenixMarketData}
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
                phoenixMarket={phoenixMarketData}
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
    </div>
  );
};

export default MarketPage;
