import { web3 } from "@coral-xyz/anchor";
import { getBaseTokenVaultAddress, getQuoteTokenVaultAddress } from "@squarerootlabs/root-market-maker";

export interface VaultBalance {
    baseTokenBalance: number,
    quoteTokenBalance: number
};

export const getVaultBalance = async(vaultAddress: string): Promise<VaultBalance> => {
    try {
        const endpoint = process.env.NEXT_RPC_ENDPOINT ? process.env.NEXT_RPC_ENDPOINT : 'https://solitary-orbital-sheet.solana-mainnet.quiknode.pro/05d455acb67a72d87bad972ed175c31aead941e3/';
        const connection = new web3.Connection(endpoint);
    
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