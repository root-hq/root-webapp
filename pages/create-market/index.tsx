import React, { useState } from "react";
import styles from "./CreateMarketPage.module.css";
import TokenInfo from "./components/TokenInfo";
import { useCreateMarketContext } from "components/CreateMarketContextType";
import MarketInfo from "./components/MarketInfo";
import FeeInfo from "./components/FeeInfo";
import PreviewDetails from "./components/PreviewDetails";
import { delay } from "utils";

const CreateMarketPage = () => {

    const { resetAllFields } = useCreateMarketContext();
    const [formPage, setFormPage] = useState<number>(1);
    const [isCreateMarketButtonLoading, setIsCreateMarketButtonLoading] = useState<boolean>(false);

    const handleNavigationEvent = (newPage) => {
        setFormPage(_ => newPage);
    }

    const handleCreateMarketAction = async() => {
        setIsCreateMarketButtonLoading(true);
        await delay(3_000);
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
            <div className={styles.createMarketButtonContainer}
                style={{
                    display: formPage !== 4 ? `none` : ``
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