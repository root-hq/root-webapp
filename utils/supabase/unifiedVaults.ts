import axios from "axios"

export const getAllVaults = async(): Promise<any | null> => {
    try {
        const response = await axios.get(`${process.env.NEXT_DATABASE_SERVER_URL}/api/get-all-vaults`);

        if(response) {
            return response.data;
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

export const getVault = async(vaultAddress: string): Promise<any | null> => {
    try {
        const response = await axios.get(`${process.env.NEXT_DATABASE_SERVER_URL}/api/get-vault?vaultAddress=${vaultAddress}`);

        if(response) {
            return response.data;
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