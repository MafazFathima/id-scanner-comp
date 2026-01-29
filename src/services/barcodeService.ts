// src/services/barcodeService.ts - SIMPLIFIED & RELIABLE VERSION

import {
  BrowserMultiFormatReader,
  DecodeHintType,
  BarcodeFormat,
  NotFoundException,
  Result,
} from '@zxing/library';
import type { IndividualScanResult, PDF417Data } from '../types/scanResults';

/**
 * Simplified PDF417 Barcode Scanner
 * Uses the most reliable detection method only
 */
export class BarcodeService {
  private reader: BrowserMultiFormatReader | null = null;

  constructor() {
    // Initialize reader lazily
  }

  /**
   * Get or create reader instance
   */
  private getReader(): BrowserMultiFormatReader {
    if (!this.reader) {
      const hints = new Map();
      hints.set(DecodeHintType.TRY_HARDER, true);
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.PDF_417,
        BarcodeFormat.QR_CODE,
        BarcodeFormat.DATA_MATRIX,
        BarcodeFormat.AZTEC,
        BarcodeFormat.CODE_128,
        BarcodeFormat.CODE_39,
      ]);
      
      this.reader = new BrowserMultiFormatReader(hints);
    }
    
    return this.reader;
  }

  /**
   * Scan image for PDF417 barcode
   */
  async scanPDF417(imageBase64: string): Promise<IndividualScanResult> {
    const startTime = performance.now();

    try {
      console.log('🔍 Starting PDF417 barcode scan...');

      // Load image
      const img = await this.loadImage(imageBase64);
      console.log('✅ Image loaded:', img.width, 'x', img.height);

      if (img.width === 0 || img.height === 0) {
        throw new Error('Invalid image dimensions');
      }

      let result: Result | null = null;

      // Try multiple detection strategies with timeouts
      const strategies = [
        { name: 'Original', process: () => img },
        { name: 'Larger 2x', process: () => this.scaleImage(img, 2) },
        { name: 'Larger 3x', process: () => this.scaleImage(img, 3) },
        { name: 'High Contrast', process: () => this.processImage(img, 'contrast') },
        { name: 'Grayscale', process: () => this.processImage(img, 'grayscale') },
        { name: 'Sharpen', process: () => this.processImage(img, 'sharpen') },
        { name: 'Threshold', process: () => this.processImage(img, 'threshold') },
      ];

      for (const strategy of strategies) {
        console.log(`📊 Trying: ${strategy.name}...`);
        
        try {
          const processedImg = await Promise.race([
            strategy.process(),
            this.timeout(2000, `${strategy.name} processing timeout`)
          ]);

          result = await Promise.race([
            this.decode(processedImg),
            this.timeout(3000, `${strategy.name} decode timeout`)
          ]);

          if (result) {
            console.log(`✅ Success with: ${strategy.name}`);
            break;
          }
        } catch (e) {
          console.log(`⚠️ ${strategy.name} failed:`, (e as Error).message);
        }
      }

      if (!result) {
        throw new NotFoundException('No barcode detected after all strategies');
      }

      console.log('✅ Barcode detected!');
      console.log('📊 Format:', result.getBarcodeFormat());
      console.log('📊 Text:', result.getText());

      const parsedData = this.parsePDF417Data(result.getText());
      const confidence = this.calculateBarcodeConfidence(parsedData, result);
      const processingTime = performance.now() - startTime;

      return {
        method: 'pdf417',
        success: true,
        confidence,
        data: parsedData,
        processingTime,
        rawResponse: {
          text: result.getText(),
          format: result.getBarcodeFormat(),
          resultPoints: result.getResultPoints(),
        },
      };

    } catch (error) {
      const processingTime = performance.now() - startTime;
      console.error('❌ PDF417 scan failed:', error);

      return {
        method: 'pdf417',
        success: false,
        confidence: 0,
        data: {},
        processingTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Timeout helper
   */
  private timeout<T>(ms: number, message: string): Promise<T> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error(message)), ms)
    );
  }

  /**
   * Decode barcode from image
   */
  private async decode(img: HTMLImageElement): Promise<Result | null> {
    try {
      const reader = this.getReader();
      return await reader.decodeFromImageElement(img);
    } catch (error) {
      return null;
    }
  }

  /**
   * Load image from base64
   */
  private loadImage(base64: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      const timeout = setTimeout(() => reject(new Error('Image load timeout')), 5000);
      
      img.onload = () => {
        clearTimeout(timeout);
        
        if (img.width === 0 || img.height === 0) {
          reject(new Error('Image has zero dimensions'));
          return;
        }
        
        // Small delay to ensure image is fully decoded
        setTimeout(() => resolve(img), 100);
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Image load failed'));
      };
      
      img.src = base64.startsWith('data:') ? base64 : `data:image/jpeg;base64,${base64}`;
    });
  }

  /**
   * Scale image
   */
  private async scaleImage(img: HTMLImageElement, scale: number): Promise<HTMLImageElement> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Canvas context failed');

    canvas.width = img.width * scale;
    canvas.height = img.height * scale;

    // Use better scaling
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    return this.canvasToImage(canvas);
  }

  /**
   * Process image with different filters
   */
  private async processImage(
    img: HTMLImageElement,
    type: 'contrast' | 'grayscale' | 'sharpen' | 'threshold'
  ): Promise<HTMLImageElement> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Canvas context failed');

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
if (canvas.width === 0 || canvas.height === 0) {
  throw new Error('Canvas has zero dimensions');
}

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    if (canvas.width === 0 || canvas.height === 0) {
  throw new Error('Canvas has zero dimensions');
}

    const data = imageData.data;

    switch (type) {
      case 'contrast':
        this.applyContrast(data, 80);
        break;
      case 'grayscale':
        this.applyGrayscale(data);
        break;
      case 'sharpen':
        this.applySharpen(imageData);
        break;
      case 'threshold':
        this.applyThreshold(data, 128);
        break;
    }

    ctx.putImageData(imageData, 0, 0);
    return this.canvasToImage(canvas);
  }

  /**
   * Apply contrast
   */
  private applyContrast(data: Uint8ClampedArray, contrast: number): void {
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
      data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
      data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));
    }
  }

  /**
   * Apply grayscale
   */
  private applyGrayscale(data: Uint8ClampedArray): void {
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = data[i + 1] = data[i + 2] = avg;
    }
  }

  /**
   * Apply sharpening
   */
  private applySharpen(imageData: ImageData): void {
    const data = imageData.data;
    const w = imageData.width;
    const h = imageData.height;
    const copy = new Uint8ClampedArray(data);

    const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];

    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        for (let c = 0; c < 3; c++) {
          let sum = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const idx = ((y + ky) * w + (x + kx)) * 4 + c;
              const kIdx = (ky + 1) * 3 + (kx + 1);
              sum += copy[idx] * kernel[kIdx];
            }
          }
          const idx = (y * w + x) * 4 + c;
          data[idx] = Math.min(255, Math.max(0, sum));
        }
      }
    }
  }

  /**
   * Apply threshold (binary)
   */
  private applyThreshold(data: Uint8ClampedArray, threshold: number): void {
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      const val = avg > threshold ? 255 : 0;
      data[i] = data[i + 1] = data[i + 2] = val;
    }
  }

  /**
   * Convert canvas to image
   */
  private canvasToImage(canvas: HTMLCanvasElement): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const timeout = setTimeout(() => reject(new Error('Canvas conversion timeout')), 3000);
      
      img.onload = () => {
        clearTimeout(timeout);
        resolve(img);
      };
      img.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Canvas conversion failed'));
      };
      
      img.src = canvas.toDataURL('image/png');
    });
  }

  /**
   * Parse PDF417 data
   */
  private parsePDF417Data(rawText: string): PDF417Data {
    console.log('📋 Parsing PDF417 data...');
    console.log('📊 Raw text:', rawText.substring(0, 200));

    const data: PDF417Data = { rawText };

    try {
      if (rawText.includes('ANSI') || rawText.includes('@')) {
        console.log('✅ AAMVA format detected');
        this.parseAAMVAFormat(rawText, data);
      } else {
        console.log('ℹ️ Generic format');
        this.parseGenericFormat(rawText, data);
      }

      if (!data.fullName && (data.firstName || data.lastName)) {
        data.fullName = [data.firstName, data.middleName, data.lastName]
          .filter(Boolean)
          .join(' ');
      }

      console.log('✅ Parsed', Object.keys(data).length, 'fields');
    } catch (error) {
      console.error('⚠️ Parse error:', error);
    }

    return data;
  }

  /**
   * Parse AAMVA format
   */
  private parseAAMVAFormat(rawText: string, data: PDF417Data): void {
    const fieldMappings: Record<string, keyof PDF417Data> = {
      'DAC': 'firstName',
      'DAD': 'middleName',
      'DCS': 'lastName',
      'DAQ': 'idNumber',
      'DBB': 'dateOfBirth',
      'DBA': 'expirationDate',
      'DBD': 'issueDate',
      'DAG': 'address',
      'DAI': 'city',
      'DAJ': 'state',
      'DAK': 'zipCode',
      'DBC': 'sex',
      'DAY': 'eyeColor',
      'DAU': 'height',
      'DAW': 'weight',
      'DCA': 'vehicleClass',
      'DCB': 'restrictions',
      'DCD': 'endorsements',
    };

    const lines = rawText.split(/[\n\r]+/);
    
    for (const line of lines) {
      for (const [code, field] of Object.entries(fieldMappings)) {
        if (line.startsWith(code)) {
          const value = line.substring(3).trim();
          if (value) {
            data[field] = value;
          }
        }
      }
    }

    // Regex fallback
    for (const [code, field] of Object.entries(fieldMappings)) {
      if (!data[field]) {
        const regex = new RegExp(`${code}([^\\n\\r]*?)(?=D[A-Z]{2}|$)`, 'i');
        const match = rawText.match(regex);
        if (match?.[1]) {
          data[field] = match[1].trim();
        }
      }
    }
  }

  /**
   * Parse generic format
   */
  private parseGenericFormat(rawText: string, data: PDF417Data): void {
    const patterns = {
      dateOfBirth: /(?:DOB|Birth)[\s:]*(\d{2}[-\/]\d{2}[-\/]\d{4})/i,
      expirationDate: /(?:EXP|Expires)[\s:]*(\d{2}[-\/]\d{2}[-\/]\d{4})/i,
      idNumber: /(?:ID|DL|License)[\s:#]*([A-Z0-9]{6,})/i,
    };

    for (const [key, pattern] of Object.entries(patterns)) {
      const match = rawText.match(pattern);
      if (match?.[1]) {
        data[key as keyof PDF417Data] = match[1];
      }
    }
  }

  /**
   * Calculate confidence
   */
  private calculateBarcodeConfidence(data: PDF417Data, result: Result): number {
    let confidence = 70;

    const criticalFields = ['firstName', 'lastName', 'idNumber', 'dateOfBirth'];
    const filled = criticalFields.filter(f => data[f as keyof PDF417Data]);
    
    confidence += (filled.length / criticalFields.length) * 20;

    if (data.rawText?.includes('ANSI')) confidence += 5;

    const total = Object.keys(data).filter(k => k !== 'rawText' && data[k as keyof PDF417Data]).length;
    if (total > 10) confidence += 5;

    return Math.min(100, Math.round(confidence));
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    try {
      if (this.reader) {
        this.reader.reset();
        this.reader = null;
      }
      console.log('✅ Barcode service cleaned up');
    } catch (error) {
      console.error('⚠️ Cleanup error:', error);
    }
  }
}

// Export singleton
export const barcodeService = new BarcodeService();