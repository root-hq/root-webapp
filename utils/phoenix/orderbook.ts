import { Client, L3UiBook, Side } from "@ellipsis-labs/phoenix-sdk";
import { web3 } from "@coral-xyz/anchor";

export const getL3Book = async(
    marketAddress: string,
    depthPerSide: number
): Promise<L3UiBook> => {
    try {
        const endpoint = process.env.RPC_ENDPOINT;
        const connection = new web3.Connection( endpoint, { commitment: 'processed' });
    
        const client = await Client.create(connection);
        const book = client.getL3UiBook(marketAddress, depthPerSide);
        return book;
    }
    catch(err) {
        console.log('Error fetching orderbook data on Pheonix: ', err);
        return {
            bids: [
                {
                    price: 0,
                    side: Side.Bid,
                    size: 0,
                    makerPubkey: '',
                    orderSequenceNumber: '',
                    lastValidSlot: 0,
                    lastValidUnixTimestampInSeconds: 0
                }
            ],
            asks: [
                {
                    price: 0,
                    side: Side.Ask,
                    size: 0,
                    makerPubkey: '',
                    orderSequenceNumber: '',
                    lastValidSlot: 0,
                    lastValidUnixTimestampInSeconds: 0
                }
            ]
        }
    }
}