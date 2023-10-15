import { web3 } from "@coral-xyz/anchor";
import { getBaseTokenVaultAddress, getQuoteTokenVaultAddress } from "@squarerootlabs/root-market-maker";

export interface VaultBalance {
    baseTokenBalance: number,
    quoteTokenBalance: number
};

export const getVaultBalance = async(vaultAddress: string): Promise<VaultBalance> => {
    try {
        const connection = new web3.Connection(process.env.NEXT_RPC_ENDPOINT);
    
        const baseTokenBalance = (await connection.getTokenAccountBalance(getBaseTokenVaultAddress(new web3.PublicKey(vaultAddress)))).value.uiAmount;
        const quoteTokenBalance = (await connection.getTokenAccountBalance(getQuoteTokenVaultAddress(new web3.PublicKey(vaultAddress)))).value.uiAmount;
    
        return {
            baseTokenBalance,
            quoteTokenBalance
        } as VaultBalance;    
    }
    catch(err) {
        console.log('Error fetching vault balance: ', err);
        return {
            baseTokenBalance: 0,
            quoteTokenBalance: 0
        } as VaultBalance;
    }
}