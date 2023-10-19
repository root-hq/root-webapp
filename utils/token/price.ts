import axios from 'axios';

export const getTokenPrice = async(
    tokenTicker: string,
    quoteTicker: string
): Promise<number | null> => {

    const url = `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?symbol=${tokenTicker}&convert=${quoteTicker}`;
    const headers = {
        'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY
    }

    try {
        const response = await axios.get(url, {
            headers
            }
        );

        const price = response.data["data"][tokenTicker][0]["quote"][quoteTicker]["price"];

        return price;
    }
    catch(err) {
        console.log(`Error fetching ${tokenTicker} price in ${quoteTicker}: `, err);
    }
    return 0;
}