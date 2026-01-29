// src/services/confidenceCalculator.ts

import type {
  IndividualScanResult,
  ConfidenceMetrics,
  ScanMethod,
} from '../types/scanResults';

/**
 * Confidence Calculator
 * Compares results from different scanning methods and determines the best one
 */
export class ConfidenceCalculator {
  
  /**
   * Calculate confidence metrics for a scan result
   */
  calculateMetrics(scanResult: IndividualScanResult): ConfidenceMetrics {
    const { data } = scanResult;

    // Define important fields for ID documents
    const importantFields = [
      'firstName',
      'lastName',
      'fullName',
      'idNumber',
      'dateOfBirth',
      'expirationDate',
      'address',
      'state',
    ];

    // Count total fields and filled fields
    const allFields = Object.keys(data).filter(k => 
      k !== 'rawText' && 
      k !== 'rawResponse' && 
      k !== 'confidence' &&
      !k.startsWith('_')
    );
    
    const filledFields = allFields.filter(k => {
      const value = data[k];
      return value !== undefined && value !== null && value !== '';
    });

    // Count important filled fields
    const filledImportantFields = importantFields.filter(field => {
      const value = data[field];
      return value !== undefined && value !== null && value !== '';
    });

    // Calculate scores
    const completenessScore = this.calculateCompletenessScore(
      filledImportantFields.length,
      importantFields.length
    );

    const dataQualityScore = this.calculateDataQualityScore(data);

    // Combine scores with weights
    const overallConfidence = Math.round(
      (completenessScore * 0.5) + 
      (dataQualityScore * 0.3) +
      (scanResult.confidence * 0.2)
    );

    return {
      fieldCount: allFields.length,
      filledFieldCount: filledFields.length,
      completenessScore,
      dataQualityScore,
      overallConfidence: Math.min(100, Math.max(0, overallConfidence)),
    };
  }

  /**
   * Calculate completeness score based on filled important fields
   */
  private calculateCompletenessScore(
    filledImportant: number,
    totalImportant: number
  ): number {
    return Math.round((filledImportant / totalImportant) * 100);
  }

  /**
   * Calculate data quality score based on field validation
   */
  private calculateDataQualityScore(data: Record<string, any>): number {
    let qualityScore = 100;
    let checksPerformed = 0;

    // Check date formats
    const dateFields = ['dateOfBirth', 'expirationDate', 'issueDate'];
    dateFields.forEach(field => {
      if (data[field]) {
        checksPerformed++;
        if (!this.isValidDate(data[field])) {
          qualityScore -= 10;
        }
      }
    });

    // Check name fields aren't too short or contain numbers
    const nameFields = ['firstName', 'lastName', 'fullName'];
    nameFields.forEach(field => {
      if (data[field]) {
        checksPerformed++;
        const value = String(data[field]);
        if (value.length < 2 || /\d/.test(value)) {
          qualityScore -= 10;
        }
      }
    });

    // Check ID number has reasonable length
    if (data.idNumber) {
      checksPerformed++;
      const idLength = String(data.idNumber).length;
      if (idLength < 4 || idLength > 20) {
        qualityScore -= 5;
      }
    }

    // If no checks performed, return moderate score
    if (checksPerformed === 0) {
      return 70;
    }

    return Math.max(0, Math.min(100, qualityScore));
  }

  /**
   * Validate date format
   */
  private isValidDate(dateString: string): boolean {
    // Common date formats: MM/DD/YYYY, YYYY-MM-DD, DD-MM-YYYY
    const datePatterns = [
      /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
      /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
      /^\d{2}-\d{2}-\d{4}$/, // DD-MM-YYYY
      /^\d{8}$/,              // YYYYMMDD or MMDDYYYY
    ];

    return datePatterns.some(pattern => pattern.test(dateString));
  }

  /**
   * Compare two scan results and determine which is better
   */
  compareScanResults(
    result1: IndividualScanResult,
    result2: IndividualScanResult
  ): {
    winner: ScanMethod;
    confidenceDifference: number;
    recommendation: string;
  } {
    const metrics1 = this.calculateMetrics(result1);
    const metrics2 = this.calculateMetrics(result2);

    const confidence1 = metrics1.overallConfidence;
    const confidence2 = metrics2.overallConfidence;

    const difference = Math.abs(confidence1 - confidence2);

    let winner: ScanMethod;
    let recommendation: string;

    if (confidence1 > confidence2) {
      winner = result1.method;
      recommendation = difference > 15 
        ? `${result1.method} is significantly more reliable (${difference}% higher confidence)`
        : `${result1.method} is slightly better (${difference}% higher confidence)`;
    } else if (confidence2 > confidence1) {
      winner = result2.method;
      recommendation = difference > 15
        ? `${result2.method} is significantly more reliable (${difference}% higher confidence)`
        : `${result2.method} is slightly better (${difference}% higher confidence)`;
    } else {
      // Tie - prefer barcode for structured data
      winner = result1.method === 'pdf417' ? result1.method : result2.method;
      recommendation = 'Both methods produced similar results';
    }

    return {
      winner,
      confidenceDifference: difference,
      recommendation,
    };
  }

  /**
   * Merge data from multiple scan results intelligently
   * Takes the most confident value for each field
   */
  mergeResults(
    textractResult: IndividualScanResult,
    barcodeResult: IndividualScanResult
  ): Record<string, any> {
    const merged: Record<string, any> = {};

    const allKeys = new Set([
      ...Object.keys(textractResult.data),
      ...Object.keys(barcodeResult.data),
    ]);

    for (const key of allKeys) {
      const textractValue = textractResult.data[key];
      const barcodeValue = barcodeResult.data[key];

      // If only one has the value, use it
      if (textractValue && !barcodeValue) {
        merged[key] = textractValue;
      } else if (barcodeValue && !textractValue) {
        merged[key] = barcodeValue;
      } 
      // If both have values
      else if (textractValue && barcodeValue) {
        // For critical fields, prefer barcode (more structured)
        const criticalFields = ['idNumber', 'dateOfBirth', 'expirationDate'];
        if (criticalFields.includes(key)) {
          merged[key] = barcodeValue;
          merged[`${key}_textract`] = textractValue; // Keep alternative
        } else {
          // For other fields, prefer the longer/more complete value
          merged[key] = String(textractValue).length >= String(barcodeValue).length
            ? textractValue
            : barcodeValue;
        }
      }
    }

    return merged;
  }

  /**
   * Format confidence for display
   */
  formatConfidence(confidence: number): string {
    if (confidence >= 90) return `${confidence}% - Excellent`;
    if (confidence >= 75) return `${confidence}% - Good`;
    if (confidence >= 60) return `${confidence}% - Fair`;
    return `${confidence}% - Poor`;
  }
}

// Export singleton instance
export const confidenceCalculator = new ConfidenceCalculator();