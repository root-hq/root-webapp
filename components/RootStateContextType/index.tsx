import { web3 } from "@coral-xyz/anchor";
import { Client, L3UiOrder, MarketData, deserializeMarketData, getMarketL3UiBook } from "@ellipsis-labs/phoenix-sdk";
import { WalletContextState, useWallet } from "@solana/wallet-adapter-react";
import { MAX_ACCOUNT_SIZE_BYTES } from "constants/";
import React, { MutableRefObject, createContext, useContext, useEffect, useRef, useState } from "react";
import { ZSTDDecoder } from "zstddec";

interface RootStateContextType {
    connection: web3.Connection;
    phoenixClient: Client;
    bids: L3UiOrder[];
    asks: L3UiOrder[];
    midPrice: MutableRefObject<number>;
    spread: MutableRefObject<number>;
    instantaneousPriceIncrease: boolean;
    refreshBidsAndAsks: (zstdEncodedBuffer: Buffer) => void;
    setConnection: (newConn: web3.Connection) => void;
    setPhoenixClient: (newClient: Client) => void;
}

const RootStateContext = createContext<RootStateContextType | undefined>(undefined);

export const useRootState = () => {
    const context = useContext(RootStateContext);
    if(!context) {
        throw new Error("useRootState must be used within a RootStateProvider");
    }
    return context;
}

//@ts-ignore
export const RootStateProvider = ({ children }) => {
    const [connection, setConnection] = useState<web3.Connection | undefined>(undefined);
    const [phoenixClient, setPhoenixClient] = useState<Client | undefined>(undefined);
    const [bids, setBids] = useState<L3UiOrder[]>([]);
    const [asks, setAsks] = useState<L3UiOrder[]>([]);
    const midPrice = useRef<number>(0.0);
    const spread = useRef<number>(0.0);
    const [instantaneousPriceIncrease, setInstantaneousPriceIncrease] = useState<boolean>(true);

    const loadConnection = async () => {
        const c = new web3.Connection(process.env.RPC_ENDPOINT, 'processed');
        setConnection(_ => c);
    }

    const loadPhoenixClient = async (connection: web3.Connection) => {
        let conn = new web3.Connection(process.env.RPC_ENDPOINT);

        let pc = await Client.create(conn);
        setPhoenixClient(_ => pc);
    }

    const refreshBidsAndAsks = async (zstdEncodedBuffer: Buffer) => {
        if(zstdEncodedBuffer) {
            const decoder = new ZSTDDecoder();
            await decoder.init();
            const marketBuffer = decoder.decode(
            zstdEncodedBuffer,
            MAX_ACCOUNT_SIZE_BYTES
            );
        
            let marketData = deserializeMarketData(Buffer.from(marketBuffer));
            let freshUiBook = getMarketL3UiBook(marketData, -1);

            setBids(_ => freshUiBook.bids);
            setAsks(_ => freshUiBook.asks.sort((a: L3UiOrder, b: L3UiOrder) => b.price - a.price));

            let newPrice = ((freshUiBook.bids[0].price) + (freshUiBook.asks[0].price)) / 2.0;
            let newSpread = freshUiBook.asks[0].price - freshUiBook.bids[0].price;

            if(newPrice > midPrice.current) {
                setInstantaneousPriceIncrease((_) => true);
            }
            else if(midPrice.current > newPrice) {
                setInstantaneousPriceIncrease((_) => false);
            }

            midPrice.current = newPrice;
            spread.current = newSpread;
        }
    }

    useEffect(() => {
        const loadStuff = async () => {
            await loadConnection();
            await loadPhoenixClient(connection);
        }

        loadStuff();
    }, []);

    const value = {
        connection,
        phoenixClient,
        bids,
        asks,
        midPrice,
        spread,
        instantaneousPriceIncrease,
        refreshBidsAndAsks,
        setConnection,
        setPhoenixClient
    };

    return (
        <RootStateContext.Provider value={value}>
            {children}
        </RootStateContext.Provider>
    )
}