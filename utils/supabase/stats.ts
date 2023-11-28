import axios from "axios";

export interface VolumeResult {
  buySizeInBaseUnits: number;
  sellSizeInBaseUnits: number;
  buyVolumeInQuoteUnits: number;
  sellVolumeInQuoteUnits: number;
}

export const getMarketVolume = async (
  marketAddress: string,
): Promise<VolumeResult> => {
  try {
    const response = await axios.get(
      `${process.env.DATABASE_SERVER_URL}/api/stats/phoenix/volume?marketAddress=${marketAddress}`,
    );

    if (response && response.data) {
      return response.data as VolumeResult;
    } else {
      console.log(`Failed to retrieve volume data on market: ${marketAddress}`);
      return null;
    }
  } catch (err) {
    console.log(
      `Error fetching volume data on market :${marketAddress} \n Error: ${err}`,
    );
  }
};
