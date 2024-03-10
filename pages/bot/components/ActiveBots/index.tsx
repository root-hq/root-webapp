import React, { useEffect, useState } from "react";
import styles from "./ActiveBots.module.css";
import { PhoenixMarket, TokenMetadata, TradingBotPosition, delay, getTraderState } from "utils";
import { useRootState } from "components/RootStateContextType";
import { useBottomStatus } from "components/BottomStatus";
import { getPriorityFeeEstimate } from "utils/helius";
import { AnchorProvider, BN, web3 } from "@coral-xyz/anchor";
import { ComputeBudgetProgram, SystemProgram, TransactionInstruction } from "@solana/web3.js";
import { getCreateTokenAccountInstructions } from "@ellipsis-labs/phoenix-sdk";
import { useWallet } from "@solana/wallet-adapter-react";
import { ACTIVE_ORDERS_REFRESH_FREQUENCY_IN_MS, ROOT_PROTOCOL_LAMPORT_COLLECTOR, WRAPPED_SOL_MAINNET } from "constants/";
import { createCloseAccountInstruction, getAssociatedTokenAddress } from "@solana/spl-token";
import * as spotGridSdk from "@squarerootlabs/root-spot-grid-ts";
import { addPosition, closePosition } from "utils/supabase/TradingBotPosition";
import Link from "next/link";

export interface ActiveBotsProps {
    phoenixMarket: PhoenixMarket;
    baseTokenMetadata: TokenMetadata;
    quoteTokenMetadata: TokenMetadata;
    bot: TradingBotPosition;
}

const ActiveBots = ({
    phoenixMarket,
    baseTokenMetadata,
    quoteTokenMetadata,
    bot
}: ActiveBotsProps) => {

    const [uiMinPrice, setUiMinPrice] = useState<string>("");
    const [uiMaxPrice, setUiMaxPrice] = useState<string>("");
    const [depositValueUSD, setDepositValueUSD] = useState<string>("");
    const [uiProfitQuoteSize, setUiProfitQuoteSize] = useState<string>("");
    const [realizedAPR, setRealizedAPR] = useState<string>("");

    const [isCloseBotButtonLoading, setIsCloseBotButtonLoading] = useState<boolean>(false);

    const { phoenixClient, connection, midPrice } = useRootState();
    const { updateStatus, green, red } = useBottomStatus();
    const wallet = useWallet();

    useEffect(() => {
        const populateLocalState = async () => {
            if(phoenixClient) {
                const minPriceFloat = phoenixClient.ticksToFloatPrice(parseInt(bot.min_price_in_ticks), phoenixMarket.phoenix_market_address);
                const maxPriceFloat = phoenixClient.ticksToFloatPrice(parseInt(bot.max_price_in_ticks), phoenixMarket.phoenix_market_address);
                const orderSizeFloat = phoenixClient.baseLotsToBaseAtoms(parseFloat(bot.order_size_in_base_lots), phoenixMarket.phoenix_market_address) / Math.pow(10, baseTokenMetadata.decimals);
                const numOrdersInt = bot.num_orders;

                setUiMinPrice(_ => minPriceFloat.toString());
                setUiMaxPrice(_ => maxPriceFloat.toString());
            }
            else {
                setUiMinPrice(_ => ``);
                setUiMaxPrice(_ => ``);
            }
        }

        populateLocalState();
    }, [phoenixMarket, bot]);

    useEffect(() => {
      const fetchUserWithdrawableQuoteBalance = async () => {
          if(phoenixClient && wallet && wallet.connected) {
              const traderState = await getTraderState(phoenixClient, phoenixMarket.phoenix_market_address, bot.trade_manager_address);
              const quoteVal = (traderState.quoteWithdrawableBalance + traderState.quoteActiveOrdersBalance) / Math.pow(10, quoteTokenMetadata.decimals);
              const baseValLots = traderState.baseActiveOrdersBalance + traderState.baseWithdrawableBalance;
              const baseVal = phoenixClient.baseLotsToBaseAtoms(baseValLots, phoenixMarket.phoenix_market_address) / Math.pow(10, baseTokenMetadata.decimals);

              const portfolioVal = (baseVal * midPrice.current) + quoteVal;
              const growth = portfolioVal - parseFloat(bot.quote_size_deposited);

              const apr = (growth / parseFloat(bot.quote_size_deposited)) * 100;

              setDepositValueUSD(_ => portfolioVal.toFixed(4));
              setUiProfitQuoteSize(_ => growth.toFixed(4));
              setRealizedAPR(_ => apr.toFixed(4));
          }
          else {
            setUiProfitQuoteSize(_ => "0");
          }
      }

      const intervalId = setInterval(() => {
          fetchUserWithdrawableQuoteBalance();
        }, ACTIVE_ORDERS_REFRESH_FREQUENCY_IN_MS);
    
        return () => clearInterval(intervalId);
    
    }, [phoenixMarket, wallet, bot]);


    const handleCloseBotAction = async () => {
        setIsCloseBotButtonLoading(true);
        try {
          if(!bot.is_closed) {
              let priorityFeeLevels = null;

              try {
                priorityFeeLevels = (await getPriorityFeeEstimate([phoenixMarket.phoenix_market_address]))
                  .priorityFeeLevels;
              } catch (err) {
                // console.log(`Error fetching priority fee levels`);
              }
        
              updateStatus(<span>{`Preparing bot close transaction...`}</span>);
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
                  
                  let withdrawIx = createCloseAccountInstruction(
                    wSOLAta,
                    wallet.publicKey,
                    wallet.publicKey,
                  );

                  unwrapSOLIxs.push(withdrawIx);
              }

              let baseTokenUserAc = await getAssociatedTokenAddress(new web3.PublicKey(baseTokenMetadata.mint), wallet.publicKey);
              let quoteTokenUserAc = await getAssociatedTokenAddress(new web3.PublicKey(quoteTokenMetadata.mint), wallet.publicKey);
          
              const provider = new AnchorProvider(connection, wallet, {});

              let closeBotIx = await spotGridSdk.cancelOrdersAndClosePosition({
                provider,
                botMarketAddress: new web3.PublicKey(phoenixMarket.bot_market_address),
                positionAddress: new web3.PublicKey(bot.position_address),
                baseTokenUserAc,
                quoteTokenUserAc
              });

              for(let ix of closeBotIx.transactionInfos[0].transaction.instructions) {
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
                  await closePosition({
                      owner: wallet.publicKey.toString(),
                      position_address: bot.position_address.toString(),
                      position_key: bot.position_key.toString(),
                      bot_market_address: phoenixMarket.bot_market_address,
                      trade_manager_address: bot.trade_manager_address.toString(),
                      seat: bot.seat.toString(),
                      mode: `arithmetic`,
                      num_orders: bot.num_orders,
                      min_price_in_ticks: bot.min_price_in_ticks.toString(),
                      max_price_in_ticks: bot.max_price_in_ticks.toString(),
                      order_size_in_base_lots: bot.order_size_in_base_lots.toString(),
                      is_closed: true
                  } as TradingBotPosition);
              }
              catch(err) {
                  console.log("Error closing TradingBotPosition to database");
              }
              
              green(
                  <span>
                  {`Bot closed `}
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
            console.log("err: ", err);
        }
        setIsCloseBotButtonLoading(false);
    }

    return (
        <div className={styles.orderViewOuterContainer}>
          <div className={styles.orderViewContainer}>
            <div className={styles.columnNameRow}>
              <span className={styles.columnName}>
                {uiMinPrice}
              </span>
            </div>
            <div className={styles.columnNameRow}>
              <span className={styles.columnName}>
                {uiMaxPrice}
              </span>
            </div>
            <div className={styles.columnNameRow}>
              <span className={styles.columnName}>
                {depositValueUSD}
              </span>
            </div>
            <div className={styles.columnNameRow}>
              <span className={styles.columnName}
                style = {{
                  color: parseFloat(uiProfitQuoteSize) > 0 ? `#3de383e6` : `#e33d3d`
                }}
              >
                {
                  parseFloat(uiProfitQuoteSize) >= 0 ?
                    `+${uiProfitQuoteSize}`
                  :
                    `-${uiProfitQuoteSize}`
                }
              </span>
            </div>
            <div className={styles.columnNameRow}>
              <span className={styles.columnName}
                style = {{
                  color: parseFloat(uiProfitQuoteSize) > 0 ? `#3de383e6` : `#e33d3d`
                }}
              >
                {
                  parseFloat(uiProfitQuoteSize) >= 0 ?
                    `+${realizedAPR}%`
                  :
                    `-${realizedAPR}$`
                }
              </span>
            </div>
            <div className={styles.columnNameRow}>
              <div
                className={styles.cancelOrderButton}
                onClick={() => {
                  handleCloseBotAction();
                }}
              >
                <span>
                  {isCloseBotButtonLoading ? (
                    <div className={styles.spinnerBox}>
                      <div
                        className={styles.threeQuarterSpinner}
                        style={{
                          border: `3px solid #e33d3d`,
                          borderTop: `3px solid transparent`,
                        }}
                      ></div>
                    </div>
                  ) : (
                    <i className="fa-solid fa-power-off"></i>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
    );
}

export default ActiveBots;