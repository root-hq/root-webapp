import React, { useEffect, useState } from "react";
import styles from "./MarketPage.module.css";
import OrderConsumer from "./components/OrderConsumer";
import OrderProducer from "./components/OrderProducer";
import { SpotGridMarket, TokenMetadata, getAllTokenMetadata, getTokenMetadata } from "../../utils/supabase";
import { getAllMarkets, getMarket, getMarketForPhoenixMarket } from "../../utils/supabase/SpotGridMarket";

export interface MarketPageProps {
    spotGridMarketOnPage: SpotGridMarket,
    allSpotGridMarkets: SpotGridMarket[],
    allTokenMetadata: TokenMetadata[],
    baseTokenMetadata: TokenMetadata,
    quoteTokenMetadata: TokenMetadata
};

const MarketPage = ({
    spotGridMarketOnPage,
    allSpotGridMarkets,
    allTokenMetadata,
    baseTokenMetadata,
    quoteTokenMetadata
}: MarketPageProps) => {
    const [selectedSpotGridMarket, setSelectedSpotGridMarket] = useState<SpotGridMarket>();

    useEffect(() => {
        setSelectedSpotGridMarket(prev => spotGridMarketOnPage);
        console.log("set hai");
    }, []);

    return (
        <div className={styles.marketPageContainer}>
            <div className={styles.orderConsumerContainer}>
                <OrderConsumer selectedSpotGridMarket={selectedSpotGridMarket} allTokenMetadata={allTokenMetadata} baseTokenMetadata={baseTokenMetadata} quoteTokenMetadata={quoteTokenMetadata}/>
            </div>
            <div className={styles.orderProducerContainer}>
                <OrderProducer spotGridMarket={selectedSpotGridMarket} />
            </div>
        </div>
    )
}

export const getServerSideProps = async ({ params }) => {
    const { market } = params;

    let spotGridMarketOnPage: SpotGridMarket = null;
    let allTokenMetadata: TokenMetadata[] = null;
    let baseTokenMetadata: TokenMetadata = null;
    let quoteTokenMetadata: TokenMetadata = null;
    let allSpotGridMarkets: SpotGridMarket[] = [];

    [spotGridMarketOnPage, allTokenMetadata, allSpotGridMarkets] = await Promise.all([
        getMarketForPhoenixMarket(market),
        getAllTokenMetadata(),
        getAllMarkets()
    ]);
    
    if(allTokenMetadata.length > 0) {
        console.log("As of now: ", spotGridMarketOnPage);
        console.log("As of now: ", allTokenMetadata);

        baseTokenMetadata = allTokenMetadata.find((value) => {
            return value.mint === spotGridMarketOnPage.base_token_mint.toString()
        });
    
        quoteTokenMetadata = allTokenMetadata.find((value) => {
            return value.mint === spotGridMarketOnPage.quote_token_mint.toString()
        });
    }

    console.log("Final result: ", baseTokenMetadata);

    return {
        props: {
            spotGridMarketOnPage: spotGridMarketOnPage,
            allSpotGridMarkets,
            allTokenMetadata,
            baseTokenMetadata: baseTokenMetadata === undefined ? null : baseTokenMetadata,
            quoteTokenMetadata: quoteTokenMetadata === undefined ? null : quoteTokenMetadata,
        }
    };
}

export default MarketPage;