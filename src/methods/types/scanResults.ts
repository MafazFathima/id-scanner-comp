// src/types/scanResults.ts

/**
 * Scan method types
 */
export type ScanMethod = 'textract' | 'pdf417' | 'barcode';

/**
 * Individual scan result from a single method
 */
export interface IndividualScanResult {
  method: ScanMethod;
  success: boolean;
  confidence: number; // 0-100
  data: Record<string, any>;
  processingTime: number; // milliseconds
  error?: string;
  rawResponse?: any;
}

/**
 * Combined hybrid scan result
 */
export interface HybridScanResult {
  // Winner - the method with highest confidence
  selectedMethod: ScanMethod;
  selectedData: Record<string, any>;
  overallConfidence: number;
  
  // Individual results from each method
  textractResult?: IndividualScanResult;
  pdf417Result?: IndividualScanResult;
  
  // Metadata
  totalProcessingTime: number;
  timestamp: string;
  comparisonDetails: {
    textractConfidence: number;
    pdf417Confidence: number;
    confidenceDifference: number;
    recommendedMethod: ScanMethod;
  };
}

/**
 * PDF417 specific barcode data structure
 */
export interface PDF417Data {
  // Standard AAMVA fields (most common in driver's licenses)
  jurisdictionVersion?: string;
  aamvaVersion?: string;
  
  // Personal info
  firstName?: string;
  middleName?: string;
  lastName?: string;
  fullName?: string;
  
  // ID info
  idNumber?: string;
  dateOfBirth?: string;
  sex?: string;
  eyeColor?: string;
  height?: string;
  
  // Address
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  
  // Dates
  issueDate?: string;
  expirationDate?: string;
  
  // Additional fields
  restrictions?: string;
  endorsements?: string;
  vehicleClass?: string;
  
  // Raw data
  rawText?: string;
  
  [key: string]: any; // Allow additional fields
}

/**
 * Textract result structure (from AWS)
 */
export interface TextractData {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  idNumber?: string;
  dateOfBirth?: string;
  expirationDate?: string;
  address?: string;
  state?: string;
  confidence: number;
  rawResponse?: any;
  
  [key: string]: any;
}

/**
 * Confidence calculation metrics
 */
export interface ConfidenceMetrics {
  fieldCount: number;
  filledFieldCount: number;
  completenessScore: number; // 0-100
  dataQualityScore: number; // 0-100
  overallConfidence: number; // 0-100
}