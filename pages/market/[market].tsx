import React from "react";
import styles from "./MarketPage.module.css";
import OrderConsumer from "./components/OrderConsumer";
import OrderProducer from "./components/OrderProducer";
import { SpotGridMarket, TokenMetadata, getTokenMetadata } from "../../utils/supabase";
import { getAllMarkets, getMarket, getMarketForPhoenixMarket } from "../../utils/supabase/SpotGridMarket";

export interface MarketPageProps {
    selectedSpotGridMarket: SpotGridMarket,
    allSpotGridMarkets: SpotGridMarket[],
    baseTokenMetadata: TokenMetadata,
    quoteTokenMetadata: TokenMetadata
};

const MarketPage = ({
    allSpotGridMarkets,
    selectedSpotGridMarket,
    baseTokenMetadata,
    quoteTokenMetadata
}: MarketPageProps) => {
    return (
        <div className={styles.marketPageContainer}>
            <div className={styles.orderConsumerContainer}>
                <OrderConsumer selectedSpotGridMarket={selectedSpotGridMarket} baseTokenMetadata={baseTokenMetadata} quoteTokenMetadata={quoteTokenMetadata}/>
            </div>
            <div className={styles.orderProducerContainer}>
                <OrderProducer spotGridMarket={selectedSpotGridMarket} />
            </div>
        </div>
    )
}

export const getServerSideProps = async ({ params }) => {
    const { market } = params;

    const spotGridMarketMetadata = await getMarketForPhoenixMarket(market);

    let baseTokenMetadata: TokenMetadata = null;
    let quoteTokenMetadata: TokenMetadata = null;
    let allSpotGridMarkets: SpotGridMarket[] = [];

    if(spotGridMarketMetadata) {
        [baseTokenMetadata, quoteTokenMetadata, allSpotGridMarkets] = await Promise.all([
            getTokenMetadata(spotGridMarketMetadata.base_token_mint.toString()),
            getTokenMetadata(spotGridMarketMetadata.quote_token_mint.toString()),
            getAllMarkets()
        ]);    
    }

    return {
        props: {
            selectedSpotGridMarket: spotGridMarketMetadata,
            allSpotGridMarkets,
            baseTokenMetadata,
            quoteTokenMetadata
        }
    };
}

export default MarketPage;