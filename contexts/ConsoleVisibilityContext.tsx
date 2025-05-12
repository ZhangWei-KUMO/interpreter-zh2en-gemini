'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type ConsoleVisibilityContextType = {
  isConsoleVisible: boolean;
  toggleConsole: () => void;
  showConsole: () => void;
  hideConsole: () => void;
};

const ConsoleVisibilityContext = createContext<ConsoleVisibilityContextType | undefined>(undefined);

export function ConsoleVisibilityProvider({ children }: { children: ReactNode }) {
  const [isConsoleVisible, setIsConsoleVisible] = useState(false);

  const toggleConsole = () => {
    setIsConsoleVisible(prev => !prev);
  };

  const showConsole = () => {
    setIsConsoleVisible(true);
  };

  const hideConsole = () => {
    setIsConsoleVisible(false);
  };

  return (
    <ConsoleVisibilityContext.Provider 
      value={{ isConsoleVisible, toggleConsole, showConsole, hideConsole }}
    >
      {children}
    </ConsoleVisibilityContext.Provider>
  );
}

export function useConsoleVisibility() {
  const context = useContext(ConsoleVisibilityContext);
  if (context === undefined) {
    throw new Error('useConsoleVisibility must be used within a ConsoleVisibilityProvider');
  }
  return context;
} 