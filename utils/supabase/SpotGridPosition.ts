import axios from "axios";
import { SpotGridPosition } from ".";

export const getPosition = async (
  positionAddress: String,
): Promise<SpotGridPosition> => {
  try {
    const response = await axios.get(
      `${process.env.SPOT_GRID_DATABASE_SERVER_URL}/api/position/get-position?positionAddress=${positionAddress}`,
    );

    if (response && response.data && response.data.length) {
      return response.data[0] as SpotGridPosition;
    } else {
      console.log(
        `Failed to retrieve data on spot grid position: ${positionAddress}`,
      );
      return null;
    }
  } catch (err) {
    console.log(
      `Error fetching info on this spot grid position: ${positionAddress} \n Error: ${err}`,
    );
  }
};

export const getPositionsForOwner = async (
  ownerAddress: string,
): Promise<SpotGridPosition[]> => {
  try {
    const response = await axios.get(
      `${process.env.SPOT_GRID_DATABASE_SERVER_URL}/api/position/get-all-positions?ownerAddress=${ownerAddress}`,
    );

    if (response && response.data && response.data.length) {
      return response.data as SpotGridPosition[];
    } else {
      console.log(`Failed to retrieve data on positions for: "${ownerAddress}`);
      return null;
    }
  } catch (err) {
    console.log(
      `Error fetching info on positions for :${ownerAddress} \n Error: ${err}`,
    );
  }
};

export const getAllPositions = async (): Promise<SpotGridPosition[]> => {
  try {
    const response = await axios.get(
      `${process.env.SPOT_GRID_DATABASE_SERVER_URL}/api/position/get-all-positions`,
    );

    if (response && response.data && response.data.length) {
      return response.data as SpotGridPosition[];
    } else {
      console.log(`Failed to retrieve data on all spot grid markets`);
      return null;
    }
  } catch (err) {
    console.log(`Error fetching info on all spot grid markets`);
  }
};
