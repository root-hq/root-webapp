import React, { createContext, useContext, useState } from 'react';
import { delay } from '../../../utils';

interface BottomStatusContextType {
  status: React.JSX.Element;
  statusStyle: React.CSSProperties;
  statusBarStyle: React.CSSProperties;
  updateStatus: (newStatus: React.JSX.Element) => void;
  resetStatus: () => void;
  updateStatusCustom: (status: React.JSX.Element, duration: number, statusStyle?: React.CSSProperties, statusBarStyle?: React.CSSProperties) => void;
  updateStatusDuration: (status: React.JSX.Element, duration: number, endNote?: React.JSX.Element) => void;
  red: (status: React.JSX.Element, duration: number) => void;
  green: (status: React.JSX.Element, duration: number) => void;
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

  const DEFAULT_STATUS_MESSAGE = <></>;

  const [status, setStatus] = useState<React.JSX.Element>(DEFAULT_STATUS_MESSAGE);
  const [statusStyle, setStatusStyle] = useState<React.CSSProperties>(null);
  const [statusBarStyle, setStatusBarStyle] = useState<React.CSSProperties>(null);

  const resetStatus = () => {
    console.log("Reseting status");
    setStatus(_ => DEFAULT_STATUS_MESSAGE);
  }

  const updateStatus = (newStatus: React.JSX.Element) => {
    setStatus(_ => newStatus);
  };

  const updateStatusCustom = async (status: React.JSX.Element, duration: number, statusStyle?: React.CSSProperties, statusBarStyle?: React.CSSProperties) => {
    if(statusStyle) {
      setStatusStyle(_ => statusStyle);
    }
    
    if(statusBarStyle) {
      setStatusBarStyle(_ => statusBarStyle);
    }

    updateStatus(status);

    await delay(duration);
    
    setStatusStyle(_ => null);
    setStatusBarStyle(_ => null);
    resetStatus();
  }

  const updateStatusDuration = async (status: React.JSX.Element, duration: number, endNote?: React.JSX.Element) => {
    updateStatus(status);
    await delay(duration);
    if(endNote) {
      updateStatus(endNote);
      await delay(500);
    }
    resetStatus();
  }

  const red = async (status: React.JSX.Element, duration: number) => {
    updateStatusCustom(status, duration, {color: '#e33d3d'}, {backgroundColor: '#150e11'});
  }

  const green = async (status: React.JSX.Element, duration: number) => {
    updateStatusCustom(status, duration, {color: '#3DE383'}, {backgroundColor: '#12211b'});
  }

  const value = {
    status,
    statusStyle,
    statusBarStyle,
    updateStatus,
    updateStatusCustom,
    updateStatusDuration,
    resetStatus,
    red,
    green
  };

  return (
    <BottomStatusContext.Provider value={value}>
      {children}
    </BottomStatusContext.Provider>
  );
};