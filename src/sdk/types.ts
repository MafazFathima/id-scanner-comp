import React from 'react';

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

export interface SDKConfig {
  theme?: SDKTheme;
  appName?: string;
  logo?: string | React.ReactNode;
  
  features?: {
    showWelcome?: boolean;
    enableHistory?: boolean;
    enableUpload?: boolean;
    enableCamera?: boolean;
    enableExport?: boolean;
    enableShare?: boolean;
    requireBackScan?: boolean;
  };
  
  behavior?: {
    autoDeleteAfterDays?: number;
    maxScansStored?: number;
    confidenceThreshold?: number;
    processingTimeout?: number;
  };
  
  documentTypes?: Array<{
    id: string;
    name: string;
    icon?: React.ReactNode;
    enabled: boolean;
  }>;
  locale?: string;
  translations?: Record<string, Record<string, string>>;
  
  privacy?: {
    showPrivacyNotice?: boolean;
    privacyPolicyUrl?: string;
    termsOfServiceUrl?: string;
    dataRetentionDays?: number;
  };
}

export interface SDKCallbacks {
  onScanStart?: () => void;
  onScanProgress?: (progress: number, status: string) => void;
  onScanComplete?: (data: ScanResult | CompleteScanResult) => void; // EXTENDED: Can now receive CompleteScanResult
  onScanError?: (error: ScanError) => void;
  onScanCancel?: () => void;
  onExport?: (data: ScanResult, format: 'json' | 'csv' | 'pdf') => void;
  onShare?: (data: ScanResult) => void;
  onCopy?: (data: ScanResult) => void;
  onDelete?: (scanId: string) => void;
  onNavigate?: (screen: SDKScreen) => void;
  onClose?: () => void;
}

export type SDKScreen = 
  | 'welcome' 
  | 'scan' 
  | 'document-selection'
  | 'scanning' 
  | 'results' 
  | 'error' 
  | 'history';

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
    hasFrontScan?: boolean; 
    hasBackScan?: boolean;  
  };
}

export interface ScanError {
  code: 'scan-failed' | 'no-id-detected' | 'poor-quality' | 'timeout' | 'unsupported-document';
  message: string;
  details?: any;
}

export interface SDKInstance {
  navigate: (screen: SDKScreen) => void;
  goBack: () => void;
  close: () => void;
  startScan: () => Promise<ScanResult>;
  cancelScan: () => void;
  uploadImage: (file: File) => Promise<ScanResult>;
  getHistory: () => ScanResult[];
  getScan: (id: string) => ScanResult | null;
  deleteScan: (id: string) => void;
  clearHistory: () => void;
  updateConfig: (config: Partial<SDKConfig>) => void;
  updateTheme: (theme: Partial<SDKTheme>) => void;
  getCurrentScreen: () => SDKScreen;
  isScanning: () => boolean;
}