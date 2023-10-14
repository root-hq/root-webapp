import { Client, L3UiBook } from "@ellipsis-labs/phoenix-sdk";
import { web3 } from "@coral-xyz/anchor";

export const getL3Book = async(
    marketAddress: string,
    depthPerSide: number
): Promise<L3UiBook> => {
    const connection = new web3.Connection(process.env.NEXT_RPC_ENDPOINT, { commitment: 'processed' });
    
    const client = await Client.create(connection);
    const book = client.getL3UiBook(marketAddress, depthPerSide);
    return book;
}