import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./BotPage.module.css";
import { EnumeratedMarketToMetadata } from "pages/market/[market]";
import { Order, PhoenixMarket, TokenMetadata, TradingBotMarket, TradingBotPosition, decimalPlacesFromTickSize } from "utils";
import { ChartingLibraryWidgetOptions, ResolutionString } from "public/static/charting_library/charting_library";
import { WRAPPED_SOL_MAINNET, DEFAULT_RESOLUTION, ChartType, USDC_MAINNET, ROOT_PROTOCOL_LAMPORT_COLLECTOR } from "constants/";
import TVChartContainer from "../OrderConsumer/components/TradingViewChart";
import MarketSelectorDropdown from "../OrderConsumer/components/MarketSelectorDropdown";
import MarketStats from "../OrderConsumer/components/MarketStats";
import { Button, Form } from "react-bootstrap";
import { useWallet } from "@solana/wallet-adapter-react";
import { useBottomStatus } from "components/BottomStatus";
import { L3UiOrder, Side, getCreateTokenAccountInstructions } from "@ellipsis-labs/phoenix-sdk";
import { useRootState } from "components/RootStateContextType";
import * as spotGridSdk from "@squarerootlabs/root-spot-grid-ts";
import { AnchorProvider, BN, web3 } from "@coral-xyz/anchor";
import { getPriorityFeeEstimate } from "utils/helius";
import { ComputeBudgetProgram, SystemProgram, TransactionInstruction } from "@solana/web3.js";
import { createCloseAccountInstruction, createSyncNativeInstruction, getAssociatedTokenAddress } from "@solana/spl-token";
import Link from "next/link";
import { allTradingBotMarkets as ALL_TRADING_BOT_MARKETS_METADATA } from "constants/types";
import { addPosition } from "utils/supabase/TradingBotPosition";
import { BotManagerView } from "constants/enums/BotManagerView";

export interface BotPageProps {
    enumeratedMarkets: Map<string, EnumeratedMarketToMetadata>;
    selectedPhoenixMarket: PhoenixMarket;
    baseTokenMetadata: TokenMetadata;
    quoteTokenMetadata: TokenMetadata;
    baseBalance: number;
    quoteBalance: number;
    nativeSOLBalance: number;
}

const BotPage = ({
    enumeratedMarkets,
    selectedPhoenixMarket,
    baseTokenMetadata,
    quoteTokenMetadata,
    baseBalance,
    quoteBalance,
    nativeSOLBalance
}: BotPageProps) => {
    const [activeMarket, setActiveMarket] = useState(selectedPhoenixMarket);
    const [activeEnumeratedMarket, setActiveEnumeratedMarket] =
      useState<EnumeratedMarketToMetadata>(null);

    const [minimumPrice, setMinimumPrice] = useState("");
    const [maximumPrice, setMaximumPrice] = useState("");
    const [numOrders, setNumOrders] = useState("");
    const [size, setSize] = useState("");
    const [requiredBaseSize, setRequiredBaseSize] = useState("");
    const [requiredQuoteSize, setRequiredQuoteSize] = useState("");
  
    const [enumeratedMarketsArray, setEnumeratedMarketsArray] = useState<EnumeratedMarketToMetadata[]>([]);
    const [tradingBotMarketMetadata, setTradingBotMarketMetadata] = useState<TradingBotMarket>();
    
    const { updateStatus, green, red, resetStatus } = useBottomStatus();
    const { midPrice, phoenixClient, connection } = useRootState();
    const wallet = useWallet();

    const [previewOrders, setPreviewOrders] = useState<L3UiOrder[]>([]);
    const [previewText, setPreviewText] = useState("");
    const [validationErrorText, setValidationErrorText] = useState("");

    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [userBotsActiveTab, setUserBotsActiveTab] = useState<BotManagerView>(BotManagerView.ActiveBots);

    const dummyCounter = useRef<number>(0);

    const defaultWidgetProps: Partial<ChartingLibraryWidgetOptions> = {
        symbol: `${baseTokenMetadata ? baseTokenMetadata.mint : WRAPPED_SOL_MAINNET}/${baseTokenMetadata ? baseTokenMetadata.ticker: `SOL`}/${quoteTokenMetadata ? quoteTokenMetadata.mint : USDC_MAINNET}/${quoteTokenMetadata ? quoteTokenMetadata.ticker : `USDC`}/${selectedPhoenixMarket ? selectedPhoenixMarket.tick_size : `0.001`}`,
        interval: `${DEFAULT_RESOLUTION}` as ResolutionString,
        library_path: "/static/charting_library/",
        locale: "en",
        fullscreen: false,
        autosize: true,
        client_id: "root.exchange",
      };
    
      const memoizedTradingViewChart = useMemo(
        () => <TVChartContainer props={defaultWidgetProps} chartType={ChartType.Pro} paneColor={`#0f1118`} isBotPage={true} />,
        [selectedPhoenixMarket, dummyCounter.current],
      );

      useEffect(() => {
        const doStuff = () => {
          setActiveMarket((_) => selectedPhoenixMarket);
    
          if (selectedPhoenixMarket) {
            let aem = enumeratedMarkets.get(selectedPhoenixMarket.phoenix_market_address);
            setActiveEnumeratedMarket((_) => aem);

            let tbmm = ALL_TRADING_BOT_MARKETS_METADATA.find((i) => i.phoenix_market_address === selectedPhoenixMarket.phoenix_market_address);
            setTradingBotMarketMetadata(_ => tbmm);
          }
        };
    
        doStuff();
      }, [selectedPhoenixMarket]);
    
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
                let minSizeFloat = phoenixClient.baseLotsToBaseAtoms(parseFloat(tradingBotMarketMetadata.min_order_size_in_base_lots), selectedPhoenixMarket.phoenix_market_address) / Math.pow(10, baseTokenMetadata.decimals);

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
            if(minimumPrice && maximumPrice && size && numOrders && selectedPhoenixMarket.is_bot_enabled) {
                let priorityFeeLevels = null;

                try {
                  priorityFeeLevels = (await getPriorityFeeEstimate([selectedPhoenixMarket.phoenix_market_address]))
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
                    minPriceInTicks: new BN(phoenixClient.floatPriceToTicks(parseFloat(minimumPrice), selectedPhoenixMarket.phoenix_market_address)),
                    maxPriceInTicks: new BN(phoenixClient.floatPriceToTicks(parseFloat(maximumPrice), selectedPhoenixMarket.phoenix_market_address)),
                    orderSizeInBaseLots: new BN(phoenixClient.baseAtomsToBaseLots(parseFloat(size) * Math.pow(10, baseTokenMetadata.decimals), selectedPhoenixMarket.phoenix_market_address)),
                } as spotGridSdk.PositionArgs;

                let baseTokenUserAc = await getAssociatedTokenAddress(new web3.PublicKey(baseTokenMetadata.mint), wallet.publicKey);
                let quoteTokenUserAc = await getAssociatedTokenAddress(new web3.PublicKey(quoteTokenMetadata.mint), wallet.publicKey);
            
                const provider = new AnchorProvider(connection, wallet, {});

                let createBotIx = await spotGridSdk.createPosition({
                    provider,
                    botMarketAddress: new web3.PublicKey(selectedPhoenixMarket.bot_market_address),
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
                        bot_market_address: selectedPhoenixMarket.bot_market_address,
                        trade_manager_address: createBotIx.tradeManagerAddress.toString(),
                        seat: createBotIx.seat.toString(),
                        mode: `arithmetic`,
                        num_orders: positionArgs.numOrders.toString(),
                        min_price_in_ticks: positionArgs.minPriceInTicks.toString(),
                        max_price_in_ticks: positionArgs.maxPriceInTicks.toString(),
                        order_size_in_base_lots: positionArgs.orderSizeInBaseLots.toString()
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
        <div className={styles.botPageContainer}>
            {/* <div className={styles.createBotHeaderContainer}>
                <h1>Create a  bot</h1>
            </div> */}
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
                                            selectedPhoenixMarket
                                            ? decimalPlacesFromTickSize(selectedPhoenixMarket.tick_size) >= 6
                                                ? `0.0001`
                                                : selectedPhoenixMarket.tick_size
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
                                            selectedPhoenixMarket
                                            ? decimalPlacesFromTickSize(selectedPhoenixMarket.tick_size) >= 6
                                                ? `0.0001`
                                                : selectedPhoenixMarket.tick_size
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
                                    placeholder={`${selectedPhoenixMarket ? (decimalPlacesFromTickSize(selectedPhoenixMarket.tick_size) >= 6 ? `0.0001` : selectedPhoenixMarket.tick_size) : ``} ${baseTokenMetadata ? baseTokenMetadata.ticker : ""}`}
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
                                                border: "3px solid #0B0C11",
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
                    <div
                        className={styles.userBotsMenuOption}
                        onClick={() => {
                            handleBotManagerViewChange(BotManagerView.History);
                          }}
                          style={{
                            color: userBotsActiveTab === BotManagerView.History ? `#eee` : ``,
                          }}
                    >
                        <span className={styles.userBotMenuTitle}>History</span>
                    </div>
                </div>
                <div className={styles.botsListViewContainer}>
                          
                </div>
            </div>
        </div>
    );
}

export default BotPage;