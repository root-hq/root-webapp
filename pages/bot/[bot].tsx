import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./BotPage.module.css";
import { EnumeratedMarketToMetadata } from "pages/market/[market]";
import { Order, PhoenixMarket, TokenMetadata, TradingBotMarket, TradingBotPosition, decimalPlacesFromTickSize, getTraderState } from "utils";
import { ChartingLibraryWidgetOptions, ResolutionString } from "public/static/charting_library/charting_library";
import { WRAPPED_SOL_MAINNET, DEFAULT_RESOLUTION, ChartType, USDC_MAINNET, ROOT_PROTOCOL_LAMPORT_COLLECTOR, ACTIVE_ORDERS_REFRESH_FREQUENCY_IN_MS, WEBSOCKETS_UPDATE_THROTTLING_INTERVAL_IN_MS, MAX_ACCOUNT_SIZE_BYTES } from "constants/";
import { allTokenMetadata as ALL_TOKEN_METADATA, allPhoenixMarkets as ALL_PHOENIX_MARKETS } from "constants/types";
import { Button, Form } from "react-bootstrap";
import { useWallet } from "@solana/wallet-adapter-react";
import { useBottomStatus } from "components/BottomStatus";
import { L3UiOrder, Side, getCreateTokenAccountInstructions } from "@ellipsis-labs/phoenix-sdk";
import { useRootState } from "components/RootStateContextType";
import * as spotGridSdk from "@squarerootlabs/root-spot-grid-ts";
import { AnchorProvider, BN, web3 } from "@coral-xyz/anchor";
import { getPriorityFeeEstimate } from "utils/helius";
import { ComputeBudgetProgram, LAMPORTS_PER_SOL, SystemProgram, TransactionInstruction } from "@solana/web3.js";
import { createCloseAccountInstruction, createSyncNativeInstruction, getAssociatedTokenAddress } from "@solana/spl-token";
import Link from "next/link";
import { allTradingBotMarkets as ALL_TRADING_BOT_MARKETS_METADATA } from "constants/types";
import { addPosition, getPositionsForOwner } from "utils/supabase/TradingBotPosition";
import { BotManagerView } from "constants/enums/BotManagerView";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { Client, getConfirmedMarketAccountZstd } from "@ellipsis-labs/phoenix-sdk";
import { ZSTDDecoder } from "zstddec";

const ActiveBots = dynamic(() => import("./components/ActiveBots"));
const TVChartContainer = dynamic(() => import("../market/components/OrderConsumer/components/TradingViewChart"));
const MarketSelectorDropdown = dynamic(() => import("../market/components/OrderConsumer/components/MarketSelectorDropdown"));
const MarketStats = dynamic(() => import("../market/components/OrderConsumer/components/MarketStats"));

const BotPage = () => {
    const [phoenixMarketData, setPhoenixMarketData] = useState<PhoenixMarket>();
    const [baseTokenMetadata, setBaseTokenMetadata] = useState<TokenMetadata>();
    const [quoteTokenMetadata, setQuoteTokenMetadata] = useState<TokenMetadata>();

    const [baseTokenBalance, setBaseTokenBalance] = useState(0.0);
    const [quoteTokenBalance, setQuoteTokenBalance] = useState(0.0);
    const [nativeSOLBalance, setNativeSOLBalance] = useState(0.0);

    const [enumeratedMarkets, setEnumeratedMarkets] = useState<Map<string, EnumeratedMarketToMetadata>>(new Map());

    const router = useRouter();
    let phoenixMarketOnPage = router.query[`bot`];

    const [activeMarket, setActiveMarket] = useState(phoenixMarketData);
    const [activeEnumeratedMarket, setActiveEnumeratedMarket] =
      useState<EnumeratedMarketToMetadata>(null);

      const [marketDataBuffer, setMarketDataBuffer] = useState<Buffer>(null);
      let lastMessageTimestamp = 0;

      const { midPrice, phoenixClient, connection, setPhoenixClient, setConnection, refreshBidsAndAsks } = useRootState();
      const wallet = useWallet();

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
        if (wallet.connected && baseTokenMetadata && quoteTokenMetadata) {
          const baseTokenAddress = await getAssociatedTokenAddress(
            new web3.PublicKey(baseTokenMetadata.mint),
            wallet.publicKey,
          );
          const quoteTokenAddress = await getAssociatedTokenAddress(
            new web3.PublicKey(quoteTokenMetadata.mint),
            wallet.publicKey,
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
            wallet.publicKey,
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
      wallet
    ]);
    

    const [minimumPrice, setMinimumPrice] = useState("");
    const [maximumPrice, setMaximumPrice] = useState("");
    const [numOrders, setNumOrders] = useState("");
    const [size, setSize] = useState("");
    const [requiredBaseSize, setRequiredBaseSize] = useState("");
    const [requiredQuoteSize, setRequiredQuoteSize] = useState("");

    const [previewOrders, setPreviewOrders] = useState<L3UiOrder[]>([]);
    const [previewText, setPreviewText] = useState("");
    const [validationErrorText, setValidationErrorText] = useState("");

    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [loadingPositions, setLoadingPositions] = useState<boolean>(false);
    const [userBotsActiveTab, setUserBotsActiveTab] = useState<BotManagerView>(BotManagerView.ActiveBots);

    const [userBots, setUserBots] = useState<TradingBotPosition[]>([]);
  
    const [enumeratedMarketsArray, setEnumeratedMarketsArray] = useState<EnumeratedMarketToMetadata[]>([]);
    const [tradingBotMarketMetadata, setTradingBotMarketMetadata] = useState<TradingBotMarket>();
    
    const { updateStatus, green, red } = useBottomStatus();

    const dummyCounter = useRef<number>(0);

    const defaultWidgetProps: Partial<ChartingLibraryWidgetOptions> = {
        symbol: `${baseTokenMetadata ? baseTokenMetadata.mint : WRAPPED_SOL_MAINNET}/${baseTokenMetadata ? baseTokenMetadata.ticker: `SOL`}/${quoteTokenMetadata ? quoteTokenMetadata.mint : USDC_MAINNET}/${quoteTokenMetadata ? quoteTokenMetadata.ticker : `USDC`}/${phoenixMarketData ? phoenixMarketData.tick_size : `0.001`}`,
        interval: `${DEFAULT_RESOLUTION}` as ResolutionString,
        library_path: "/static/charting_library/",
        locale: "en",
        fullscreen: false,
        autosize: true,
        client_id: "root.exchange",
      };
    
      const memoizedTradingViewChart = useMemo(
        () => <TVChartContainer props={defaultWidgetProps} chartType={ChartType.Pro} paneColor={`#141721`} isBotPage={true} />,
        [phoenixMarketData, dummyCounter.current],
      );

      useEffect(() => {
        const doStuff = () => {
          setActiveMarket((_) => phoenixMarketData);

          if (phoenixMarketData) {
            let aem = enumeratedMarkets.get(phoenixMarketData.phoenix_market_address);
            setActiveEnumeratedMarket((_) => aem);

            let tbmm = ALL_TRADING_BOT_MARKETS_METADATA.find((i) => i.phoenix_market_address === phoenixMarketData.phoenix_market_address);
            setTradingBotMarketMetadata(_ => tbmm);
          }
        };
    
        doStuff();
      }, [phoenixMarketData]);

      useEffect(() => {
        const fetchUserBots = async () => {
            if(wallet && wallet.connected) {
                const ub = await getPositionsForOwner(wallet.publicKey.toString());
                setUserBots(_ => ub);
            }
            else {
                setUserBots(_ => []);
            }
        }

        const intervalId = setInterval(() => {
            fetchUserBots();
          }, ACTIVE_ORDERS_REFRESH_FREQUENCY_IN_MS);
      
          return () => clearInterval(intervalId);
      
      }, [phoenixMarketData, wallet]);
    
      useEffect(() => {
        const incrementer = () => {
          dummyCounter.current += 1;
        };
    
        incrementer();
    
        const intervalId = setInterval(
          () => {
            incrementer();
          },
          DEFAULT_RESOLUTION * 1_000 * 60,
        );
    
        return () => clearInterval(intervalId);
      }, []);
    
      useEffect(() => {
        const doStuff = () => {
          let ema = [];
          enumeratedMarkets.forEach((entry) => {
            if(entry.phoenixMarket.is_bot_enabled) {
                ema.push(entry);
            }
          });
          setEnumeratedMarketsArray(_ => ema);
        }
    
        doStuff();
      }, [enumeratedMarkets]);

      useEffect(() => {
        calculatePreviewOrders();
      }, [minimumPrice, maximumPrice, numOrders, size, midPrice]);

      useEffect(() => {
        const validateSize = () => {
            if(size) {
                let sizeFloat = parseFloat(size);
                let minSizeFloat = phoenixClient.baseLotsToBaseAtoms(parseFloat(tradingBotMarketMetadata.min_order_size_in_base_lots), phoenixMarketData.phoenix_market_address) / Math.pow(10, baseTokenMetadata.decimals);

                if(sizeFloat < minSizeFloat) {
                    setValidationErrorText(_ => `Min. order size: ${minSizeFloat}`)
                }
                else {
                    setValidationErrorText(_ => "");
                }
            }
            else {
                setValidationErrorText(_ => "");
            }
        }

        validateSize();
      }, [size]);

      useEffect(() => {
        const calculatePreviewText = () => {
            let baseSize = 0;
            let quoteSize = 0;
            
            for(let order of previewOrders) {
                if(order.side === Side.Bid) {
                    quoteSize += order.size * order.price;
                }
                else {
                    baseSize += order.size;
                }
            }

            let text = "";

            if(baseSize || quoteSize) {
                text = `You deposit`;
                if(baseSize > 0) {
                    text += ` ${baseSize.toFixed(baseTokenMetadata.decimals)} ${baseTokenMetadata.ticker}`;
                    setRequiredBaseSize(_ => baseSize.toString());
                }

                if(quoteSize >= 0) {
                    if(baseSize) {
                        text += " and "
                    }
                    text += ` ${quoteSize.toFixed(quoteTokenMetadata.decimals)} ${quoteTokenMetadata.ticker}`;
                    setRequiredQuoteSize(_ => quoteSize.toString());
                }
            }

            setPreviewText(_ => text);
        }

        calculatePreviewText();
      }, [previewOrders]);

      const handleMinimumPriceChange = (e) => {
        setMinimumPrice(_ => e.target.value);
      }

      const handleMaximumPriceChange = (e) => {
        setMaximumPrice(_ => e.target.value);
      }

      const handleNumOrdersChange = (e) => {
        setNumOrders(_ => e.target.value);
      }

      const handleSizeChange = (e) => {
        setSize(_ => e.target.value);
      }

      const handleCreateBotAction = async () => {
        setIsButtonLoading(_ => true);
        try {
            if(minimumPrice && maximumPrice && size && numOrders && phoenixMarketData.is_bot_enabled) {
                let priorityFeeLevels = null;

                try {
                  priorityFeeLevels = (await getPriorityFeeEstimate([phoenixMarketData.phoenix_market_address]))
                    .priorityFeeLevels;
                } catch (err) {
                  // console.log(`Error fetching priority fee levels`);
                }
          
                updateStatus(<span>{`Preparing bot creation transaction...`}</span>);
                let transaction = new web3.Transaction();
          
                // Create the priority fee instructions
                let unitsPrice = 10;
                if (priorityFeeLevels) {
                    unitsPrice = priorityFeeLevels["veryHigh"];
                }

                const computePriceIx = ComputeBudgetProgram.setComputeUnitPrice({
                    microLamports: parseInt(unitsPrice.toString()),
                });

                const computeLimitIx = ComputeBudgetProgram.setComputeUnitLimit({
                    units: 500_000,
                });
                transaction.add(computePriceIx);
                transaction.add(computeLimitIx);

                let baseAtaInitIxs = await getCreateTokenAccountInstructions(
                    connection,
                    wallet.publicKey,
                    wallet.publicKey,
                    new web3.PublicKey(baseTokenMetadata.mint),
                );
                
                let quoteAtaInitIxs = await getCreateTokenAccountInstructions(
                    connection,
                    wallet.publicKey,
                    wallet.publicKey,
                    new web3.PublicKey(quoteTokenMetadata.mint),
                );

                for (let ix of baseAtaInitIxs) {
                    transaction.add(ix);
                }
                for (let ix of quoteAtaInitIxs) {
                    transaction.add(ix);
                }

                let wrapSOLIxs: TransactionInstruction[] = [];
                let unwrapSOLIxs: TransactionInstruction[] = [];

                // Add wrap/unwrap SOL ixs here
                if (
                    (quoteTokenMetadata.mint === WRAPPED_SOL_MAINNET) ||
                    (baseTokenMetadata.mint === WRAPPED_SOL_MAINNET)
                ) {
                    const wSOLAta = await getAssociatedTokenAddress(
                    new web3.PublicKey(WRAPPED_SOL_MAINNET),
                    wallet.publicKey,
                    );

                    let balance = 0;
                    if(requiredBaseSize) {
                        balance = parseInt(
                            (parseFloat(requiredBaseSize) * Math.pow(10, 9)).toString(),
                            );
                    }

                    let transferIx = SystemProgram.transfer({
                    fromPubkey: wallet.publicKey,
                    toPubkey: wSOLAta,
                    lamports: balance,
                    });

                    // sync wrapped SOL balance
                    let syncNativeIx = createSyncNativeInstruction(wSOLAta);

                    wrapSOLIxs.push(transferIx);
                    wrapSOLIxs.push(syncNativeIx);

                    let withdrawIx = createCloseAccountInstruction(
                    wSOLAta,
                    wallet.publicKey,
                    wallet.publicKey,
                    );

                    unwrapSOLIxs.push(withdrawIx);
                }

                for (let ix of wrapSOLIxs) {
                    transaction.add(ix);
                }

                const positionArgs = {
                    mode: {
                        arithmetic: {}
                    },
                    numOrders: new BN(numOrders),
                    minPriceInTicks: new BN(phoenixClient.floatPriceToTicks(parseFloat(minimumPrice), phoenixMarketData.phoenix_market_address)),
                    maxPriceInTicks: new BN(phoenixClient.floatPriceToTicks(parseFloat(maximumPrice), phoenixMarketData.phoenix_market_address)),
                    orderSizeInBaseLots: new BN(phoenixClient.baseAtomsToBaseLots(parseFloat(size) * Math.pow(10, baseTokenMetadata.decimals), phoenixMarketData.phoenix_market_address)),
                } as spotGridSdk.PositionArgs;

                let baseTokenUserAc = await getAssociatedTokenAddress(new web3.PublicKey(baseTokenMetadata.mint), wallet.publicKey);
                let quoteTokenUserAc = await getAssociatedTokenAddress(new web3.PublicKey(quoteTokenMetadata.mint), wallet.publicKey);
            
                const provider = new AnchorProvider(connection, wallet, {});

                let createBotIx = await spotGridSdk.createPosition({
                    provider,
                    botMarketAddress: new web3.PublicKey(phoenixMarketData.bot_market_address),
                    baseTokenUserAc,
                    quoteTokenUserAc,
                    positionArgs
                });

                for(let ix of createBotIx.transactionInfos[0].transaction.instructions) {
                    transaction.add(ix);
                }
    
                for (let ix of unwrapSOLIxs) {
                    transaction.add(ix);
                }

                // Transfer 1 lamports to Root Multisig for future referencing purposes
                const transferIx = SystemProgram.transfer({
                    fromPubkey: wallet.publicKey,
                    toPubkey: new web3.PublicKey(ROOT_PROTOCOL_LAMPORT_COLLECTOR),
                    lamports: new BN(1),
                });
                transaction.add(transferIx);

                updateStatus(<span>{`Awaiting confirmation ⏱...`}</span>);
                let response = await wallet.sendTransaction(
                    transaction,
                    connection,
                    {
                    skipPreflight: true,
                    },
                );

                try {
                    await addPosition({
                        owner: wallet.publicKey.toString(),
                        position_address: createBotIx.positionAddress.toString(),
                        position_key: createBotIx.positionKey.toString(),
                        bot_market_address: phoenixMarketData.bot_market_address,
                        trade_manager_address: createBotIx.tradeManagerAddress.toString(),
                        seat: createBotIx.seat.toString(),
                        mode: `arithmetic`,
                        num_orders: positionArgs.numOrders.toString(),
                        min_price_in_ticks: positionArgs.minPriceInTicks.toString(),
                        max_price_in_ticks: positionArgs.maxPriceInTicks.toString(),
                        order_size_in_base_lots: positionArgs.orderSizeInBaseLots.toString(),
                        quote_size_deposited: (parseFloat(requiredQuoteSize) + (parseFloat(requiredBaseSize) * midPrice.current)).toString(),
                        is_closed: false,
                        timestamp: Date.now().toString()
                    } as TradingBotPosition);
                }
                catch(err) {
                    console.log("Error adding TradingBotPosition to database");
                }
                
                green(
                    <span>
                    {`Bot created `}
                    <Link
                        href={`https://solscan.io/tx/${response}`}
                        target="_blank"
                    >{` ↗️`}</Link>
                    </span>,
                    3_000,
                );
            }
        }
        catch(err) {
            red(<span>{`Failed: ${err.message}`}</span>, 2_000);
        }
        setIsButtonLoading(_ => false);
        resetFields();
      }

      const handleBotManagerViewChange = (newView: BotManagerView) => {
        setUserBotsActiveTab((_) => newView);
      };

      const resetFields = () => {
        setMinimumPrice(_ => "");
        setMaximumPrice(_ => "");
        setNumOrders(_ => "");
        setSize(_ => "");
        setPreviewOrders(_ => []);
        setPreviewText(_ => "");
      }

      const calculatePreviewOrders = () => {
        if(
            (minimumPrice && minimumPrice.length) &&
            (maximumPrice && maximumPrice.length) &&
            (numOrders && numOrders.length) &&
            (size && size.length)
        ) {
            let orders: L3UiOrder[] = [];
            let minPrice = parseFloat(minimumPrice);
            let maxPrice = parseFloat(maximumPrice);
            let numOrds = parseFloat(numOrders);
            let step = (maxPrice - minPrice) / numOrds;

            let tracker = minPrice;
            while(tracker < maxPrice) {
                orders.push({
                    price: tracker,
                    side: tracker > midPrice.current ? Side.Ask : Side.Bid,
                    size: parseFloat(size),
                    makerPubkey: "",
                    orderSequenceNumber: "",
                    lastValidSlot: 0,
                    lastValidUnixTimestampInSeconds: 0
                } as L3UiOrder);

                tracker += step;
            }

            setPreviewOrders(_ => orders);
        }
      }

    return (
        <div className={styles.botPageOuterContainer}>
          <div className={styles.botPageContainer}>
            <div className={styles.botViewerContainer}>
                <div className={styles.botChartContainer}>
                    <div className={styles.marketDataContainer}>
                        <div
                            className={styles.chartContainer}
                            style={{
                                width: `100%`
                            }}
                        >
                            <div className={styles.marketInfoContainer}>
                                <div className={styles.marketSelectorContainer}>
                                <MarketSelectorDropdown
                                    enumeratedMarkets={enumeratedMarketsArray}
                                    selectedBaseTokenMetadata={baseTokenMetadata}
                                    selectedQuoteTokenMetadata={quoteTokenMetadata}
                                    topLevelActiveMarketState={activeMarket}
                                    setTopLevelActiveMarketState={setActiveMarket}
                                    isBotPage={true}
                                />
                                </div>
                                <div className={styles.marketStatsContainer}>
                                <MarketStats
                                    enumeratedMarket={activeEnumeratedMarket}
                                    showOrderBook={false}
                                    isBotPage={true}
                                />
                                </div>
                            </div>
                            <div className={styles.tradingViewChartContainer}>
                                {memoizedTradingViewChart}
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.createBotContainer}>
                    <div className={styles.createBotFormHeader}>
                        <span>Create a bot</span>
                    </div>
                    <div className={styles.resetFieldsButtonContainer}>
                        <span className={styles.resetFieldsButton}
                            onClick={() => {
                                resetFields()
                            }}
                        >Reset</span>
                    </div>
                    <div className={styles.createBotFormContainer}>
                        <Form>
                            <Form.Group controlId="formInput" className={styles.formGroupContainer}>
                                <div className={styles.formLabelAndFieldContainer}>
                                    <Form.Label className={styles.formLabelContainer}>
                                        <span>Min. price</span>
                                    </Form.Label>
                                    <Form.Control
                                        placeholder={
                                            phoenixMarketData
                                            ? decimalPlacesFromTickSize(phoenixMarketData.tick_size) >= 6
                                                ? `0.0001`
                                                : phoenixMarketData.tick_size
                                            : ``
                                        }
                                        // disabled={!wallet.connected}
                                        style={{
                                            backgroundColor: "transparent",
                                            fontSize: "1.1rem",
                                            fontWeight: "bold",
                                            textAlign: "right",
                                            color: "#ddd",
                                            border: "none",
                                            caretColor: "#ddd",
                                            padding: "1rem",
                                        }}
                                        min="0"
                                        step="0.01" // Allow any decimal value
                                        className={styles.formFieldContainer}
                                        onChange={(e) => handleMinimumPriceChange(e)}
                                        value={minimumPrice} // Use inputText instead of inputAmount to show the decimal value
                                    />
                                </div>
                            </Form.Group>
                        </Form>
                        <Form>
                            <Form.Group controlId="formInput" className={styles.formGroupContainer}>
                                <div className={styles.formLabelAndFieldContainer}>
                                    <Form.Label className={styles.formLabelContainer}>
                                        <span>Max. price</span>
                                    </Form.Label>
                                    <Form.Control
                                        placeholder={
                                            phoenixMarketData
                                            ? decimalPlacesFromTickSize(phoenixMarketData.tick_size) >= 6
                                                ? `0.0001`
                                                : phoenixMarketData.tick_size
                                            : ``
                                        }
                                        // disabled={!wallet.connected}
                                        style={{
                                            backgroundColor: "transparent",
                                            fontSize: "1.1rem",
                                            fontWeight: "bold",
                                            textAlign: "right",
                                            color: "#ddd",
                                            border: "none",
                                            caretColor: "#ddd",
                                            padding: "1rem",
                                        }}
                                        min="0"
                                        step="0.01" // Allow any decimal value
                                        className={styles.formFieldContainer}
                                        onChange={(e) => handleMaximumPriceChange(e)}
                                        value={maximumPrice} // Use inputText instead of inputAmount to show the decimal value
                                    />
                                </div>
                            </Form.Group>
                        </Form>
                        <Form>
                            <Form.Group controlId="formInput" className={styles.formGroupContainer}>
                                <div className={styles.formLabelAndFieldContainer}>
                                    <Form.Label className={styles.formLabelContainer}>
                                        <span>Num. orders</span>
                                    </Form.Label>
                                    <Form.Control
                                        placeholder={`5`}
                                        // disabled={!wallet.connected}
                                        style={{
                                            backgroundColor: "transparent",
                                            fontSize: "1.1rem",
                                            fontWeight: "bold",
                                            textAlign: "right",
                                            color: "#ddd",
                                            border: "none",
                                            caretColor: "#ddd",
                                            padding: "1rem",
                                        }}
                                        min="0"
                                        step="0.01" // Allow any decimal value
                                        className={styles.formFieldContainer}
                                        onChange={(e) => handleNumOrdersChange(e)}
                                        value={numOrders} // Use inputText instead of inputAmount to show the decimal value
                                    />
                                </div>
                            </Form.Group>
                        </Form>
                        <Form>
                            <Form.Group controlId="formInput" className={styles.formGroupContainer}>
                                <div className={styles.formLabelAndFieldContainer}>
                                    <Form.Label className={styles.formLabelContainer}>
                                    <span className={styles.fieldTitleContainer}>
                                        <span>
                                        Order size{" "}
                                        {`(${baseTokenMetadata ? baseTokenMetadata.ticker : ``})`}
                                        </span>
                                    </span>
                                    </Form.Label>
                                    <Form.Control
                                    placeholder={`${phoenixMarketData ? (decimalPlacesFromTickSize(phoenixMarketData.tick_size) >= 6 ? `0.0001` : phoenixMarketData.tick_size) : ``} ${baseTokenMetadata ? baseTokenMetadata.ticker : ""}`}
                                    // disabled={!wallet.connected}
                                    style={{
                                        backgroundColor: "transparent",
                                        fontSize: "1.1rem",
                                        fontWeight: "bold",
                                        textAlign: "right",
                                        color: "#ddd",
                                        border: "none",
                                        caretColor: "#ddd",
                                        padding: "1rem",
                                    }}
                                    min="0"
                                    step="0.01" // Allow any decimal value
                                    className={styles.formFieldContainer}
                                    onChange={(e) => handleSizeChange(e)}
                                    value={size} // Use inputText instead of inputAmount to show the decimal value
                                    />
                                </div>
                                {/* <div className={styles.tokenBalanceContainer}>
                                    {wallet.connected && !isBuyOrder ? (
                                    <div className={styles.userBalanceContainer}>
                                        <span
                                        className={styles.userBalance}
                                        onClick={() => {
                                            // formatNumbersWithCommas(isBuyOrder ? quoteTokenBalance.toString() : baseTokenBalance.toString(), setSendUptoSize);
                                            isBuyOrder
                                            ? handleSendUptoSizeChange(
                                                null,
                                                quoteTokenBalance.toString(),
                                                )
                                            : handleSendUptoSizeChange(
                                                null,
                                                baseTokenBalance.toString(),
                                                );
                                        }}
                                        >
                                        <i className="fa-solid fa-wallet fa-2xs"></i>
                                        {` `}
                                        {baseTokenMetadata && quoteTokenMetadata
                                            ? isBuyOrder
                                            ? quoteTokenMetadata.mint === WRAPPED_SOL_MAINNET
                                                ? quoteTokenBalance + nativeSOLBalance
                                                : quoteTokenBalance
                                            : baseTokenMetadata.mint === WRAPPED_SOL_MAINNET
                                                ? baseTokenBalance + nativeSOLBalance
                                                : baseTokenBalance
                                            : `0.0`}
                                        </span>
                                    </div>
                                    ) : (
                                    <div className={styles.userBalanceContainer}>
                                        <span>{` `}</span>
                                    </div>
                                    )}
                                </div> */}
                            </Form.Group>
                        </Form>
                        <Form>
                            <Form.Group controlId="formInput" className={styles.formGroupContainer}>
                                <div className={styles.formLabelAndFieldContainerNoBottomMargin}>
                                    <Form.Label className={styles.depositTextContainer}>
                                    <span className={styles.fieldTitleContainer}>
                                        <span>
                                            {
                                                validationErrorText && validationErrorText.length ?
                                                    <div className={styles.validationErrorText}>{`${validationErrorText}`}</div>
                                                :
                                                    previewText && previewText.length ?
                                                    <div className={styles.previewText}>{`${previewText}`}</div>
                                                    :
                                                        ``
                                            }
                                        </span>
                                    </span>
                                    </Form.Label>
                                </div>
                            </Form.Group>
                        </Form>
                        
                        <Form>
                            <Form.Group controlId="formInput" className={styles.formGroupContainer}>
                                <div className={styles.createBotButtonContainer}>
                                    <Button className={styles.createBotButton}
                                        onClick={() => handleCreateBotAction()}
                                        disabled= {
                                            validationErrorText && validationErrorText.length > 0
                                        }
                                    >
                                        {isButtonLoading ? (
                                            <div className={styles.spinnerBox}>
                                            <div
                                                className={styles.threeQuarterSpinner}
                                                style={{
                                                border: "3px solid #0f1118",
                                                borderTop: `3px solid transparent`,
                                                }}
                                            ></div>
                                            </div>
                                        ) : (
                                            <>{`Create bot`}</>
                                        )}

                                    </Button>
                                </div>
                            </Form.Group>
                        </Form>
                    </div>
                </div>
            </div>
            <div className={styles.activeBotsContainer}>
                <div className={styles.userBotsMenuSwitch}>
                    <div
                        className={styles.userBotsMenuOption}
                        onClick={() => {
                            handleBotManagerViewChange(BotManagerView.ActiveBots);
                          }}
                          style={{
                            color: userBotsActiveTab === BotManagerView.ActiveBots ? `#eee` : ``,
                          }}
                    >
                        <span className={styles.userBotMenuTitle}>Active bots</span>
                    </div>
                    {/* <div
                        className={styles.userBotsMenuOption} 
                        onClick={() => {
                            handleBotManagerViewChange(BotManagerView.History);
                          }}
                          style={{
                            color: userBotsActiveTab === BotManagerView.History ? `#eee` : ``,
                          }}
                    >
                        <span className={styles.userBotMenuTitle}>History</span>
                    </div> */}
                </div>
                <div className={styles.columnNamesOuterContainer}>
                    {
                        <div className={styles.columnNamesContainer}>
                            <div
                                className={styles.columnNameRow}
                                style={{ width: `${100 / 5}%` }}
                            >
                                <span className={styles.columnName}>{`Min. price`}</span>
                            </div>
                            <div
                                className={styles.columnNameRow}
                                style={{ width: `${100 / 5}%` }}
                            >
                                <span className={styles.columnName}>{`Max. price`}</span>
                            </div>
                            <div
                                className={styles.columnNameRow}
                                style={{ width: `${100 / 5}%` }}
                            >
                                <span className={styles.columnName}>{`Portfolio value (USD)`}</span>
                            </div>
                            <div
                                className={styles.columnNameRow}
                                style={{ width: `${100 / 5}%` }}
                            >
                                <span className={styles.columnName}>{`Fee earned (${quoteTokenMetadata ? quoteTokenMetadata.ticker: ``})`}</span>
                            </div>
                            <div
                                className={styles.columnNameRow}
                                style={{ width: `${100 / 5}%` }}
                            >
                                <span className={styles.columnName}>{`Fee APR`}</span>
                            </div>
                            <div
                                className={styles.columnNameRow}
                                style={{ width: `${100 / 5}%` }}
                            >
                                <span className={styles.columnName}>{``}</span>
                            </div>
                        </div>
                    }
                </div>
                <div className={styles.botsListViewContainer}>
                    {
                        wallet && userBots && userBots.length > 0 ?
                            <div className={styles.botsListView}>
                                {
                                    userBots.map((bot, i) => {
                                        if(bot) {
                                            return (
                                                <div className={styles.botView} key={bot.position_address}>
                                                   <ActiveBots 
                                                      phoenixMarket={phoenixMarketData}
                                                      bot={bot} baseTokenMetadata={baseTokenMetadata}
                                                      quoteTokenMetadata={quoteTokenMetadata}
                                                      loadingPositions={loadingPositions}
                                                      setLoadingPositions={setLoadingPositions}  
                                                    />
                                                </div>
                                            )
                                        }
                                        else {
                                            return (
                                                <div>
                                                </div>
                                            )
                                        }
                                    })
                                }
                            </div>
                        :
                            <div className={styles.noOrderViewContainer}>
                                <span>{
                                    loadingPositions ?
                                      `Loading positions...`
                                    :
                                      `No active bots`
                                  }</span>
                            </div>
                    }
                </div>
            </div>
        </div>
        </div>
    );
}

export default BotPage;