import axios from "axios";

export const getWhitelistStatus = async (walletAddress: string): Promise<boolean> => {
    try {
        const response = await axios.get(`${process.env.SPOT_GRID_DATABASE_SERVER_URL}/api/whitelist?walletAddress=${walletAddress}`);
        
        if(response && response.status === 200) {
            return response.data as boolean;
        }
    }
    catch(err) {
        console.log(`Error fetching whitelist status for: ${walletAddress}`);
    }
}