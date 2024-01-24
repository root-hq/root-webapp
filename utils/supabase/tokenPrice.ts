import axios from "axios";
import { TokenPrice } from ".";
import { PRICE_CHART_DATA_SAMPLES } from "../../constants";

export const getTokenPriceDataWithDate = async (
  marketAddress: string,
  date: Date,
): Promise<TokenPrice[]> => {
  const formattedDate = toStringDate(date);
  const fileName = `phoenix/${marketAddress}-${formattedDate}.json`;

  try {
    const response = await axios.get(
      `${process.env.DATABASE_SERVER_URL}/api/price/phoenix/get-historical-price?fileName=${fileName}`,
    );

    if (response && response.data && response.data.length) {
      return response.data as TokenPrice[];
    } else {
      console.log(
        `Failed to retrieve data on token price for file:"${fileName}`,
      );
      return [
        {
          marketAddress: "",
          price: 0,
          timestamp: 0,
        } as TokenPrice,
      ];
    }
  } catch (err) {
    console.log(
      `Error fetching info on token price for file:${fileName} \n Error: ${err}`,
    );
  }
};

export const toStringDate = (date: Date) => {
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = String(date.getUTCFullYear());
  const formattedDate = day + month + year;

  return formattedDate;
};
