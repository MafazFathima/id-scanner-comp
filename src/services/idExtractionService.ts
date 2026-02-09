// src/services/idExtractionService.ts
const ID_EXTRACTION_API_URL = import.meta.env.VITE_ID_EXTRACTION_API_URL || 'http://127.0.0.1:8000/extract-barcode-batch';

export interface IDExtractionResult {
  filename: string;
  barcodeData: {
    detected: boolean;
    type?: string;
    confidence?: string;
    raw?: string;
    person?: any;
    document?: any;
    address?: any;
  };
  ocrData: {
    detected: boolean;
    front?: any;
    back?: any;
  };
  structuredData: {
    idType?: string;
    sourcePriority?: 'BARCODE' | 'OCR' | 'COMBINED';
    person?: {
      firstName?: string;
      middleName?: string;
      lastName?: string;
      dob?: string;
      sex?: string;
    };
    document?: {
      licenseNumber?: string;
      issueDate?: string;
      expiryDate?: string;
      issuerCountry?: string;
      auditNumber?: string;
      documentDiscriminator?: string;
      cardRevisionDate?: string;
    };
    address?: {
      street?: string;
      city?: string;
      state?: string;
      postalCode?: string;
    };
    physicalAttributes?: {
      eyeColor?: string;
      hairColor?: string;
      heightIn?: string;
      weightLb?: string;
    };
    meta?: {
      isExpired?: boolean;
      expiryDate?: string;
      confidence?: 'HIGH' | 'MEDIUM' | 'LOW';
    };
  };
}

export interface IDExtractionAPIResponse {
  success: boolean;
  totalFiles: number;
  results: IDExtractionResult[];
}

export interface IDScanResult {
  fullName?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  suffix?: string;
  idNumber?: string;
  idType?: string;
  issueDate?: string;
  expirationDate?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  state?: string;
  stateName?: string;
  zipCode?: string;
  sex?: string;
  height?: string;
  eyeColor?: string;
  hairColor?: string;
  confidence: number;
  extractionMethod: 'barcode' | 'ocr' | 'combined';
  rawResponse?: IDExtractionResult;
}

export interface DualSideScanResult {
  frontData: IDScanResult;
  backData?: IDScanResult;
  combinedConfidence: number;
}

async function verifyBlob(blob: Blob, label: string): Promise<boolean> {
  console.log(`🔍 Verifying ${label} blob...`);
  
  if (blob.size === 0) {
    console.error(`❌ ${label}: Blob is empty!`);
    return false;
  }
  
  if (!blob.type.startsWith('image/')) {
    console.error(`❌ ${label}: Invalid MIME type: ${blob.type}`);
    return false;
  }
  
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    
    img.onload = () => {
      console.log(`✅ ${label}: Valid image ${img.width}x${img.height}`);
      URL.revokeObjectURL(url);
      resolve(true);
    };
    
    img.onerror = () => {
      console.error(`❌ ${label}: Corrupted - failed to load as image`);
      URL.revokeObjectURL(url);
      resolve(false);
    };
    
    img.src = url;
  });
}

export async function extractIDData(
  images: string[]
): Promise<DualSideScanResult> {
  console.log('🚀 [ID-EXTRACT] Starting extraction for', images.length, 'image(s)...');
  console.log('🔍 [ID-EXTRACT] === IMAGE VERIFICATION START ===');
  
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const side = i === 0 ? 'FRONT' : 'BACK';
    
    console.log(`📸 [ID-EXTRACT] ${side} image analysis:`, {
      totalLength: img.length,
      hasDataPrefix: img.startsWith('data:image'),
      mimeType: img.split(',')[0],
      base64Length: img.split(',')[1]?.length || 0,
      estimatedSizeKB: Math.round((img.split(',')[1]?.length || 0) * 0.75 / 1024),
      firstChars: img.substring(0, 60),
      isValidBase64: /^data:image\/(jpeg|png|jpg);base64,/.test(img)
    });

    try {
      await new Promise<void>((resolve, reject) => {
        const testImage = new Image();
        testImage.onload = () => {
          console.log(`✅ [ID-EXTRACT] ${side} image loads successfully:`, {
            width: testImage.width,
            height: testImage.height,
            aspectRatio: (testImage.width / testImage.height).toFixed(2)
          });
          resolve();
        };
        testImage.onerror = (err) => {
          console.error(`❌ [ID-EXTRACT] ${side} image failed to load!`, err);
          reject(err);
        };
        testImage.src = img;
      });
    } catch (err) {
      console.error(`❌ [ID-EXTRACT] ${side} image is corrupted or invalid!`);
    }
  }
  console.log('🔍 [ID-EXTRACT] === IMAGE VERIFICATION END ===');
  
  try {
    const formData = new FormData();
    
    for (let i = 0; i < images.length; i++) {
      const imageBase64 = images[i];
      
      let base64Data = imageBase64;
      let mimeType = 'image/jpeg';

      const mimeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
      if (mimeMatch) {
        mimeType = mimeMatch[1];
      }

      const commaIndex = imageBase64.indexOf(',');
      if (commaIndex !== -1) {
        base64Data = imageBase64.substring(commaIndex + 1);
      }

      base64Data = base64Data.replace(/\s/g, '');

      console.log('[DEBUG] Original base64 length:', base64Data.length);
      console.log('[DEBUG] Expected blob size:', Math.ceil(base64Data.length * 0.75));

      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let j = 0; j < byteCharacters.length; j++) {
        byteNumbers[j] = byteCharacters.charCodeAt(j);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });

      console.log('[DEBUG] Blob created → size:', blob.size, 'type:', blob.type);

      const side = i === 0 ? 'front' : 'back';

      console.log(`[${side.toUpperCase()}] Blob check:`, {
        size: blob.size,
        type: blob.type,
        expectedSize: Math.ceil(base64Data.length * 0.75),
        sizeMatch: Math.abs(blob.size - (base64Data.length * 0.75)) < 1000
      });

      const isValid = await verifyBlob(blob, side.toUpperCase());
      if (!isValid) {
        throw new Error(`${side} image blob is corrupted!`);
      }

      const extension = mimeType.split('/')[1] || 'jpg';
      formData.append('files', blob, `${side}.${extension}`);
      
      console.log(`📸 [ID-EXTRACT] Added ${side} image: ${blob.size} bytes`);
    }

    console.log(`📤 [ID-EXTRACT] Calling ${ID_EXTRACTION_API_URL}...`);
    
    const response = await fetch(ID_EXTRACTION_API_URL, {
      method: 'POST',
      body: formData,
    });

    console.log(`📬 [ID-EXTRACT] Response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [ID-EXTRACT] API error:', errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }
    
    const data: IDExtractionAPIResponse = await response.json();

    console.log('📦 [ID-EXTRACT] Response:', {
      success: data.success,
      totalFiles: data.totalFiles,
      resultsCount: data.results?.length || 0
    });

    console.log('🔍 [ID-EXTRACT] === BACKEND RESPONSE ANALYSIS ===');
    data.results?.forEach((result, index) => {
      const side = index === 0 ? 'FRONT' : 'BACK';
      console.log(`📋 [${side}] Detection status:`, {
        filename: result.filename,
        barcodeDetected: result.barcodeData?.detected,
        ocrDetected: result.ocrData?.detected,
        hasOcrData: !!(result.ocrData?.front && Object.keys(result.ocrData.front).length > 0),
        hasStructuredData: !!result.structuredData,
        sourcePriority: result.structuredData?.sourcePriority,
        confidence: result.structuredData?.meta?.confidence
      });

      if (result.ocrData) {
        console.log(`📝 [${side}] OCR data content:`, {
          frontKeys: Object.keys(result.ocrData.front || {}),
          backKeys: Object.keys(result.ocrData.back || {}),
          frontEmpty: !result.ocrData.front || Object.keys(result.ocrData.front).length === 0,
          backEmpty: !result.ocrData.back || Object.keys(result.ocrData.back).length === 0
        });
      }

      if (result.structuredData) {
        console.log(`📊 [${side}] Structured data:`, {
          hasPerson: !!result.structuredData.person,
          hasDocument: !!result.structuredData.document,
          hasAddress: !!result.structuredData.address,
          personFields: result.structuredData.person ? Object.keys(result.structuredData.person) : [],
          documentFields: result.structuredData.document ? Object.keys(result.structuredData.document) : [],
          addressFields: result.structuredData.address ? Object.keys(result.structuredData.address) : []
        });
      }
    });
    console.log('🔍 [ID-EXTRACT] === BACKEND RESPONSE ANALYSIS END ===');
    
    console.log('📦 [ID-EXTRACT] Full response:', JSON.stringify(data, null, 2));

    if (!data.success || !data.results?.length) {
      throw new Error('No results returned from extraction API');
    }

    const frontResult = data.results[0];
    const frontData = parseExtractionResult(frontResult, 'front');
    
    console.log(`✅ [ID-EXTRACT] Front processed: ${frontData.extractionMethod.toUpperCase()} • ${(frontData.confidence * 100).toFixed(1)}%`);

    let backData: IDScanResult | undefined;
    if (data.results.length > 1) {
      const backResult = data.results[1];
      backData = parseExtractionResult(backResult, 'back');
      console.log(`✅ [ID-EXTRACT] Back processed: ${backData.extractionMethod.toUpperCase()} • ${(backData.confidence * 100).toFixed(1)}%`);
    }

    const combinedConfidence = backData
      ? (frontData.confidence + backData.confidence) / 2
      : frontData.confidence;

    console.log(`✅ [ID-EXTRACT] Complete! Combined confidence: ${(combinedConfidence * 100).toFixed(1)}%`);

    return {
      frontData,
      backData,
      combinedConfidence,
    };

  } catch (error) {
    console.error('❌ [ID-EXTRACT] Extraction failed:', error);
    throw error;
  }
}

function parseExtractionResult(
  result: IDExtractionResult,
  side: 'front' | 'back'
): IDScanResult {
  
  const structured = result.structuredData;
  
  if (!structured) {
    throw new Error(`No structured data available for ${side} side`);
  }

  const sourcePriority = structured.sourcePriority || 'COMBINED';
  const extractionMethod = sourcePriority === 'BARCODE' ? 'barcode' : 
                          sourcePriority === 'OCR' ? 'ocr' : 'combined';

  const confidenceMap: Record<string, number> = {
    'HIGH': 0.95,
    'MEDIUM': 0.75,
    'LOW': 0.50
  };
  const confidence = confidenceMap[structured.meta?.confidence || 'HIGH'] || 0.95;

  console.log(`📋 [ID-EXTRACT] ${side.toUpperCase()}: Parsing structured data...`);
  console.log(`📋 [ID-EXTRACT] ${side.toUpperCase()}: source=${extractionMethod}, confidence=${structured.meta?.confidence}`);
  console.log(`📋 [ID-EXTRACT] ${side.toUpperCase()}: Raw structured data:`, structured);

  // Extract person data
  const firstName = structured.person?.firstName;
  const middleName = structured.person?.middleName;
  const lastName = structured.person?.lastName;
  const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ');

  console.log(`📋 [ID-EXTRACT] ${side.toUpperCase()}: Extracted name parts:`, {
    firstName,
    middleName,
    lastName,
    fullName
  });

  return {
    firstName,
    middleName,
    lastName,
    fullName,

    idNumber: structured.document?.licenseNumber,
    idType: structured.idType === 'DRIVER_LICENSE' ? "Driver's License" : 
            structured.idType === 'UNKNOWN' ? 'Unknown' : structured.idType,
    issueDate: structured.document?.issueDate,
    expirationDate: structured.document?.expiryDate,
    dateOfBirth: structured.person?.dob,
    
    address: structured.address?.street,
    city: structured.address?.city,
    state: structured.address?.state,
    stateName: getStateName(structured.address?.state),
    zipCode: structured.address?.postalCode,
    
    sex: formatSex(structured.person?.sex),
    height: formatHeight(structured.physicalAttributes?.heightIn),
    eyeColor: formatEyeColor(structured.physicalAttributes?.eyeColor),
    hairColor: formatHairColor(structured.physicalAttributes?.hairColor),
    
    confidence,
    extractionMethod,
    rawResponse: result,
  };
}

function formatSex(sex?: string): string | undefined {
  if (!sex) return undefined;
  return { '1': 'M', '2': 'F', 'M': 'M', 'F': 'F' }[sex] || sex;
}

function formatHeight(heightIn?: string): string | undefined {
  if (!heightIn) return undefined;
  const inches = parseInt(heightIn, 10);
  if (isNaN(inches)) return heightIn;
  const feet = Math.floor(inches / 12);
  const remainingInches = inches % 12;
  return `${feet}'${remainingInches}"`;
}

function formatEyeColor(color?: string): string | undefined {
  if (!color) return undefined;
  const map: Record<string, string> = {
    'BLK': 'Black', 'BLU': 'Blue', 'BRO': 'Brown', 'GRY': 'Gray',
    'GRN': 'Green', 'HAZ': 'Hazel', 'MAR': 'Maroon', 'PNK': 'Pink', 'DIC': 'Dichromatic'
  };
  return map[color] || color;
}

function formatHairColor(color?: string): string | undefined {
  if (!color) return undefined;
  const map: Record<string, string> = {
    'BAL': 'Bald', 'BLK': 'Black', 'BLN': 'Blond', 'BRO': 'Brown',
    'GRY': 'Gray', 'RED': 'Red', 'SDY': 'Sandy', 'WHI': 'White'
  };
  return map[color] || color;
}

function getStateName(stateCode?: string): string | undefined {
  if (!stateCode) return undefined;
  const states: Record<string, string> = {
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
    'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
    'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
    'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
    'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
    'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire',
    'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina',
    'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania',
    'RI': 'Rhode Island', 'SC': 'South Carolina', 'SD': 'South Dakota', 'TN': 'Tennessee',
    'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington',
    'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming', 'DC': 'District of Columbia'
  };
  return states[stateCode.toUpperCase()] || stateCode;
}

export async function scanIDWithTextract(images: string[]): Promise<DualSideScanResult> {
  return extractIDData(images);
}

export async function scanSingleIDWithTextract(imageBase64: string): Promise<IDScanResult> {
  const result = await extractIDData([imageBase64]);
  return result.frontData;
}