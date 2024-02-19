import { web3 } from "@coral-xyz/anchor";
import * as splToken from "@solana/spl-token";

export const getTokenInfo = async (mint: web3.PublicKey) => {
    try {
        const conn = new web3.Connection(process.env.RPC_ENDPOINT);

        const info = splToken.getMint(conn, mint, 'processed');

        return info;
    }
    catch(err) {
        console.log(`Error fetching token info: ${err}`);
    }
}