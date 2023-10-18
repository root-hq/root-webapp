import axios from "axios";
import { UnifiedVault } from ".";

export const getAllVaults = async(): Promise<UnifiedVault[] | null> => {
    try {
        const response = await axios.get(`${process.env.DATABASE_SERVER_URL}/api/get-all-vaults`);

        if(response) {
            return response.data as UnifiedVault[];
        }
        else {
            console.log(`Failed to retrieve vaults data`);
            return null;
        }
    }
    catch(err) {
        console.log(`Error fetching active vaults: ${err}`);
    }
}

export const getVault = async(vaultAddress: string): Promise<UnifiedVault | null> => {
    try {
        const response = await axios.get(`${process.env.DATABASE_SERVER_URL}/api/get-vault?vaultAddress=${vaultAddress}`);

        if(response && response.data && response.data.length > 0) {
            return response.data[0] as UnifiedVault;
        }
        else {
            console.log(`Failed to retrieve data on vault:"${vaultAddress}`);
            return null;
        }
    }
    catch(err) {
        console.log(`Error fetching info on this vault:${vaultAddress} \n Error: ${err}`)
    }
}