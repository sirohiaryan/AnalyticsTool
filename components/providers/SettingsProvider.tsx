'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AccentColor, DateRange, FeatureFlags, ThemeMode } from '@/lib/types';

type ProviderMode = 'mock' | 'dataset' | 'supabase';

type CustomRange = { start: string; end: string };

type SettingsContextValue = {
  providerMode: ProviderMode;
  setProviderMode: (mode: ProviderMode) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  customRange: CustomRange;
  setCustomRange: (range: CustomRange) => void;
  featureFlags: FeatureFlags;
  setFeatureFlag: (flag: keyof FeatureFlags, enabled: boolean) => void;
};

const defaultFlags: FeatureFlags = {
  cohortAnalysis: true,
  abTestingInsights: false,
  revenueForecasting: true,
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

const getStored = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [providerMode, setProviderMode] = useState<ProviderMode>('dataset');
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [accentColor, setAccentColor] = useState<AccentColor>('purple');
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [customRange, setCustomRange] = useState<CustomRange>({ start: '', end: '' });
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>(defaultFlags);

  useEffect(() => {
    setProviderMode(getStored<ProviderMode>('settings.providerMode', 'dataset'));
    setThemeMode(getStored<ThemeMode>('settings.themeMode', 'dark'));
    setAccentColor(getStored<AccentColor>('settings.accentColor', 'purple'));
    setDateRange(getStored<DateRange>('settings.dateRange', '30d'));
    setCustomRange(getStored<CustomRange>('settings.customRange', { start: '', end: '' }));
    setFeatureFlags(getStored<FeatureFlags>('settings.featureFlags', defaultFlags));
  }, []);

  useEffect(() => {
    localStorage.setItem('settings.providerMode', JSON.stringify(providerMode));
  }, [providerMode]);
  useEffect(() => {
    localStorage.setItem('settings.themeMode', JSON.stringify(themeMode));
    document.documentElement.dataset.theme = themeMode;
  }, [themeMode]);
  useEffect(() => {
    localStorage.setItem('settings.accentColor', JSON.stringify(accentColor));
    document.documentElement.dataset.accent = accentColor;
  }, [accentColor]);
  useEffect(() => {
    localStorage.setItem('settings.dateRange', JSON.stringify(dateRange));
  }, [dateRange]);
  useEffect(() => {
    localStorage.setItem('settings.customRange', JSON.stringify(customRange));
  }, [customRange]);
  useEffect(() => {
    localStorage.setItem('settings.featureFlags', JSON.stringify(featureFlags));
  }, [featureFlags]);

  const setFeatureFlag = (flag: keyof FeatureFlags, enabled: boolean) => {
    setFeatureFlags((prev) => ({ ...prev, [flag]: enabled }));
  };

  const value = useMemo(
    () => ({
      providerMode,
      setProviderMode,
      themeMode,
      setThemeMode,
      accentColor,
      setAccentColor,
      dateRange,
      setDateRange,
      customRange,
      setCustomRange,
      featureFlags,
      setFeatureFlag,
    }),
    [providerMode, themeMode, accentColor, dateRange, customRange, featureFlags],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};
