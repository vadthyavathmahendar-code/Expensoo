import React, { createContext, useContext, useState, useEffect } from 'react';

type Currency = 'INR' | 'USD';
type AccentColor = 'indigo' | 'emerald' | 'rose';
type AIPersonality = 'Professional' | 'Strict Coach' | 'Sarcastic Friend';

interface SettingsContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  weeklyBudget: number;
  setWeeklyBudget: (budget: number) => void;
  formatAmount: (amount: number) => string;
  privacyMode: boolean;
  setPrivacyMode: (val: boolean) => void;
  securityLockEnabled: boolean;
  setSecurityLockEnabled: (val: boolean) => void;
  pinCode: string;
  setPinCode: (val: string) => void;
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  aiPersonality: AIPersonality;
  setAiPersonality: (personality: AIPersonality) => void;
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

  const [privacyMode, setPrivacyMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('expenso_privacy_mode');
    return saved === 'true';
  });

  const [securityLockEnabled, setSecurityLockEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('expenso_security_lock');
    return saved === 'true';
  });

  const [pinCode, setPinCode] = useState<string>(() => {
    return localStorage.getItem('expenso_pin_code') || '';
  });

  const [accentColor, setAccentColor] = useState<AccentColor>(() => {
    const saved = localStorage.getItem('expenso_accent_color');
    return (saved as AccentColor) || 'indigo';
  });

  const [aiPersonality, setAiPersonality] = useState<AIPersonality>(() => {
    const saved = localStorage.getItem('expenso_ai_personality');
    return (saved as AIPersonality) || 'Professional';
  });

  useEffect(() => {
    localStorage.setItem('expenso_currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('expenso_weekly_budget', weeklyBudget.toString());
  }, [weeklyBudget]);

  useEffect(() => {
    localStorage.setItem('expenso_privacy_mode', privacyMode.toString());
  }, [privacyMode]);

  useEffect(() => {
    localStorage.setItem('expenso_security_lock', securityLockEnabled.toString());
  }, [securityLockEnabled]);

  useEffect(() => {
    localStorage.setItem('expenso_pin_code', pinCode);
  }, [pinCode]);

  useEffect(() => {
    localStorage.setItem('expenso_accent_color', accentColor);
  }, [accentColor]);

  useEffect(() => {
    localStorage.setItem('expenso_ai_personality', aiPersonality);
  }, [aiPersonality]);

  const formatAmount = (amount: number) => {
    const locale = currency === 'INR' ? 'en-IN' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <SettingsContext.Provider value={{ 
      currency, 
      setCurrency, 
      weeklyBudget, 
      setWeeklyBudget, 
      formatAmount,
      privacyMode,
      setPrivacyMode,
      securityLockEnabled,
      setSecurityLockEnabled,
      pinCode,
      setPinCode,
      accentColor,
      setAccentColor,
      aiPersonality,
      setAiPersonality
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
