import { web3 } from "@coral-xyz/anchor";
import {
  Client,
  L3UiOrder,
  MarketData,
  deserializeMarketData,
  getMarketL3UiBook,
} from "@ellipsis-labs/phoenix-sdk";
import { WalletContextState, useWallet } from "@solana/wallet-adapter-react";
import { MAX_ACCOUNT_SIZE_BYTES } from "constants/";
import { PageTab } from "constants/";
import React, {
  MutableRefObject,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { ZSTDDecoder } from "zstddec";

interface RootStateContextType {
  connection: web3.Connection;
  phoenixClient: Client;
  bids: L3UiOrder[];
  asks: L3UiOrder[];
  activeTab: PageTab;
  midPrice: MutableRefObject<number>;
  spread: MutableRefObject<number>;
  instantaneousPriceIncrease: boolean;
  innerWidth: MutableRefObject<number>;
  innerHeight: MutableRefObject<number>;
  isMobile: MutableRefObject<boolean>;
  refreshBidsAndAsks: (zstdEncodedBuffer: Buffer) => void;
  setActiveTab: (newTab: PageTab) => void;
  setConnection: (newConn: web3.Connection) => void;
  setPhoenixClient: (newClient: Client) => void;
}

const RootStateContext = createContext<RootStateContextType | undefined>(
  undefined,
);

export const useRootState = () => {
  const context = useContext(RootStateContext);
  if (!context) {
    throw new Error("useRootState must be used within a RootStateProvider");
  }
  return context;
};

//@ts-ignore
export const RootStateProvider = ({ children }) => {
  const [connection, setConnection] = useState<web3.Connection | undefined>(
    undefined,
  );
  const [phoenixClient, setPhoenixClient] = useState<Client | undefined>(
    undefined,
  );
  const [activeTab, setActiveTab] = useState<PageTab>(PageTab.Trade);
  const [bids, setBids] = useState<L3UiOrder[]>([]);
  const [asks, setAsks] = useState<L3UiOrder[]>([]);
  const midPrice = useRef<number>(0.0);
  const spread = useRef<number>(0.0);
  const innerWidth = useRef<number>(0.0);
  const innerHeight = useRef<number>(0.0);
  const isMobile = useRef<boolean>(false);
  const [instantaneousPriceIncrease, setInstantaneousPriceIncrease] =
    useState<boolean>(true);

  const loadConnection = async () => {
    const c = new web3.Connection(process.env.RPC_ENDPOINT, "processed");
    setConnection((_) => c);
  };

  const loadPhoenixClient = async () => {
    let conn = new web3.Connection(process.env.RPC_ENDPOINT);

    let pc = await Client.create(conn);
    setPhoenixClient((_) => pc);
  };

  const refreshBidsAndAsks = async (zstdEncodedBuffer: Buffer) => {
    if (zstdEncodedBuffer) {
      let marketData = deserializeMarketData(zstdEncodedBuffer);
      let freshUiBook = getMarketL3UiBook(marketData, -1);

      setBids((_) => freshUiBook.bids);
      setAsks((_) =>
        freshUiBook.asks.sort(
          (a: L3UiOrder, b: L3UiOrder) => b.price - a.price,
        ),
      );

      let bestBid = 0;
      if(freshUiBook.bids && freshUiBook.bids.length) {
        bestBid = freshUiBook.bids[0].price;
      }

      let bestAsk = 0;
      if(freshUiBook.asks && freshUiBook.asks.length) {
        bestAsk = freshUiBook.asks[0].price;
      }

      let newPrice =
        (bestBid + bestAsk) / 2.0;
      let newSpread = bestAsk - bestBid;

      if (newPrice > midPrice.current) {
        setInstantaneousPriceIncrease((_) => true);
      } else if (midPrice.current > newPrice) {
        setInstantaneousPriceIncrease((_) => false);
      }

      midPrice.current = newPrice;
      spread.current = newSpread;
    }
  };

  useEffect(() => {
    const loadStuff = async () => {
      await loadConnection();
      await loadPhoenixClient();
    };

    loadStuff();
  }, []);

  const value = {
    connection,
    phoenixClient,
    bids,
    asks,
    midPrice,
    spread,
    instantaneousPriceIncrease,
    activeTab,
    setActiveTab,
    innerWidth,
    innerHeight,
    isMobile,
    refreshBidsAndAsks,
    setConnection,
    setPhoenixClient,
  };

  return (
    <RootStateContext.Provider value={value}>
      {children}
    </RootStateContext.Provider>
  );
};
