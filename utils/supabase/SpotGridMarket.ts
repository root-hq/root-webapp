import axios from "axios";
import { SpotGridMarket } from ".";

export const getMarket = async (
  marketAddress: string,
): Promise<SpotGridMarket> => {
  try {
    const response = await axios.get(
      `${process.env.SPOT_GRID_DATABASE_SERVER_URL}/api/market/get-market?marketAddress=${marketAddress}`,
    );

    if (response && response.data && response.data.length) {
      return response.data[0] as SpotGridMarket;
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

export const getMarketForPhoenixMarket = async (
  phoenixMarketAddress: string,
): Promise<SpotGridMarket> => {
  try {
    const response = await axios.get(
      `${process.env.SPOT_GRID_DATABASE_SERVER_URL}/api/market/get-market?phoenixMarketAddress=${phoenixMarketAddress}`,
    );

    if (response && response.data && response.data.length) {
      return response.data[0] as SpotGridMarket;
    } else {
      // console.log(
      //   `Failed to retrieve data on phoenix market:"${phoenixMarketAddress}`,
      // );
      return null;
    }
  } catch (err) {
    // console.log(
    //   `Error fetching info on phoenix market:${phoenixMarketAddress} \n Error: ${err}`,
    // );
  }
};

export const getAllMarkets = async (): Promise<SpotGridMarket[]> => {
  try {
    const response = await axios.get(
      `${process.env.SPOT_GRID_DATABASE_SERVER_URL}/api/market/get-all-markets`,
    );

    if (response && response.data && response.data.length) {
      return response.data as SpotGridMarket[];
    } else {
      // console.log(`Failed to retrieve data on all spot grid markets`);
      return null;
    }
  } catch (err) {
    // console.log(`Error fetching info on all spot grid markets`);
  }
};
