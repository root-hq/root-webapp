import React, { useState } from "react";
import styles from "./CreateMarketPage.module.css";
import TokenInfo from "./components/TokenInfo";
import { useCreateMarketContext } from "components/CreateMarketContextType";
import MarketInfo from "./components/MarketInfo";
import FeeInfo from "./components/FeeInfo";
import PreviewDetails from "./components/PreviewDetails";
import { AnchorProvider, BN, web3 } from "@coral-xyz/anchor";
import * as rootSdk from "@squarerootlabs/root-program-ts";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRootState } from "components/RootStateContextType";
import { useBottomStatus } from "components/BottomStatus";
import Link from "next/link";

const CreateMarketPage = () => {

    const { baseTokenMint, quoteTokenMint, baseUnitsPerBaseLot, quoteUnitsPerQuoteLot, rawBaseUnitsPerBaseUnit, takerFeeInBps, feeCollector, tickSizeInQuoteUnitsPerBaseUnit, resetAllFields, getCapacityConfig } = useCreateMarketContext();
    const wallet = useWallet();
    const { connection } = useRootState();
    const { green, red } = useBottomStatus();

    const [formPage, setFormPage] = useState<number>(1);
    const [newMarketKey, setNewMarketKey] = useState<string>("");
    const [isCreateMarketButtonLoading, setIsCreateMarketButtonLoading] = useState<boolean>(false);

    const handleNavigationEvent = (newPage) => {
        setFormPage(_ => newPage);
    }

    const handleCreateMarketAction = async() => {
        setIsCreateMarketButtonLoading(true);

        try {
            const config = getCapacityConfig();
            const numOrdersPerSide = new BN(config[0]);
            const numSeats = new BN(config[1]);
            const numQuoteLotsPerQuoteUnit = new BN(1 / parseFloat(quoteUnitsPerQuoteLot));
            const numBaseLotsPerBaseUnit = new BN(1 / parseFloat(baseUnitsPerBaseLot));
            const tickSizeInQuoteLotsPerBaseUnit = new BN(parseFloat(tickSizeInQuoteUnitsPerBaseUnit) / parseFloat(quoteUnitsPerQuoteLot))
    
            const baseTokenMintKey = new web3.PublicKey(baseTokenMint);
            const quoteTokenMintKey = new web3.PublicKey(quoteTokenMint);
            const feeCollectorKey = new web3.PublicKey(feeCollector);
    
            const provider = new AnchorProvider(connection, wallet, {});
            const txes = await rootSdk.createPhoenixMarket({
                provider,
                createPhoenixMarketParams: {
                    numOrdersPerSide,
                    numSeats,
                    numBaseLotsPerBaseUnit,
                    numQuoteLotsPerQuoteUnit,
                    tickSizeInQuoteLotsPerBaseUnit,
                    takerFeeBps: parseFloat(takerFeeInBps),
                    rawBaseUnitsPerBaseUnit: parseFloat(rawBaseUnitsPerBaseUnit)
                } as rootSdk.CreatePhoenixMarketParams,
                createPhoenixMarketAccounts: {
                    baseTokenMint: baseTokenMintKey,
                    quoteTokenMint: quoteTokenMintKey,
                    feeCollector: feeCollectorKey
                } as rootSdk.CreatePhoenixMarketAccounts
            });
    
            const res = await rootSdk.executeTransactions({
                provider,
                transactionInfos: txes.transactionInfos
            });
            await res.confirm();
            
            if(txes) {
                setNewMarketKey(_ => txes.phoenixMarket.toString());
                green(
                    <span>
                      {`Market created successfully `}
                      <Link
                        href={`https://solscan.io/tx/${res.signatures[0]}`}
                        target="_blank"
                      >{` ↗️`}</Link>
                    </span>,
                    3_000,
                  );
            }
        }
        catch(err) {
            console.log(`Error creating market: ${err}`);
            red(<span>{`Failed: ${err.message}`}</span>, 2_000);
        }
        setIsCreateMarketButtonLoading(false);
    }

    return (
        <div className={styles.createMarketPageContainer}>
            <div className={styles.mainHeaderContainer}>
                <h1>Create a new market</h1>
            </div>
            <div className={styles.resetFieldsButtonContainer}>
                <span className={styles.resetFieldsButton} onClick={() => {
                    resetAllFields()
                    handleNavigationEvent(1)
                }}>Reset</span>
            </div>
            <div className={styles.mainFormContainer}>
                <div style={{
                    display: formPage !== 1 ? `none` : ``
                }}>
                    <TokenInfo />
                </div>
                <div style={{
                    display: formPage !== 2 ? `none` : ``
                }}>
                    <MarketInfo />
                </div>
                <div style={{
                    display: formPage !== 3 ? `none` : ``
                }}>
                    <FeeInfo />
                </div>
                <div style={{
                    display: formPage !== 4 ? `none` : ``
                }}>
                    <PreviewDetails />
                </div>
            </div>
            <div className={styles.navButtonContainer}>
                <button className={styles.navButton} onClick={
                    () => {
                        handleNavigationEvent(formPage - 1)
                    }
                }
                disabled={formPage === 1}
                style = {{
                    opacity: formPage === 1 ? `0.5` : ``,
                    cursor: formPage === 1 ? `no-drop` : ``
                }}
                >Previous</button>
                <button className={styles.navButton} onClick={
                    () => {
                        handleNavigationEvent(formPage + 1)
                    }
                }
                disabled={formPage === 4}
                style = {{
                    opacity: formPage === 4 ? `0.5` : ``,
                    cursor: formPage === 4 ? `no-drop` : ``
                }}
                >Next</button>
            </div>
            <div className={styles.formProgressBarContainer}
            style = {{
                display: formPage === 1 ? `none` : ``
            }}>
                <div className={styles.formProgressBarContainerOverlay}
                    style = {{
                        width: `${(formPage) * 25}%`,
                    }}
                >
                </div>
            </div>
            <div>
                <div
                    style = {{
                        display: newMarketKey ? `flex` : `none`,
                        flexDirection: `column`,
                        color: `#ddd`,
                        margin: `4rem`,
                        padding: `2rem`,
                        border: `1px solid #477df2`,
                    }}
                >
                    <span style = {{margin: `1rem`}}>{`New market address: ${newMarketKey}`}</span>
                </div>
            </div>
            <div className={styles.createMarketButtonContainer}
                style={{
                    display: formPage !== 4 ? `none` : ``,
                }}
            >
            <button className={styles.createMarketButton} onClick={
                    () => {
                        handleCreateMarketAction()
                    }
                }                
                >
                    {
                        isCreateMarketButtonLoading ?
                            <div className={styles.spinnerBox}>
                                <div
                                className={styles.threeQuarterSpinner}
                                style={{
                                    border: `3px solid #000`,
                                    borderTop: `3px solid transparent`,
                                }}
                                ></div>
                            </div>
                        :
                            <>Create Market</>
                    }
                </button>
            </div>
        </div>
    )
}

export default CreateMarketPage;