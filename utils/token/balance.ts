import * as anchor from "@coral-xyz/anchor";
import { getConnection } from "..";
import { getAssociatedTokenAddress } from "@solana/spl-token";

export const getTokenAccountBalance = async(walletAddr: anchor.web3.PublicKey, token: anchor.web3.PublicKey): Promise<number> => {
    try {
        const connection = getConnection();
        const userTokenAccount = await getAssociatedTokenAddress(token, walletAddr);
    
        const userBalance = (await connection.getTokenAccountBalance(userTokenAccount)).value.uiAmount;
    
        return userBalance;    
    }
    catch(err) {
        console.log(`Something went wrong fetching token account balance: ${err}`);
    }
    return 0;
}