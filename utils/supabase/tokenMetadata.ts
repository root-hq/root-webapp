import axios from "axios"
import { TokenMetadata } from '@squarerootlabs/root-db-utils/src/supabase';


export const getAllTokenMetadata = async(): Promise<TokenMetadata[] | null> => {
    try {
        const response = await axios.get(`${process.env.NEXT_DATABASE_SERVER_URL}/api/get-all-token-metadata`);

        if(response) {
            return response.data as TokenMetadata[];
        }
        else {
            console.log(`Failed to retrieve all token metadata`);
            return null;
        }
    }
    catch(err) {
        console.log(`Error fetching active all token metadata: ${err}`);
    }
}

export const getTokenMetadata = async(tokenMint: string): Promise<TokenMetadata[] | null> => {
    try {
        const response = await axios.get(`${process.env.NEXT_DATABASE_SERVER_URL}/api/get-token-metadata?tokenMint=${tokenMint}`);

        if(response) {
            return response.data as TokenMetadata[];
        }
        else {
            console.log(`Failed to retrieve data on token:"${tokenMint}`);
            return null;
        }
    }
    catch(err) {
        console.log(`Error fetching info on this token:${tokenMint} \n Error: ${err}`)
    }
}