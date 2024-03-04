import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./BotPage.module.css";
import { EnumeratedMarketToMetadata } from "pages/market/[market]";
import { Order, PhoenixMarket, TokenMetadata, decimalPlacesFromTickSize } from "utils";
import { ChartingLibraryWidgetOptions, ResolutionString } from "public/static/charting_library/charting_library";
import { WRAPPED_SOL_MAINNET, DEFAULT_RESOLUTION, ChartType, USDC_MAINNET } from "constants/";
import TVChartContainer from "../OrderConsumer/components/TradingViewChart";
import MarketSelectorDropdown from "../OrderConsumer/components/MarketSelectorDropdown";
import MarketStats from "../OrderConsumer/components/MarketStats";
import { Form } from "react-bootstrap";
import { useWallet } from "@solana/wallet-adapter-react";
import { useBottomStatus } from "components/BottomStatus";
import { L3UiOrder, Side } from "@ellipsis-labs/phoenix-sdk";
import { useRootState } from "components/RootStateContextType";

export interface BotPageProps {
    enumeratedMarkets: Map<string, EnumeratedMarketToMetadata>;
    selectedPhoenixMarket: PhoenixMarket;
    baseTokenMetadata: TokenMetadata;
    quoteTokenMetadata: TokenMetadata;
}

const BotPage = ({
    enumeratedMarkets,
    selectedPhoenixMarket,
    baseTokenMetadata,
    quoteTokenMetadata
}: BotPageProps) => {

    const [activeMarket, setActiveMarket] = useState(selectedPhoenixMarket);
    const [activeEnumeratedMarket, setActiveEnumeratedMarket] =
      useState<EnumeratedMarketToMetadata>(null);

    const [minimumPrice, setMinimumPrice] = useState("");
    const [maximumPrice, setMaximumPrice] = useState("");
    const [numOrders, setNumOrders] = useState("");
    const [size, setSize] = useState("");
  
    const [enumeratedMarketsArray, setEnumeratedMarketsArray] = useState<EnumeratedMarketToMetadata[]>([]);
  
    const walletState = useWallet();
    const { updateStatus, green, red, resetStatus } = useBottomStatus();
    const { midPrice } = useRootState();

    const [previewOrders, setPreviewOrders] = useState<L3UiOrder[]>([]);

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

      const resetFields = () => {
        setMinimumPrice(_ => "");
        setMaximumPrice(_ => "");
        setNumOrders(_ => "");
        setSize(_ => "");
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

            console.log("Setting preview orders: ", orders);
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
                                        // disabled={!walletState.connected}
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
                                        // disabled={!walletState.connected}
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
                                        // disabled={!walletState.connected}
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
                                    // disabled={!walletState.connected}
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
                                    {walletState.connected && !isBuyOrder ? (
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
                                        You deposit{" "}
                                        </span>
                                    </span>
                                    </Form.Label>
                                </div>
                            </Form.Group>
                        </Form>
                    </div>
                </div>
            </div>
            <div className={styles.activeBotsContainer}>
            </div>
        </div>
    );
}

export default BotPage;