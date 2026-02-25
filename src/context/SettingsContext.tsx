import React, { createContext, useContext, useState, useEffect } from 'react';

type Currency = 'INR' | 'USD';

interface SettingsContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatAmount: (amount: number) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>(() => {
    const saved = localStorage.getItem('expenso_currency');
    return (saved as Currency) || 'INR';
  });

  useEffect(() => {
    localStorage.setItem('expenso_currency', currency);
  }, [currency]);

  const formatAmount = (amount: number) => {
    const symbol = currency === 'INR' ? '₹' : '$';
    return `${symbol}${amount.toLocaleString()}`;
  };

  return (
    <SettingsContext.Provider value={{ currency, setCurrency, formatAmount }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
