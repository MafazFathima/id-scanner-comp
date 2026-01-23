import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { SDKConfig, SDKCallbacks, SDKTheme, ScanResult, SDKScreen } from './types';
import { DEFAULT_CONFIG, DEFAULT_THEME, DEFAULT_TRANSLATIONS } from './config';

interface SDKContextValue {
  config: SDKConfig;
  callbacks: SDKCallbacks;
  theme: SDKTheme;
  currentScreen: SDKScreen;
  scanHistory: ScanResult[];
  
  // Methods
  updateConfig: (config: Partial<SDKConfig>) => void;
  updateTheme: (theme: Partial<SDKTheme>) => void;
  navigate: (screen: SDKScreen) => void;
  addScanResult: (result: ScanResult) => void;
  deleteScan: (id: string) => void;
  clearHistory: () => void;
  translate: (key: string) => string;
}

const SDKContext = createContext<SDKContextValue | null>(null);

interface SDKProviderProps {
  children: React.ReactNode;
  config?: Partial<SDKConfig>;
  callbacks?: SDKCallbacks;
  initialScreen?: SDKScreen;
}

export function SDKProvider({ children, config: userConfig = {}, callbacks = {}, initialScreen = 'welcome' }: SDKProviderProps) {
  const [config, setConfig] = useState<SDKConfig>(() => ({
    ...DEFAULT_CONFIG,
    ...userConfig,
    theme: {
      ...DEFAULT_THEME,
      ...userConfig.theme,
    },
  }));
  
  const [currentScreen, setCurrentScreen] = useState<SDKScreen>(initialScreen);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);

  const theme = useMemo(() => ({
    ...DEFAULT_THEME,
    ...config.theme,
    colors: {
      ...DEFAULT_THEME.colors,
      ...config.theme?.colors,
    },
    spacing: {
      ...DEFAULT_THEME.spacing,
      ...config.theme?.spacing,
    },
    radius: {
      ...DEFAULT_THEME.radius,
      ...config.theme?.radius,
    },
    typography: {
      ...DEFAULT_THEME.typography,
      ...config.theme?.typography,
    },
  }), [config.theme]);

  const updateConfig = useCallback((newConfig: Partial<SDKConfig>) => {
    setConfig(prev => ({
      ...prev,
      ...newConfig,
      theme: {
        ...prev.theme,
        ...newConfig.theme,
      },
    }));
  }, []);

  const updateTheme = useCallback((newTheme: Partial<SDKTheme>) => {
    setConfig(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        ...newTheme,
      },
    }));
  }, []);

  const navigate = useCallback((screen: SDKScreen) => {
    setCurrentScreen(screen);
    callbacks.onNavigate?.(screen);
  }, [callbacks]);

  const addScanResult = useCallback((result: ScanResult) => {
    setScanHistory(prev => {
      const maxScans = config.behavior?.maxScansStored || 100;
      const newHistory = [result, ...prev];
      return newHistory.slice(0, maxScans);
    });
  }, [config.behavior?.maxScansStored]);

  const deleteScan = useCallback((id: string) => {
    setScanHistory(prev => prev.filter(scan => scan.id !== id));
    callbacks.onDelete?.(id);
  }, [callbacks]);

  const clearHistory = useCallback(() => {
    setScanHistory([]);
  }, []);

  const translate = useCallback((key: string): string => {
    const locale = config.locale || 'en';
    const translations = config.translations || DEFAULT_TRANSLATIONS;
    return (translations[locale as keyof typeof translations] as Record<string, string>)?.[key] || (DEFAULT_TRANSLATIONS.en as Record<string, string>)[key] || key;
  }, [config.locale, config.translations]);

  const value = useMemo(() => ({
    config,
    callbacks,
    theme,
    currentScreen,
    scanHistory,
    updateConfig,
    updateTheme,
    navigate,
    addScanResult,
    deleteScan,
    clearHistory,
    translate,
  }), [
    config,
    callbacks,
    theme,
    currentScreen,
    scanHistory,
    updateConfig,
    updateTheme,
    navigate,
    addScanResult,
    deleteScan,
    clearHistory,
    translate,
  ]);

  return (
    <SDKContext.Provider value={value}>
      {children}
    </SDKContext.Provider>
  );
}

export function useSDK(): SDKContextValue {
  const context = useContext(SDKContext);
  if (!context) {
    throw new Error('useSDK must be used within SDKProvider');
  }
  return context;
}

export function useTheme(): SDKTheme {
  const { theme } = useSDK();
  return theme;
}

export function useConfig(): SDKConfig {
  const { config } = useSDK();
  return config;
}

export function useCallbacks(): SDKCallbacks {
  const { callbacks } = useSDK();
  return callbacks;
}
