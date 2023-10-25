import axios from "axios";
import { TokenPrice } from ".";
import { PRICE_CHART_MINIMUM_DATA_SAMPLES } from "../../constants";

export const getTokenPriceDataWithDate = async (
  marketAddress: string,
  today: Date,
): Promise<TokenPrice[]> => {
  const formattedDate = toStringDate(today);
  const fileName = `${marketAddress}-${formattedDate}.json`;

  try {
    const response = await axios.get(
      `${process.env.DATABASE_SERVER_URL}/api/read-token-price-file?fileName=${fileName}`,
    );

    if (response && response.data && response.data.length) {
      if (response.data.length < PRICE_CHART_MINIMUM_DATA_SAMPLES) {
        console.log(
          "Missing ",
          PRICE_CHART_MINIMUM_DATA_SAMPLES - response.data.length,
          " entries so taking from previous day",
        );
        const oneDayPrior = new Date(today);
        oneDayPrior.setDate(today.getDate() - 1);

        const previousPrices = getTokenPriceDataWithDate(
          marketAddress,
          oneDayPrior,
        );

        if (previousPrices && (await previousPrices).length > 0) {
          const leftForThreshold =
            PRICE_CHART_MINIMUM_DATA_SAMPLES - response.data.length;
          return [
            ...(await previousPrices).slice(-1 * leftForThreshold),
            ...response.data,
          ] as TokenPrice[];
        }
      }
      return response.data.slice(
        -1 * PRICE_CHART_MINIMUM_DATA_SAMPLES,
      ) as TokenPrice[];
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
