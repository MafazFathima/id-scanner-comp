import type { SDKConfig, SDKTheme } from '../sdk/types';

export const DEFAULT_THEME: SDKTheme = {
  colors: {
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    secondary: '#64748b',
    secondaryHover: '#475569',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    background: '#ffffff',
    surface: '#f8fafc',
    border: '#e2e8f0',
    textPrimary: '#0f172a',
    textSecondary: '#64748b',
    textInverse: '#ffffff',
  },
  spacing: {
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    fontFamilyMono: '"SF Mono", "Monaco", "Inconsolata", "Fira Mono", monospace',
    h1: {
      fontSize: '28px',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '20px',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    body: {
      fontSize: '16px',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    caption: {
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: 1.4,
    },
  },
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1025,
  },
};

export const DEFAULT_CONFIG: SDKConfig = {
  theme: DEFAULT_THEME,
  appName: 'Universal ID Scanner',
  features: {
    showWelcome: true,
    enableHistory: true,
    enableUpload: true,
    enableCamera: true,
    enableExport: true,
    enableShare: true,
  },
  behavior: {
    autoDeleteAfterDays: 30,
    maxScansStored: 100,
    confidenceThreshold: 0.85,
    processingTimeout: 30000,
  },
  documentTypes: [
    { id: 'drivers-license', name: "Driver's License", enabled: true },
    { id: 'passport', name: 'Passport', enabled: true },
    { id: 'national-id', name: 'National ID', enabled: true },
    { id: 'visa', name: 'Visa', enabled: true },
  ],
  locale: 'en',
  privacy: {
    showPrivacyNotice: true,
    dataRetentionDays: 30,
  },
};

export const DEFAULT_TRANSLATIONS = {
  en: {
    'app.name': 'Universal ID Scanner',
    'welcome.title': 'Universal ID Scanner',
    'welcome.description': 'Scan and verify IDs with enterprise-grade accuracy and privacy',
    'welcome.cta': 'Get Started',
    'scan.title': 'Scan ID',
    'scan.camera': 'Start Camera',
    'scan.upload': 'Upload from Gallery',
    'scan.tips.title': 'Scanning Tips',
    'results.success': 'Scan Successful',
    'results.verified': 'Verified',
    'results.newScan': 'Scan Another ID',
    'history.title': 'Scan History',
    'error.retry': 'Try Again',
  },
};
