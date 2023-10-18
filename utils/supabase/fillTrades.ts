import axios from "axios"
import { FillTrade } from ".";

export const getFillTrades = async(): Promise<FillTrade[] | null> => {
    try {
        const response = await axios.get(`${process.env.DATABASE_SERVER_URL}/api/get-fill-trades`);

        if(response) {
            return response.data as FillTrade[];
        }
        else {
            console.log(`Failed to retrieve filled trades`);
            return null;
        }
    }
    catch(err) {
        console.log(`Error fetching filled trades: ${err}`);
    }
}