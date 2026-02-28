import React, { createContext, useContext, useState, useEffect } from 'react';

type Currency = 'INR' | 'USD';

interface SettingsContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  weeklyBudget: number;
  setWeeklyBudget: (budget: number) => void;
  formatAmount: (amount: number) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>(() => {
    const saved = localStorage.getItem('expenso_currency');
    return (saved as Currency) || 'INR';
  });

  const [weeklyBudget, setWeeklyBudget] = useState<number>(() => {
    const saved = localStorage.getItem('expenso_weekly_budget');
    return saved ? parseInt(saved, 10) : 500;
  });

  useEffect(() => {
    localStorage.setItem('expenso_currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('expenso_weekly_budget', weeklyBudget.toString());
  }, [weeklyBudget]);

  const formatAmount = (amount: number) => {
    const symbol = currency === 'INR' ? '₹' : '$';
    return `${symbol}${amount.toLocaleString()}`;
  };

  return (
    <SettingsContext.Provider value={{ 
      currency, 
      setCurrency, 
      weeklyBudget, 
      setWeeklyBudget, 
      formatAmount 
    }}>
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
