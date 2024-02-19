import React, {
    createContext,
    useContext,
    useState,
} from "react";

export enum Capacity {
    Low,
    Medium,
    High
}

interface CreateMarketContextType {
    baseTokenMint: string;
    setBaseTokenMint: React.Dispatch<React.SetStateAction<string>>;
    quoteTokenMint: string;
    setQuoteTokenMint: React.Dispatch<React.SetStateAction<string>>;

    baseUnitsPerBaseLot: string;
    setBaseUnitsPerBaseLot: React.Dispatch<React.SetStateAction<string>>;
    quoteUnitsPerQuoteLot: string;
    setQuoteUnitsPerQuoteLot: React.Dispatch<React.SetStateAction<string>>;
    rawBaseUnitsPerBaseUnit: string;
    setRawBaseUnitsPerBaseUnit: React.Dispatch<React.SetStateAction<string>>;

    tickSizeInQuoteUnitsPerBaseUnit: string;
    setTickSizeInQuoteUnitsPerBaseUnit: React.Dispatch<React.SetStateAction<string>>;
    capacity: Capacity;
    setCapacity: React.Dispatch<React.SetStateAction<Capacity>>;


    takerFeeInBps: string;
    setTakerFeeInBps: React.Dispatch<React.SetStateAction<string>>;
    feeCollector: string;
    setFeeCollector: React.Dispatch<React.SetStateAction<string>>;

    resetAllFields: () => void
    getCapacityConfig: () => void
}

const CreateMarketContext = createContext<CreateMarketContextType | undefined>(
    undefined
);

export const useCreateMarketContext = () => {
    const context = useContext(CreateMarketContext);
    if(!context) {
        throw new Error("useCreateMarketContext must be used within a CreateMarketProvider");
    }
    return context;
}

//@ts-ignore
export const CreateMarketProvider = ({ children }) => {
    const [baseTokenMint, setBaseTokenMint] = useState<string>("");
    const [quoteTokenMint, setQuoteTokenMint] = useState<string>("");
    const [baseUnitsPerBaseLot, setBaseUnitsPerBaseLot] = useState<string>("");
    const [quoteUnitsPerQuoteLot, setQuoteUnitsPerQuoteLot] = useState<string>("");
    const [rawBaseUnitsPerBaseUnit, setRawBaseUnitsPerBaseUnit] = useState<string>("1.0");
    const [tickSizeInQuoteUnitsPerBaseUnit, setTickSizeInQuoteUnitsPerBaseUnit] = useState<string>("");
    const [capacity, setCapacity] = useState<Capacity>(Capacity.Low);
    const [takerFeeInBps, setTakerFeeInBps] = useState<string>("");
    const [feeCollector, setFeeCollector] = useState<string>("");

    const resetAllFields = () => {
        setBaseTokenMint(_ => "");
        setQuoteTokenMint(_ => "");
        setBaseUnitsPerBaseLot(_ => "");
        setQuoteUnitsPerQuoteLot(_ => "");
        setRawBaseUnitsPerBaseUnit(_ => "");
        setTickSizeInQuoteUnitsPerBaseUnit(_ => "");
        setCapacity(_ => Capacity.Low);
        setTakerFeeInBps(_ => "");
        setFeeCollector(_ => "");
    }

    const getCapacityConfig = () => {
        if(capacity === Capacity.Low) {
            return [1024, 2177];
        }
        else if(capacity === Capacity.Medium) {
            return [2048, 4225];
        }
        else if(capacity === Capacity.High) {
            return [4096, 8321];
        }
    }

    const value = {
        baseTokenMint,
        setBaseTokenMint,
        quoteTokenMint,
        setQuoteTokenMint,
        baseUnitsPerBaseLot,
        setBaseUnitsPerBaseLot,
        quoteUnitsPerQuoteLot,
        setQuoteUnitsPerQuoteLot,
        rawBaseUnitsPerBaseUnit,
        setRawBaseUnitsPerBaseUnit,
        tickSizeInQuoteUnitsPerBaseUnit,
        setTickSizeInQuoteUnitsPerBaseUnit,
        capacity,
        setCapacity,
        takerFeeInBps,
        setTakerFeeInBps,
        feeCollector,
        setFeeCollector,
        resetAllFields,
        getCapacityConfig
    };

    return (
        <CreateMarketContext.Provider value = {value}>
            {children}
        </CreateMarketContext.Provider>
    )
}
