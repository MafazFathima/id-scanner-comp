/**
 * Universal ID Scanner SDK
 * Main export file for NPM package
 * 
 * @packageDocumentation
 */

// Main component
export { IDScanner } from './IDScanner';

// Context and hooks
export { SDKProvider, useSDK, useTheme, useConfig, useCallbacks } from './context';

// Types
export type {
  SDKConfig,
  SDKTheme,
  SDKCallbacks,
  SDKInstance,
  SDKScreen,
  ScanResult,
  ScanError,
} from './types';

// Default configurations
export { DEFAULT_CONFIG, DEFAULT_THEME, DEFAULT_TRANSLATIONS } from './config';

// Utility hooks
export { useIsMobile, useIsTablet, useIsDesktop, useMediaQuery } from '../hooks/useMediaQuery';
