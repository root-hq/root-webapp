import axios from "axios";
import { TradingBotPosition } from ".";

export const addPosition = async (
    position: TradingBotPosition
): Promise<boolean> => {
    try {
        const response = await axios.post(
            `${process.env.SPOT_GRID_DATABASE_SERVER_URL}/api/bot/position/add-position`,
            position
          );
      
          if (response && response.data) {
            return true;
          } else {
            return false;
          }
          }
    catch(err) {
        return false;
    }
}

export const closePosition = async (
  position: TradingBotPosition
): Promise<boolean> => {
  try {
      const response = await axios.post(
          `${process.env.SPOT_GRID_DATABASE_SERVER_URL}/api/bot/position/close-position`,
          position
        );
    
        if (response && response.data) {
          return true;
        } else {
          return false;
        }
        }
  catch(err) {
      return false;
  }
}

export const getPosition = async (
  positionAddress: String,
): Promise<TradingBotPosition> => {
  try {
    const response = await axios.get(
      `${process.env.SPOT_GRID_DATABASE_SERVER_URL}/api/bot/position/get-position?positionAddress=${positionAddress}`,
    );

    if (response && response.data && response.data.length) {
      return response.data[0] as TradingBotPosition;
    } else {
      // console.log(
      //   `Failed to retrieve data on spot grid position: ${positionAddress}`,
      // );
      return null;
    }
  } catch (err) {
    // console.log(
    //   `Error fetching info on this spot grid position: ${positionAddress} \n Error: ${err}`,
    // );
  }
};

export const getPositionsForOwner = async (
  ownerAddress: string,
): Promise<TradingBotPosition[]> => {
  try {
    const response = await axios.get(
      `${process.env.SPOT_GRID_DATABASE_SERVER_URL}/api/bot/position/get-all-positions?ownerAddress=${ownerAddress}`,
    );

    if (response && response.data && response.data.length) {
      return response.data as TradingBotPosition[];
    } else {
      // console.log(`Failed to retrieve data on positions for: "${ownerAddress}`);
      return null;
    }
  } catch (err) {
    // console.log(
    //   `Error fetching info on positions for :${ownerAddress} \n Error: ${err}`,
    // );
  }
};

export const getAllPositions = async (): Promise<TradingBotPosition[]> => {
  try {
    const response = await axios.get(
      `${process.env.SPOT_GRID_DATABASE_SERVER_URL}/api/bot/position/get-all-positions`,
    );

    if (response && response.data && response.data.length) {
      return response.data as TradingBotPosition[];
    } else {
      // console.log(`Failed to retrieve data on all spot grid markets`);
      return null;
    }
  } catch (err) {
    // console.log(`Error fetching info on all spot grid markets`);
  }
};
