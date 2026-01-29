// src/services/hybridScanService.ts

import { barcodeService } from './barcodeService';
import { scanIDWithTextract } from './textractService';
import { confidenceCalculator } from '../methods/confidenceCalculator';
import type {
  HybridScanResult,
  IndividualScanResult,
  ScanMethod,
} from '../methods/types/scanResults';

/**
 * Hybrid Scan Service
 * Runs both Textract and PDF417 scanning in parallel,
 * compares results, and returns the best one
 */
export class HybridScanService {

  /**
   * Scan image with both methods and return the best result
   * @param imageBase64 - Base64 encoded image
   * @param options - Scanning options
   */
  async scanWithBothMethods(
    imageBase64: string,
    options: {
      runInParallel?: boolean;
      preferredMethod?: ScanMethod;
      onProgress?: (method: ScanMethod, progress: number) => void;
    } = {}
  ): Promise<HybridScanResult> {
    const {
      runInParallel = true,
      preferredMethod,
      onProgress,
    } = options;

    console.log('🔄 Starting hybrid scan (Textract + PDF417)...');
    const overallStartTime = performance.now();

    let textractResult: IndividualScanResult | undefined;
    let pdf417Result: IndividualScanResult | undefined;

    try {
      if (runInParallel) {
        // Run both methods simultaneously for speed
        console.log('⚡ Running scans in parallel...');
        
        const [textractRes, pdf417Res] = await Promise.allSettled([
          this.runTextractScan(imageBase64, onProgress),
          this.runPDF417Scan(imageBase64, onProgress),
        ]);

        textractResult = textractRes.status === 'fulfilled' ? textractRes.value : undefined;
        pdf417Result = pdf417Res.status === 'fulfilled' ? pdf417Res.value : undefined;

      } else {
        // Run sequentially (PDF417 first as it's usually faster)
        console.log('🔄 Running scans sequentially...');
        
        pdf417Result = await this.runPDF417Scan(imageBase64, onProgress);
        textractResult = await this.runTextractScan(imageBase64, onProgress);
      }

      // Analyze and compare results
      const hybridResult = this.analyzeResults(
        textractResult,
        pdf417Result,
        preferredMethod,
        overallStartTime
      );

      console.log('✅ Hybrid scan complete');
      console.log(`📊 Selected method: ${hybridResult.selectedMethod}`);
      console.log(`📊 Overall confidence: ${hybridResult.overallConfidence}%`);

      return hybridResult;

    } catch (error) {
      console.error('❌ Hybrid scan failed:', error);
      throw error;
    }
  }

  /**
   * Run Textract scan
   */
  private async runTextractScan(
    imageBase64: string,
    onProgress?: (method: ScanMethod, progress: number) => void
  ): Promise<IndividualScanResult> {
    const startTime = performance.now();
    
    try {
      console.log('📄 Starting Textract scan...');
      onProgress?.('textract', 30);

      const result = await scanIDWithTextract(imageBase64);
      
      onProgress?.('textract', 100);
      const processingTime = performance.now() - startTime;

      console.log('✅ Textract scan complete');

      return {
        method: 'textract',
        success: true,
        confidence: result.confidence * 100,
        data: result,
        processingTime,
        rawResponse: result.rawResponse,
      };

    } catch (error) {
      console.error('❌ Textract scan failed:', error);
      
      const processingTime = performance.now() - startTime;
      
      return {
        method: 'textract',
        success: false,
        confidence: 0,
        data: {},
        processingTime,
        error: error instanceof Error ? error.message : 'Textract scan failed',
      };
    }
  }

  /**
   * Run PDF417 barcode scan
   */
  private async runPDF417Scan(
    imageBase64: string,
    onProgress?: (method: ScanMethod, progress: number) => void
  ): Promise<IndividualScanResult> {
    try {
      console.log('📊 Starting PDF417 scan...');
      onProgress?.('pdf417', 30);

      const result = await barcodeService.scanPDF417(imageBase64);
      
      onProgress?.('pdf417', 100);

      console.log('✅ PDF417 scan complete');

      return result;

    } catch (error) {
      console.error('❌ PDF417 scan failed:', error);
      
      return {
        method: 'pdf417',
        success: false,
        confidence: 0,
        data: {},
        processingTime: 0,
        error: error instanceof Error ? error.message : 'PDF417 scan failed',
      };
    }
  }

  /**
   * Analyze and compare results from both methods
   */
  private analyzeResults(
    textractResult: IndividualScanResult | undefined,
    pdf417Result: IndividualScanResult | undefined,
    preferredMethod: ScanMethod | undefined,
    overallStartTime: number
  ): HybridScanResult {
    
    const totalProcessingTime = performance.now() - overallStartTime;

    // Case 1: Both failed
    if (!textractResult?.success && !pdf417Result?.success) {
      console.warn('⚠️ Both scan methods failed');
      
      return {
        selectedMethod: 'textract',
        selectedData: {},
        overallConfidence: 0,
        textractResult,
        pdf417Result,
        totalProcessingTime,
        timestamp: new Date().toISOString(),
        comparisonDetails: {
          textractConfidence: 0,
          pdf417Confidence: 0,
          confidenceDifference: 0,
          recommendedMethod: 'textract',
        },
      };
    }

    // Case 2: Only Textract succeeded
    if (textractResult?.success && !pdf417Result?.success) {
      console.log('📄 Only Textract succeeded');
      
      const metrics = confidenceCalculator.calculateMetrics(textractResult);
      
      return {
        selectedMethod: 'textract',
        selectedData: textractResult.data,
        overallConfidence: metrics.overallConfidence,
        textractResult,
        pdf417Result,
        totalProcessingTime,
        timestamp: new Date().toISOString(),
        comparisonDetails: {
          textractConfidence: metrics.overallConfidence,
          pdf417Confidence: 0,
          confidenceDifference: metrics.overallConfidence,
          recommendedMethod: 'textract',
        },
      };
    }

    // Case 3: Only PDF417 succeeded
    if (pdf417Result?.success && !textractResult?.success) {
      console.log('📊 Only PDF417 succeeded');
      
      const metrics = confidenceCalculator.calculateMetrics(pdf417Result);
      
      return {
        selectedMethod: 'pdf417',
        selectedData: pdf417Result.data,
        overallConfidence: metrics.overallConfidence,
        textractResult,
        pdf417Result,
        totalProcessingTime,
        timestamp: new Date().toISOString(),
        comparisonDetails: {
          textractConfidence: 0,
          pdf417Confidence: metrics.overallConfidence,
          confidenceDifference: metrics.overallConfidence,
          recommendedMethod: 'pdf417',
        },
      };
    }

    // Case 4: Both succeeded - compare them
    if (textractResult?.success && pdf417Result?.success) {
      console.log('🔍 Both methods succeeded - comparing results...');

      const textractMetrics = confidenceCalculator.calculateMetrics(textractResult);
      const pdf417Metrics = confidenceCalculator.calculateMetrics(pdf417Result);

      const comparison = confidenceCalculator.compareScanResults(
        textractResult,
        pdf417Result
      );

      console.log(`📊 Comparison: ${comparison.recommendation}`);

      // Determine selected method
      let selectedMethod: ScanMethod;
      let selectedData: Record<string, any>;

      if (preferredMethod) {
        // Use preferred method if specified
        selectedMethod = preferredMethod;
        selectedData = preferredMethod === 'textract' 
          ? textractResult.data 
          : pdf417Result.data;
      } else {
        // Use the winner from comparison
        selectedMethod = comparison.winner;
        selectedData = comparison.winner === 'textract'
          ? textractResult.data
          : pdf417Result.data;
      }

      // Optionally merge data from both sources
      const mergedData = confidenceCalculator.mergeResults(
        textractResult,
        pdf417Result
      );

      return {
        selectedMethod,
        selectedData: mergedData, // Use merged data for best results
        overallConfidence: Math.max(
          textractMetrics.overallConfidence,
          pdf417Metrics.overallConfidence
        ),
        textractResult,
        pdf417Result,
        totalProcessingTime,
        timestamp: new Date().toISOString(),
        comparisonDetails: {
          textractConfidence: textractMetrics.overallConfidence,
          pdf417Confidence: pdf417Metrics.overallConfidence,
          confidenceDifference: comparison.confidenceDifference,
          recommendedMethod: comparison.winner,
        },
      };
    }

    // Fallback (should never reach here)
    throw new Error('Unexpected state in analyzeResults');
  }

  /**
   * Scan with preferred method only (no comparison)
   */
  async scanWithSingleMethod(
    imageBase64: string,
    method: ScanMethod
  ): Promise<IndividualScanResult> {
    if (method === 'pdf417' || method === 'barcode') {
      return await this.runPDF417Scan(imageBase64);
    } else {
      return await this.runTextractScan(imageBase64);
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    barcodeService.cleanup();
  }
}

// Export singleton instance
export const hybridScanService = new HybridScanService();