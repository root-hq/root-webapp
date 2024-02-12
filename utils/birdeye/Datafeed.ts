import {
  DatafeedConfiguration,
  LibrarySymbolInfo,
  ResolutionString,
  SearchSymbolResultItem,
} from "public/static/charting_library/charting_library";
import { makeApiRequest, parseResolution } from "./helpers";
import { subscribeOnStream, unsubscribeFromStream } from "./streaming";

const lastBarsCache = new Map();

export const SUPPORTED_RESOLUTIONS = [
  "5",
  "15",
  "30",
  "60",
  "120",
  "240",
  "1D",
  "1W",
] as const;

const configurationData = {
  supported_resolutions: SUPPORTED_RESOLUTIONS,
  intraday_multipliers: ["1", "3", "5", "15", "30", "60", "120", "240"],
  exchanges: [],
};

export type SymbolInfo = LibrarySymbolInfo & {
  address: string;
  quote_token: string;
  base_token: string;
};

type BaseBar = {
  low: number;
  high: number;
  open: number;
  close: number;
};

type KlineBar = BaseBar & {
  volume: number;
  timestamp: number;
};

type TradingViewBar = BaseBar & {
  time: number;
};

type Bar = KlineBar & TradingViewBar;

async function getAllSymbols() {
  const data = await makeApiRequest(
    "public/tokenlist?sort_by=v24hUSD&sort_type=desc&offset=0&limit=-1",
  );

  return data.data.tokens;
}

export const queryBirdeyeBars = async (
  tokenAddress: string,
  resolution: (typeof SUPPORTED_RESOLUTIONS)[number],
  periodParams: {
    firstDataRequest: boolean;
    from: number;
    to: number;
  },
  quote_token: string,
  market: string,
): Promise<Bar[]> => {
  const { from, to } = periodParams;

  const urlParameters = {
    base_address: tokenAddress,
    quote_address: quote_token,
    type: parseResolution(resolution),
    time_from: from,
    time_to: to,
  };

  const query = Object.keys(urlParameters)
    .map(
      (name: string) =>
        `${name}=${encodeURIComponent((urlParameters as any)[name])}`,
    )
    .join("&");

  const data = await makeApiRequest(`defi/ohlcv/base_quote?${query}`);

  if (!data.success || data.data.items.length === 0) {
    return [];
  }

  let bars: Bar[] = [];
  for (const bar of data.data.items) {
    if (bar.unixTime >= from && bar.unixTime < to) {
      const timestamp = bar.unixTime * 1000;
      if (bar.h >= 223111) continue;
      bars = [
        ...bars,
        {
          time: timestamp,
          low: bar.l,
          high: bar.h,
          open: bar.o,
          close: bar.c,
          volume: bar.vQuote,
          timestamp,
        },
      ];
    }
  }
  return bars;
};

export default {
  onReady: (callback: (configuration: DatafeedConfiguration) => void) => {
    // console.log('[onReady]: Method call')
    setTimeout(() => callback(configurationData as any));
  },

  searchSymbols: async (
    _userInput: string,
    _exchange: string,
    _symbolType: string,
    _onResultReadyCallback: (items: SearchSymbolResultItem[]) => void,
  ) => {
    return;
  },

  resolveSymbol: async (
    symbolAddress: string,
    onSymbolResolvedCallback: (symbolInfo: SymbolInfo) => void,
    onResolveErrorCallback: any,
    // extension
  ) => {
    // console.log('[resolveSymbol]: Method call', symbolAddress)

    let symbolItem:
      | {
          address: string;
          type: string;
          symbol: string;
        }
      | undefined;

    if (!symbolItem) {
      symbolItem = {
        address: symbolAddress,
        type: "pair",
        symbol: "",
      };
    }

    const [baseMint, baseTicker, quoteMint, quoteTicker, tickSize] = symbolAddress.split("/");

    const symbolInfo: SymbolInfo = {
      base_token: baseMint,
      quote_token: quoteMint,
      address: symbolItem.address,
      ticker: symbolItem.address,
      name: symbolItem.symbol,
      description: `${baseTicker}/${quoteTicker}`,
      type: symbolItem.type,
      session: "24x7",
      timezone: "Etc/UTC",
      minmov: 1,
      pricescale: 10 ** 4,
      variable_tick_size: tickSize,
      has_intraday: true,
      has_weekly_and_monthly: false,
      has_empty_bars: true,
      supported_resolutions: configurationData.supported_resolutions as any,
      intraday_multipliers: configurationData.intraday_multipliers,
      volume_precision: 2,
      data_status: "streaming",
      exchange: "",
      listed_exchange: "",
      format: "price",
    };

    // console.log('[resolveSymbol]: Symbol resolved', symbolAddress)
    onSymbolResolvedCallback(symbolInfo);
  },

  getBars: async (
    symbolInfo: SymbolInfo,
    resolution: ResolutionString,
    periodParams: {
      countBack: number;
      firstDataRequest: boolean;
      from: number;
      to: number;
    },
    onHistoryCallback: (
      bars: Bar[],
      t: {
        noData: boolean;
      },
    ) => void,
    onErrorCallback: (e: any) => void,
  ) => {
    const { from, to } = periodParams;
    // console.log('[getBars]: Method call', symbolInfo, resolution, from, to)
    const urlParameters = {
      address: symbolInfo.address,
      type: parseResolution(resolution),
      time_from: from,
      time_to: to,
    };
    const query = Object.keys(urlParameters)
      .map((name) => `${name}=${encodeURIComponent(urlParameters[name])}`)
      .join("&");

    try {
      const { firstDataRequest } = periodParams;
      let bars = await queryBirdeyeBars(
        symbolInfo.base_token,
        resolution as any,
        periodParams,
        symbolInfo.quote_token,
        symbolInfo.address,
      );
      if (!bars || bars.length === 0) {
        // "noData" should be set if there is no data in the requested period.
        onHistoryCallback([], {
          noData: true,
        });
        return;
      }
      if (firstDataRequest) {
        lastBarsCache.set(symbolInfo.address, {
          ...bars[bars.length - 1],
        });
      }
      onHistoryCallback(bars, {
        noData: false,
      });
      return bars;
    } catch (error) {
      console.warn("[getBars]: Get error", error);
      onErrorCallback(error);
    }
  },

  subscribeBars: (
    symbolInfo,
    resolution,
    onRealtimeCallback,
    subscriberUID,
    onResetCacheNeededCallback,
  ) => {
    // console.log(
    //   '[subscribeBars]: Method call with subscriberUID:',
    //   subscriberUID
    // )
    subscribeOnStream(
      symbolInfo,
      resolution,
      onRealtimeCallback,
      subscriberUID,
      onResetCacheNeededCallback,
      lastBarsCache.get(symbolInfo.address),
    );
  },

  unsubscribeBars: () => {
    // console.log('[unsubscribeBars]')
    unsubscribeFromStream();
  },
};
