/**
 * OCR API Integration Utilities
 * Helper functions for integrating with your OCR service
 */

// ==========================================
// API Configuration
// ==========================================

export const OCR_CONFIG = {
  // TODO: Replace with your actual API endpoint
  endpoint: 'https://your-ocr-api.com/v1/scan',
  
  // TODO: Add your API key if required
  apiKey: process.env.REACT_APP_OCR_API_KEY || '',
  
  // Request timeout (ms)
  timeout: 30000,
  
  // Image quality (0.0 - 1.0)
  imageQuality: 0.92,
  
  // Max image dimensions
  maxWidth: 1920,
  maxHeight: 1080,
};

// ==========================================
// Types
// ==========================================

export interface OCRRequest {
  image: string; // Base64 encoded image
  documentType?: string;
  country?: string;
  options?: {
    enhanceImage?: boolean;
    extractFace?: boolean;
    detectFraud?: boolean;
  };
}

export interface OCRResponse {
  success: boolean;
  confidence: number;
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
    documentType?: string;
    documentState?: string;
    documentCountry?: string;
    processingTime?: number;
    imageQuality?: number;
  };
  errors?: string[];
}

// ==========================================
// Helper Functions
// ==========================================

/**
 * Compress base64 image to reduce size before API call
 */
export async function compressBase64Image(
  base64: string,
  maxWidth: number = OCR_CONFIG.maxWidth,
  maxHeight: number = OCR_CONFIG.maxHeight,
  quality: number = OCR_CONFIG.imageQuality
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      
      // Calculate new dimensions
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      const compressed = canvas.toDataURL('image/jpeg', quality);
      resolve(compressed);
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = base64;
  });
}

/**
 * Remove base64 prefix to get raw data
 */
export function stripBase64Prefix(base64: string): string {
  return base64.replace(/^data:image\/\w+;base64,/, '');
}

/**
 * Add base64 prefix if missing
 */
export function ensureBase64Prefix(data: string): string {
  if (!data.startsWith('data:')) {
    return `data:image/jpeg;base64,${data}`;
  }
  return data;
}

// ==========================================
// Main API Call Function
// ==========================================

/**
 * Call OCR API with base64 image
 * 
 * Example usage:
 * ```typescript
 * const result = await callOCRApi(base64Image);
 * if (result.success) {
 *   console.log('Name:', result.data.fullName);
 * }
 * ```
 */
export async function callOCRApi(
  imageBase64: string,
  options?: OCRRequest['options']
): Promise<OCRResponse> {
  try {
    console.log('📤 Sending image to OCR API...');
    console.log('Image size:', imageBase64.length, 'characters');
    
    // Optionally compress image
    const compressedImage = await compressBase64Image(imageBase64);
    console.log('Compressed size:', compressedImage.length, 'characters');
    
    // Prepare request
    const requestBody: OCRRequest = {
      image: stripBase64Prefix(compressedImage),
      documentType: 'drivers_license',
      country: 'US',
      options: {
        enhanceImage: true,
        extractFace: false,
        detectFraud: true,
        ...options,
      },
    };
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), OCR_CONFIG.timeout);
    
    // Make API call
    const response = await fetch(OCR_CONFIG.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(OCR_CONFIG.apiKey && {
          'Authorization': `Bearer ${OCR_CONFIG.apiKey}`,
        }),
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ OCR API response:', data);
    
    return data;
    
  } catch (error) {
    console.error('❌ OCR API error:', error);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - OCR processing took too long');
      }
      throw error;
    }
    
    throw new Error('Unknown OCR API error');
  }
}

// ==========================================
// Alternative API Formats
// ==========================================

/**
 * Example: If your API expects multipart/form-data instead of JSON
 */
export async function callOCRApiFormData(imageBase64: string): Promise<OCRResponse> {
  // Convert base64 to blob
  const blob = await fetch(imageBase64).then(r => r.blob());
  
  const formData = new FormData();
  formData.append('image', blob, 'id-scan.jpg');
  formData.append('documentType', 'drivers_license');
  
  const response = await fetch(OCR_CONFIG.endpoint, {
    method: 'POST',
    headers: {
      ...(OCR_CONFIG.apiKey && {
        'Authorization': `Bearer ${OCR_CONFIG.apiKey}`,
      }),
    },
    body: formData,
  });
  
  return await response.json();
}

// ==========================================
// Response Mappers
// ==========================================

/**
 * Map common OCR API response formats to our standard format
 */
export function mapOCRResponse(apiResponse: any): OCRResponse {
  // Example mapper for different API formats
  
  // Format 1: If API returns nested structure
  if (apiResponse.result && apiResponse.result.fields) {
    return {
      success: true,
      confidence: apiResponse.confidence || 0.99,
      data: {
        fullName: apiResponse.result.fields.name,
        idNumber: apiResponse.result.fields.document_number,
        dateOfBirth: apiResponse.result.fields.birth_date,
        // ... map other fields
      },
      metadata: {
        documentType: apiResponse.document_type,
        processingTime: apiResponse.processing_time,
        imageQuality: apiResponse.image_quality,
      },
    };
  }
  
  // Format 2: If API returns flat structure
  if (apiResponse.name && apiResponse.document_number) {
    return {
      success: true,
      confidence: apiResponse.confidence || 0.99,
      data: {
        fullName: apiResponse.name,
        idNumber: apiResponse.document_number,
        dateOfBirth: apiResponse.dob,
        // ... map other fields
      },
      metadata: {
        documentType: apiResponse.doc_type,
        processingTime: apiResponse.time_ms / 1000,
        imageQuality: apiResponse.quality_score,
      },
    };
  }
  
  // Default: assume it's already in our format
  return apiResponse as OCRResponse;
}

// ==========================================
// Mock API for Testing
// ==========================================

/**
 * Mock OCR API for testing without a real backend
 */
export async function mockOCRApi(imageBase64: string): Promise<OCRResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simulate random confidence
  const confidence = 0.95 + Math.random() * 0.04;
  
  return {
    success: true,
    confidence,
    data: {
      fullName: 'JOHN MICHAEL SMITH',
      idNumber: 'D1234-5678-9012-34',
      dateOfBirth: 'January 15, 1990',
      expirationDate: 'December 31, 2027',
      address: '123 Main Street, San Francisco, CA 94102',
      issuingAuthority: 'California DMV',
    },
    metadata: {
      documentType: "Driver's License",
      documentState: 'California',
      documentCountry: 'USA',
      processingTime: 1.8,
      imageQuality: 0.95,
    },
  };
}

// ==========================================
// Usage Example
// ==========================================

/*
// In your ScanningScreen.tsx, replace mockOCRApiCall with:

import { callOCRApi, mockOCRApi } from '../utils/ocrApi';

const processImage = async (imageBase64: string) => {
  try {
    // Use real API
    const ocrResult = await callOCRApi(imageBase64);
    
    // Or use mock API for testing
    // const ocrResult = await mockOCRApi(imageBase64);
    
    if (!ocrResult.success) {
      throw new Error('OCR processing failed');
    }
    
    return ocrResult;
    
  } catch (error) {
    console.error('OCR error:', error);
    throw error;
  }
};
*/