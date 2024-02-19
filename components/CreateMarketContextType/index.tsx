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

    baseLotsPerBaseUnit: string;
    setBaseLotsPerBaseUnit: React.Dispatch<React.SetStateAction<string>>;
    quoteLotsPerQuoteUnit: string;
    setQuoteLotsPerQuoteUnit: React.Dispatch<React.SetStateAction<string>>;
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
    const [baseLotsPerBaseUnit, setBaseLotsPerBaseUnit] = useState<string>("");
    const [quoteLotsPerQuoteUnit, setQuoteLotsPerQuoteUnit] = useState<string>("");
    const [rawBaseUnitsPerBaseUnit, setRawBaseUnitsPerBaseUnit] = useState<string>("");
    const [tickSizeInQuoteUnitsPerBaseUnit, setTickSizeInQuoteUnitsPerBaseUnit] = useState<string>("");
    const [capacity, setCapacity] = useState<Capacity>(Capacity.Low);
    const [takerFeeInBps, setTakerFeeInBps] = useState<string>("");
    const [feeCollector, setFeeCollector] = useState<string>("");

    const resetAllFields = () => {
        setBaseTokenMint(_ => "");
        setQuoteTokenMint(_ => "");
        setBaseLotsPerBaseUnit(_ => "");
        setQuoteLotsPerQuoteUnit(_ => "");
        setRawBaseUnitsPerBaseUnit(_ => "");
        setTickSizeInQuoteUnitsPerBaseUnit(_ => "");
        setCapacity(_ => Capacity.Low);
        setTakerFeeInBps(_ => "");
        setFeeCollector(_ => "");
    }

    const value = {
        baseTokenMint,
        setBaseTokenMint,
        quoteTokenMint,
        setQuoteTokenMint,
        baseLotsPerBaseUnit,
        setBaseLotsPerBaseUnit,
        quoteLotsPerQuoteUnit,
        setQuoteLotsPerQuoteUnit,
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
        resetAllFields
    };

    return (
        <CreateMarketContext.Provider value = {value}>
            {children}
        </CreateMarketContext.Provider>
    )
}
