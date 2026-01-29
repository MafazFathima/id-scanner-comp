/**
 * Universal ID Scanner SDK Types
 * Complete type definitions for SDK configuration
 */

import React from 'react';

// ============================================================================
// DOCUMENT TYPES & TWO-SIDED SCANNING (NEW)
// ============================================================================

export type DocumentType = 
  | 'drivers-license'
  | 'national-id'
  | 'passport'
  | 'visa';

export type ScanSide = 'front' | 'back';

export interface DocumentRequirements {
  type: DocumentType;
  label: string;
  requiresFront: boolean;
  requiresBack: boolean;
  icon: string;
}

export const DOCUMENT_REQUIREMENTS: Record<DocumentType, DocumentRequirements> = {
  'drivers-license': {
    type: 'drivers-license',
    label: "Driver's License",
    requiresFront: true,
    requiresBack: true,
    icon: '🪪',
  },
  'national-id': {
    type: 'national-id',
    label: 'National ID',
    requiresFront: true,
    requiresBack: true,
    icon: '🆔',
  },
  'passport': {
    type: 'passport',
    label: 'Passport',
    requiresFront: true,
    requiresBack: true,
    icon: '🛂',
  },
  'visa': {
    type: 'visa',
    label: 'Visa',
    requiresFront: true,
    requiresBack: true,
    icon: '📋',
  },
};

export interface ScanProgress {
  documentType: DocumentType;
  frontImage?: string;
  frontData?: any;
  backImage?: string;
  backData?: any;
  currentSide: ScanSide;
  isComplete: boolean;
}

export interface CompleteScanResult {
  documentType: DocumentType;
  frontImage: string;
  frontData: any;
  backImage?: string;
  backData?: any;
  timestamp: string;
  confidence: number;
}

// ============================================================================
// THEME CONFIGURATION (EXISTING)
// ============================================================================

export interface SDKTheme {
  colors?: {
    primary?: string;
    primaryHover?: string;
    secondary?: string;
    secondaryHover?: string;
    success?: string;
    error?: string;
    warning?: string;
    background?: string;
    surface?: string;
    border?: string;
    textPrimary?: string;
    textSecondary?: string;
    textInverse?: string;
  };
  spacing?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    xxl?: string;
  };
  radius?: {
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
  typography?: {
    fontFamily?: string;
    fontFamilyMono?: string;
    h1?: {
      fontSize?: string;
      fontWeight?: number;
      lineHeight?: number;
      letterSpacing?: string;
    };
    h2?: {
      fontSize?: string;
      fontWeight?: number;
      lineHeight?: number;
      letterSpacing?: string;
    };
    body?: {
      fontSize?: string;
      fontWeight?: number;
      lineHeight?: number;
    };
    caption?: {
      fontSize?: string;
      fontWeight?: number;
      lineHeight?: number;
    };
  };
  breakpoints?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
}

// ============================================================================
// SDK CONFIGURATION (EXTENDED)
// ============================================================================

export interface SDKConfig {
  // Theme configuration
  theme?: SDKTheme;
  
  // Branding
  appName?: string;
  logo?: string | React.ReactNode;
  
  // Feature flags (EXTENDED with two-sided scanning)
  features?: {
    showWelcome?: boolean;
    enableHistory?: boolean;
    enableUpload?: boolean;
    enableCamera?: boolean;
    enableExport?: boolean;
    enableShare?: boolean;
    requireBackScan?: boolean; // NEW: Enable/disable two-sided scanning
  };
  
  // Behavior configuration
  behavior?: {
    autoDeleteAfterDays?: number;
    maxScansStored?: number;
    confidenceThreshold?: number;
    processingTimeout?: number;
  };
  
  // Supported document types
  documentTypes?: Array<{
    id: string;
    name: string;
    icon?: React.ReactNode;
    enabled: boolean;
  }>;
  
  // Localization
  locale?: string;
  translations?: Record<string, Record<string, string>>;
  
  // Privacy & Compliance
  privacy?: {
    showPrivacyNotice?: boolean;
    privacyPolicyUrl?: string;
    termsOfServiceUrl?: string;
    dataRetentionDays?: number;
  };
}

// ============================================================================
// SDK CALLBACKS (EXTENDED)
// ============================================================================

export interface SDKCallbacks {
  // Scan lifecycle
  onScanStart?: () => void;
  onScanProgress?: (progress: number, status: string) => void;
  onScanComplete?: (data: ScanResult | CompleteScanResult) => void; // EXTENDED: Can now receive CompleteScanResult
  onScanError?: (error: ScanError) => void;
  onScanCancel?: () => void;
  
  // User actions
  onExport?: (data: ScanResult, format: 'json' | 'csv' | 'pdf') => void;
  onShare?: (data: ScanResult) => void;
  onCopy?: (data: ScanResult) => void;
  onDelete?: (scanId: string) => void;
  
  // Navigation
  onNavigate?: (screen: SDKScreen) => void;
  onClose?: () => void;
}

// ============================================================================
// SCREEN TYPES (EXTENDED)
// ============================================================================

export type SDKScreen = 
  | 'welcome' 
  | 'scan' 
  | 'document-selection' // NEW: Added for two-sided scanning
  | 'scanning' 
  | 'results' 
  | 'error' 
  | 'history';

// ============================================================================
// SCAN RESULT (EXTENDED)
// ============================================================================

export interface ScanResult {
  id: string;
  timestamp: string;
  documentType: string;
  confidence: number;
  verified: boolean;
  data: {
    fullName?: string;
    idNumber?: string;
    dateOfBirth?: string;
    expirationDate?: string;
    address?: string;
    issuingAuthority?: string;
    [key: string]: any;
  };
  metadata: {
    processingTime: number;
    imageQuality: number;
    documentCountry?: string;
    documentState?: string;
    hasFrontScan?: boolean; // NEW: Track if front was scanned
    hasBackScan?: boolean;  // NEW: Track if back was scanned
  };
}

// ============================================================================
// ERROR TYPES (EXISTING)
// ============================================================================

export interface ScanError {
  code: 'scan-failed' | 'no-id-detected' | 'poor-quality' | 'timeout' | 'unsupported-document';
  message: string;
  details?: any;
}

// ============================================================================
// SDK INSTANCE (EXISTING)
// ============================================================================

export interface SDKInstance {
  // Navigation methods
  navigate: (screen: SDKScreen) => void;
  goBack: () => void;
  close: () => void;
  
  // Scan methods
  startScan: () => Promise<ScanResult>;
  cancelScan: () => void;
  uploadImage: (file: File) => Promise<ScanResult>;
  
  // History methods
  getHistory: () => ScanResult[];
  getScan: (id: string) => ScanResult | null;
  deleteScan: (id: string) => void;
  clearHistory: () => void;
  
  // Configuration methods
  updateConfig: (config: Partial<SDKConfig>) => void;
  updateTheme: (theme: Partial<SDKTheme>) => void;
  
  // State
  getCurrentScreen: () => SDKScreen;
  isScanning: () => boolean;
}