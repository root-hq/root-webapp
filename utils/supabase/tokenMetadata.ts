import axios from "axios"

export const getAllTokenMetadata = async(): Promise<any | null> => {
    try {
        const response = await axios.get(`${process.env.NEXT_DATABASE_SERVER_URL}/api/get-all-token-metadata`);

        if(response) {
            return response.data;
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

export const getTokenMetadata = async(tokenMint: string): Promise<any | null> => {
    try {
        const response = await axios.get(`${process.env.NEXT_DATABASE_SERVER_URL}/api/get-token-metadata?tokenMint=${tokenMint}`);

        if(response) {
            return response.data;
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