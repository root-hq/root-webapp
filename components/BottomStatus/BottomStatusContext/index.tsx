import React, { createContext, useContext, useState } from 'react';
import { delay } from '../../../utils';

interface BottomStatusContextType {
  status: string;
  textStyle: React.CSSProperties;
  statusBarStyle: React.CSSProperties;
  updateStatus: (newStatus: string) => void;
  resetStatus: () => void;
  updateStatusCustom: (statusText: string, duration: number, textStyle?: React.CSSProperties, statusBarStyle?: React.CSSProperties) => void;
  updateStatusDuration: (statusText: string, duration: number, endNote?: string) => void;
}

const BottomStatusContext = createContext<BottomStatusContextType | undefined>(undefined);

export const useBottomStatus = () => {
  const context = useContext(BottomStatusContext);
  if (!context) {
    throw new Error('useBottomStatus must be used within a BottomStatusProvider');
  }
  return context;
};

//@ts-ignore
export const BottomStatusProvider = ({ children }) => {

  const DEFAULT_STATUS_MESSAGE = '';

  const [status, setStatus] = useState<string>(DEFAULT_STATUS_MESSAGE);
  const [textStyle, setTextStyle] = useState<React.CSSProperties>(null);
  const [statusBarStyle, setStatusBarStyle] = useState<React.CSSProperties>(null);

  const resetStatus = () => {
    setStatus(_ => DEFAULT_STATUS_MESSAGE);
  }

  const updateStatus = (newStatus: string) => {
    setStatus(_ => newStatus);
  };

  const updateStatusCustom = async (statusText: string, duration: number, textStyle?: React.CSSProperties, statusBarStyle?: React.CSSProperties) => {
    if(textStyle) {
      setTextStyle(_ => textStyle);
    }
    
    if(statusBarStyle) {
      setStatusBarStyle(_ => statusBarStyle);
    }

    setStatus(_ => statusText);

    await delay(duration);
    
    setTextStyle(_ => null);
    setStatusBarStyle(_ => null);
    resetStatus();
  }

  const updateStatusDuration = async (statusText: string, duration: number, endNote?: string) => {
    setStatus(statusText);
    await delay(duration);
    if(endNote) {
      setStatus(endNote);
      await delay(500);
    }
    resetStatus();
  }

  const value = {
    status,
    textStyle,
    statusBarStyle,
    updateStatus,
    updateStatusCustom,
    updateStatusDuration,
    resetStatus
  };

  return (
    <BottomStatusContext.Provider value={value}>
      {children}
    </BottomStatusContext.Provider>
  );
};