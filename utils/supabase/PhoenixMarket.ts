import axios from "axios";
import { PhoenixMarket } from ".";

export const getMarket = async (
  marketAddress: string,
): Promise<PhoenixMarket> => {
  try {
    const response = await axios.get(
      `${process.env.SPOT_GRID_DATABASE_SERVER_URL}/api/bot/market/get-market?marketAddress=${marketAddress}`,
    );

    if (response && response.data && response.data.length) {
      return response.data[0] as PhoenixMarket;
    } else {
      // console.log(
      //   `Failed to retrieve data on spot grid market:"${marketAddress}`,
      // );
      return null;
    }
  } catch (err) {
    // console.log(
    //   `Error fetching info on this spot grid market:${marketAddress} \n Error: ${err}`,
    // );
  }
};

export const getAllMarkets = async (): Promise<PhoenixMarket[]> => {
  try {
    const response = await axios.get(
      `${process.env.SPOT_GRID_DATABASE_SERVER_URL}/api/bot/market/get-all-markets`,
    );

    if (response && response.data && response.data.length) {
      return response.data as PhoenixMarket[];
    } else {
      // console.log(`Failed to retrieve data on all spot grid markets`);
      return null;
    }
  } catch (err) {
    // console.log(`Error fetching info on all spot grid markets`);
  }
};
