import { web3 } from "@coral-xyz/anchor";
import { Client, MarketData } from "@ellipsis-labs/phoenix-sdk";
import { WalletContextState, useWallet } from "@solana/wallet-adapter-react";
import React, { createContext, useContext, useEffect, useState } from "react";

interface RootStateContextType {
    connection: web3.Connection;
    phoenixClient: Client;
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

    const loadConnection = async () => {
        const c = new web3.Connection(process.env.RPC_ENDPOINT, 'processed');
        setConnection(_ => c);
    }

    const loadPhoenixClient = async (connection: web3.Connection) => {
        console.log("connection: ", connection);
        let conn = connection;
        if(!conn) {
            conn = new web3.Connection(process.env.RPC_ENDPOINT);
        }

        let pc = await Client.create(conn);
        setConnection(_ => conn);
        setPhoenixClient(_ => pc);
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
        setConnection,
        setPhoenixClient
    };

    return (
        <RootStateContext.Provider value={value}>
            {children}
        </RootStateContext.Provider>
    )
}