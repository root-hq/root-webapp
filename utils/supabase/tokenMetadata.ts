import axios from "axios";
import { TokenMetadata } from ".";

export const getAllTokenMetadata = async (): Promise<
  TokenMetadata[] | null
> => {
  try {
    const response = await axios.get(
      `${process.env.DATABASE_SERVER_URL}/api/token/get-all-token-metadata`,
    );

    if (response) {
      return response.data as TokenMetadata[];
    } else {
      console.log(`Failed to retrieve all token metadata`);
      return null;
    }
  } catch (err) {
    console.log(`Error fetching active all token metadata: ${err}`);
  }
};

export const getTokenMetadata = async (
  tokenMint: string,
): Promise<TokenMetadata | null> => {
  try {
    const response = await axios.get(
      `${process.env.DATABASE_SERVER_URL}/api/token/get-token-metadata?tokenMint=${tokenMint}`,
    );

    if (response && response.data && response.data.length) {
      return response.data[0] as TokenMetadata;
    } else {
      console.log(`Failed to retrieve data on token:"${tokenMint}`);
      return null;
    }
  } catch (err) {
    console.log(
      `Error fetching info on this token:${tokenMint} \n Error: ${err}`,
    );
  }
};
