import axios from "axios";
import { TokenPrice } from ".";

export const getTokenPriceDataWithDate = async (
    fileName: string,
  ): Promise<TokenPrice[]> => {
    try {
      const response = await axios.get(
        `${process.env.DATABASE_SERVER_URL}/api/read-token-price-file?fileName=${fileName}`,
      );
  
      if (response && response.data && response.data.length) {
        return response.data as TokenPrice[];
      } else {
        console.log(`Failed to retrieve data on token price for file:"${fileName}`);
        return [{
          marketAddress: '',
          price: 0,
          timestamp: 0
        } as TokenPrice];
      }
    } catch (err) {
      console.log(
        `Error fetching info on token price for file:${fileName} \n Error: ${err}`,
      );
    }
  };