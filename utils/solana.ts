import { Connection } from "@solana/web3.js"

export const getConnection = (): Connection => {
    const connection = new Connection(process.env.RPC_ENDPOINT, 'processed');

    return connection;
}