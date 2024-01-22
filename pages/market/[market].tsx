import React from "react";
import styles from "./MarketPage.module.css";
import OrderConsumer from "./components/OrderConsumer";
import OrderProducer from "./components/OrderProducer";
import axios from "axios";
import { SpotGridMarket } from "../../utils/supabase";

export interface MarketPageProps {
    spotGridMarket: SpotGridMarket
};

const MarketPage = ({
    spotGridMarket
}: MarketPageProps) => {
    return (
        <div className={styles.marketPageContainer}>
            <div className={styles.orderConsumerContainer}>
                <OrderConsumer />
            </div>
            <div className={styles.orderProducerContainer}>
                <OrderProducer />
            </div>
        </div>
    )
}

export const getServerSideProps = async ({ params }) => {
    const { market } = params;

    const response = await axios.get(`https://spot-grid-db-utils.vercel.app/api/market/get-market?phoenixMarketAddress=${market}`);

    const data = response.data as SpotGridMarket[];

    return {
        props: {
            spotGridMarket: data[0]
        }
    };
}

export default MarketPage;