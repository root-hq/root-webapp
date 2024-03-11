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
import { MAX_ACCOUNT_SIZE_BYTES, PageTab } from "constants/";

import dynamic from "next/dynamic";
import { useRootState } from "../../components/RootStateContextType";
import { WEBSOCKETS_UPDATE_THROTTLING_INTERVAL_IN_MS } from "constants/";
import { useRouter } from "next/router";
import { ZSTDDecoder } from "zstddec";
import { useWallet } from "@solana/wallet-adapter-react";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

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
    activeTab
  } = useRootState();

  const [marketDataBuffer, setMarketDataBuffer] = useState<Buffer>(null);

  const [isMobileTradeModalOpen, setIsMobileTradeModalOpen] =
    useState<boolean>(false);

  const [phoenixMarketData, setPhoenixMarketData] = useState<PhoenixMarket>();
  const [baseTokenMetadata, setBaseTokenMetadata] = useState<TokenMetadata>();
  const [quoteTokenMetadata, setQuoteTokenMetadata] = useState<TokenMetadata>();

  const [baseTokenBalance, setBaseTokenBalance] = useState(0.0);
  const [quoteTokenBalance, setQuoteTokenBalance] = useState(0.0);
  const [nativeSOLBalance, setNativeSOLBalance] = useState(0.0);

  const [enumeratedMarkets, setEnumeratedMarkets] = useState<Map<string, EnumeratedMarketToMetadata>>(new Map());

  const router = useRouter();
  let phoenixMarketOnPage = router.query[`market`];
  const walletState = useWallet();

  let lastMessageTimestamp = 0;

  useEffect(() => {
    const loadData = () => {
      console.log("Loading all data");
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

  // WS updates useEffect
  useEffect(() => {
    if (phoenixMarketData) {
      const ws = new WebSocket(process.env.WS_ENDPOINT);

      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "accountSubscribe",
            params: [
              phoenixMarketData.phoenix_market_address,
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
  }, [phoenixMarketData]);

  // Polling useEffect
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
        refreshBidsAndAsks(buffer);
      }
    }

    pollForMarketData();
  }, [phoenixMarketData]);

  useEffect(() => {
    const decodeBuffer = async () => {
      if(marketDataBuffer) {
        const decoder = new ZSTDDecoder();
        await decoder.init();
        const marketBuffer = decoder.decode(
          marketDataBuffer,
          MAX_ACCOUNT_SIZE_BYTES,
        );
        refreshBidsAndAsks(Buffer.from(marketBuffer));
      }
    }

    decodeBuffer();
  }, [marketDataBuffer]);

  useEffect(() => {
    const updateBalance = async () => {
      if (walletState.connected && baseTokenMetadata && quoteTokenMetadata) {
        const baseTokenAddress = await getAssociatedTokenAddress(
          new web3.PublicKey(baseTokenMetadata.mint),
          walletState.publicKey,
        );
        const quoteTokenAddress = await getAssociatedTokenAddress(
          new web3.PublicKey(quoteTokenMetadata.mint),
          walletState.publicKey,
        );

        let baseBalance = 0;
        try {
          baseBalance = (
            await connection.getTokenAccountBalance(baseTokenAddress)
          ).value.uiAmount;
        } catch (Err) {
          // console.log(`Error fetching base ata balance`);
          baseBalance = 0;
        }

        let quoteBalance = 0;
        try {
          quoteBalance = (
            await connection.getTokenAccountBalance(quoteTokenAddress)
          ).value.uiAmount;
        } catch (err) {
          // console.log(`Error fetching quote ata balance`);
          quoteBalance = 0;
        }

        let nativeSOLLamports = await connection.getBalance(
          walletState.publicKey,
        );
        let nativeSOLBalance = nativeSOLLamports / LAMPORTS_PER_SOL;

        setBaseTokenBalance((_) => baseBalance);
        setQuoteTokenBalance((_) => quoteBalance);
        setNativeSOLBalance((_) => nativeSOLBalance);
      } else {
        setBaseTokenBalance((_) => 0);
        setQuoteTokenBalance((_) => 0);
      }
    };

    updateBalance();
  }, [
    phoenixMarketData,
    walletState
  ]);

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
