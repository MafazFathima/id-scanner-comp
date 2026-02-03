// src>service>textractService.ts
interface AWSConfig {
  region: string;
  service: string;
  accessKeyId: string;
  secretAccessKey: string;
  endpoint: string;
}

const AWS_CONFIG: AWSConfig = {
  region: 'us-east-1',
  service: 'textract',
  accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || '',
  secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || '', 
  endpoint: 'https://textract.us-east-1.amazonaws.com',
};

export interface IDScanResult {
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  fullName: string;
  dateOfBirth: string;
  sex?: string; 
  idNumber: string;
  idType: string;
  issueDate: string;
  expirationDate: string; 
  address: string;
  city: string;
  state: string;
  stateName: string;
  zipCode: string; 
  class?: string;
  restrictions?: string;
  endorsements?: string;
  height?: string;
  dd?: string;           // Document Discriminator
  rev?: string;
  eyeColor?: string;
  confidence: number;
  rawResponse?: any; 
}

export interface DualSideScanResult {
  frontData: IDScanResult;
  backData?: IDScanResult;
  combinedConfidence: number;
}

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hmacSha256(key: ArrayBuffer, message: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const msgBuffer = new TextEncoder().encode(message);
  return await crypto.subtle.sign('HMAC', cryptoKey, msgBuffer);
}

async function getSignatureKey(
  key: string,
  dateStamp: string,
  regionName: string,
  serviceName: string
): Promise<ArrayBuffer> {
  const kDate = await hmacSha256(
    new TextEncoder().encode('AWS4' + key),
    dateStamp
  );
  const kRegion = await hmacSha256(kDate, regionName);
  const kService = await hmacSha256(kRegion, serviceName);
  const kSigning = await hmacSha256(kService, 'aws4_request');
  return kSigning;
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function generateAWSHeaders(requestBody: string): Promise<Record<string, string>> {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);

  const method = 'POST';
  const canonicalUri = '/';
  const canonicalQuerystring = '';
  const host = `textract.${AWS_CONFIG.region}.amazonaws.com`;
  const amzTarget = 'Textract.AnalyzeID';
  const contentType = 'application/x-amz-json-1.1';
  const payloadHash = await sha256(requestBody);

  const canonicalHeaders =
    `content-type:${contentType}\n` +
    `host:${host}\n` +
    `x-amz-content-sha256:${payloadHash}\n` +
    `x-amz-date:${amzDate}\n` +
    `x-amz-target:${amzTarget}\n`;

  const signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date;x-amz-target';

  const canonicalRequest =
    method + '\n' +
    canonicalUri + '\n' +
    canonicalQuerystring + '\n' +
    canonicalHeaders + '\n' +
    signedHeaders + '\n' +
    payloadHash;

  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = `${dateStamp}/${AWS_CONFIG.region}/${AWS_CONFIG.service}/aws4_request`;
  const stringToSign =
    algorithm + '\n' +
    amzDate + '\n' +
    credentialScope + '\n' +
    await sha256(canonicalRequest);

  const signingKey = await getSignatureKey(
    AWS_CONFIG.secretAccessKey,
    dateStamp,
    AWS_CONFIG.region,
    AWS_CONFIG.service
  );
  const signatureBuffer = await hmacSha256(signingKey, stringToSign);
  const signature = bufferToHex(signatureBuffer);

  const authorizationHeader =
    `${algorithm} Credential=${AWS_CONFIG.accessKeyId}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return {
    'Content-Type': contentType,
    'X-Amz-Date': amzDate,
    'X-Amz-Target': amzTarget,
    'X-Amz-Content-Sha256': payloadHash,
    'Authorization': authorizationHeader,
  };
}

function parseDocumentFields(documentFields: any[], rawBlocks?: any[]): IDScanResult {
  // Enhanced logging: Show all detected fields
  console.log('📋 All detected fields from Textract:');
  documentFields.forEach((field, index) => {
    console.log(`  [${index}] Type: "${field.Type?.Text || 'N/A'}" | Value: "${field.ValueDetection?.Text || 'N/A'}" | Confidence: ${field.ValueDetection?.Confidence || 0}%`);
  });

  // Extract all raw text from blocks for fallback detection
  let allRawText = '';
  if (rawBlocks) {
    const textBlocks = rawBlocks.filter((block: any) => 
      block.BlockType === 'LINE' && block.Text
    );
    allRawText = textBlocks.map((block: any) => block.Text).join(' ');
    console.log('📝 All raw OCR text:', allRawText);
  }

  // Enhanced field getter with alternative names
  const getFieldValue = (fieldType: string, alternativeTypes: string[] = []): string => {
    // Try primary field type first
    let field = documentFields.find((f: any) => f.Type?.Text === fieldType);
    
    // Try alternatives if primary not found
    if (!field && alternativeTypes.length > 0) {
      for (const altType of alternativeTypes) {
        field = documentFields.find((f: any) => f.Type?.Text === altType);
        if (field) {
          console.log(`✅ Found ${fieldType} using alternative name: ${altType}`);
          break;
        }
      }
    }
    
    const value = field?.ValueDetection?.Text || '';
    
    if (value) {
      console.log(`🔍 ${fieldType}: "${value}" (confidence: ${field?.ValueDetection?.Confidence || 0}%)`);
    } else {
      console.log(`❌ ${fieldType}: NOT FOUND (tried: ${[fieldType, ...alternativeTypes].join(', ')})`);
    }
    
    return value;
  };

  const confidences = documentFields
    .map((f: any) => f.ValueDetection?.Confidence || 0)
    .filter((c: number) => c > 0);
  const avgConfidence =
    confidences.length > 0
      ? confidences.reduce((a: number, b: number) => a + b, 0) / confidences.length
      : 0;

  const firstName = getFieldValue('FIRST_NAME', ['GIVEN_NAME']);
  const middleName = getFieldValue('MIDDLE_NAME');
  const lastName = getFieldValue('LAST_NAME', ['FAMILY_NAME', 'SURNAME']);
  const suffix = getFieldValue('SUFFIX', ['NAME_SUFFIX']);
  const fullName = [firstName, middleName, lastName, suffix]
    .filter(Boolean)
    .join(' ');

  const streetAddress = getFieldValue('ADDRESS', ['STREET_ADDRESS']);
  const city = getFieldValue('CITY_IN_ADDRESS', ['CITY']);
  const state = getFieldValue('STATE_IN_ADDRESS', ['STATE_CODE', 'STATE']);
  const zipCode = getFieldValue('ZIP_CODE_IN_ADDRESS', ['ZIP_CODE', 'POSTAL_CODE']);
  const fullAddress = [
    streetAddress,
    city,
    state,
    zipCode
  ].filter(Boolean).join(', ');

  // Enhanced detection for commonly missing fields
  let sex = getFieldValue('SEX', ['GENDER', 'M/F', 'S']);
  let height = getFieldValue('HEIGHT', ['HGT', 'HT']);
  let eyeColor = getFieldValue('EYE_COLOR', ['EYES', 'EYE', 'EYES_COLOR']);

  // FALLBACK: Try to extract from raw text if structured fields not found
  if (!sex && allRawText) {
    // Look for SEX: M or SEX: F or just M/F patterns
    const sexMatch = allRawText.match(/\b(?:SEX|GENDER|S)[:\s]*([MF])\b/i);
    if (sexMatch) {
      sex = sexMatch[1].toUpperCase();
      console.log(`🔍 FALLBACK: Found SEX from raw text: "${sex}"`);
    }
  }

  if (!height && allRawText) {
    // Look for height in format: Hgt 5'-05" or HGT 5-11 or HEIGHT 5'11"
    // const heightMatch = allRawText.match(/(?:HGT|HEIGHT|HT)\s+(\d['\-]\d{2}"?)/i);
    // if (heightMatch) {
    //   height = heightMatch[1];
    //   console.log(`🔍 FALLBACK: Found HEIGHT from raw text: "${height}"`);
    const heightMatch = allRawText.match(/(?:HGT|HEIGHT|HT)[:\s]+(\d+['\s-]*\d+["']?)/i);
    if (heightMatch) {
      height = heightMatch[1].trim();
      console.log(`🔍 FALLBACK: Found HEIGHT from raw text: "${height}"`);
    }
  }

  if (!eyeColor && allRawText) {
    // Look for EYES: BRO or EYE: BLU etc
    const eyeMatch = allRawText.match(/\b(?:EYES?|EYE_COLOR)[:\s]*([A-Z]{3})\b/i);
    if (eyeMatch) {
      eyeColor = eyeMatch[1].toUpperCase();
      console.log(`🔍 FALLBACK: Found EYE_COLOR from raw text: "${eyeColor}"`);
    }
  }
   let dd: string | undefined;
  if (allRawText) {
    const ddMatch = allRawText.match(/\bDD\s+(\d{20,})/i);
    if (ddMatch) {
      dd = ddMatch[1].trim();
      console.log(`🔍 FALLBACK: Found DD (Document Discriminator) from raw text: "${dd}"`);
    }
  }

  // ✨ NEW: Extract REV (Revision Date) from raw text
  // Matches patterns like: REV 10 10/2016 or REV 10/10/2016
  let rev: string | undefined;
  if (allRawText) {
    const revMatch = allRawText.match(/\bREV\s+(\d{2}\s+\d{2}\/\d{4}|\d{2}\/\d{2}\/\d{4})/i);
    if (revMatch) {
      rev = revMatch[1].trim();
      console.log(`🔍 FALLBACK: Found REV (Revision Date) from raw text: "${rev}"`);
    }
  }

  let idType = getFieldValue('ID_TYPE', ['DOCUMENT_TYPE']);

  if (idType) {
    idType = idType
      .replace(/\s+FRONT$/i, '')   // Remove " FRONT" at the end
      .replace(/\s+BACK$/i, '')    // Remove " BACK" at the end
      .trim();                     // Remove extra whitespace
  }

  const result: IDScanResult = {
    firstName,
    middleName: middleName || undefined,
    lastName,
    suffix: suffix || undefined,
    fullName,
    dateOfBirth: getFieldValue('DATE_OF_BIRTH', ['DOB', 'BIRTH_DATE']),
    sex: sex || undefined,
    idNumber: getFieldValue('DOCUMENT_NUMBER', ['ID_NUMBER', 'DL_NUMBER', 'LICENSE_NUMBER']),
    idType,
    issueDate: getFieldValue('DATE_OF_ISSUE', ['ISSUE_DATE', 'ISS']),
    expirationDate: getFieldValue('EXPIRATION_DATE', ['EXP', 'EXP_DATE']),
    address: fullAddress,
    city,
    state,
    stateName: getFieldValue('STATE_NAME', ['STATE_FULL_NAME']),
    zipCode,
    class: getFieldValue('CLASS', ['LICENSE_CLASS', 'DL_CLASS']) || undefined,
    restrictions: getFieldValue('RESTRICTIONS', ['RSTR']) || undefined,
    endorsements: getFieldValue('ENDORSEMENTS', ['END', 'ENDORSE']) || undefined,
    height: height || undefined,
    eyeColor: eyeColor || undefined,
     dd: dd,
    rev: rev,
    confidence: avgConfidence / 100,
  };

  console.log('📊 Final parsed result:', {
    name: result.fullName,
    dob: result.dateOfBirth,
    sex: result.sex || 'NOT DETECTED',
    height: result.height || 'NOT DETECTED',
    eyeColor: result.eyeColor || 'NOT DETECTED',
    dd: result.dd || 'NOT DETECTED',
    rev: result.rev || 'NOT DETECTED',
    confidence: `${(result.confidence * 100).toFixed(1)}%`
  });

  return result;
}

function parseTextractResponse(response: any): DualSideScanResult {
  console.log('🔍 Parsing Textract response...');
  
  const identityDocuments = response.IdentityDocuments || [];
  console.log(`📄 Found ${identityDocuments.length} identity document(s)`);
  
  const frontDocument = identityDocuments[0];
  const backDocument = identityDocuments[1];

  console.log('\n========== FRONT SIDE ==========');
  const frontData: IDScanResult = frontDocument 
    ? {
        ...parseDocumentFields(
          frontDocument.IdentityDocumentFields || [], 
          frontDocument.Blocks || []
        ),
        rawResponse: frontDocument
      }
    : {
        firstName: '',
        lastName: '',
        fullName: '',
        dateOfBirth: '',
        idNumber: '',
        idType: '',
        issueDate: '',
        expirationDate: '',
        address: '',
        city: '',
        state: '',
        stateName: '',
        zipCode: '',
        height: undefined,          // ✨ ADDED
        eyeColor: undefined,        // ✨ ADDED
        dd: undefined,              // ✨ ADDED
        rev: undefined,  
        confidence: 0,
      };

  let backData: IDScanResult | undefined;
  if (backDocument) {
    console.log('\n========== BACK SIDE ==========');
    backData = {
      ...parseDocumentFields(
        backDocument.IdentityDocumentFields || [], 
        backDocument.Blocks || []
      ),
      rawResponse: backDocument
    };
  } else {
    console.log('\n========== BACK SIDE ==========');
    console.log('❌ No back side document found');
  }

  const confidences = [frontData.confidence];
  if (backData) {
    confidences.push(backData.confidence);
  }
  const combinedConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;

  console.log('\n========== SUMMARY ==========');
  console.log(`✅ Combined confidence: ${(combinedConfidence * 100).toFixed(1)}%`);
  console.log(`📊 Front confidence: ${(frontData.confidence * 100).toFixed(1)}%`);
  if (backData) {
    console.log(`📊 Back confidence: ${(backData.confidence * 100).toFixed(1)}%`);
  }

  return {
    frontData,
    backData,
    combinedConfidence,
  };
}

export async function scanIDWithTextract(images: string[]): Promise<DualSideScanResult> {
  if (!images || images.length === 0) {
    throw new Error('At least one image is required');
  }

  if (!AWS_CONFIG.secretAccessKey) {
    throw new Error(
      'AWS Secret Access Key is not configured. Please update AWS_CONFIG.secretAccessKey in textractService.ts'
    );
  }

  try {
    const documentPages = images.map(imageBase64 => {
      const base64Data = imageBase64.includes('base64,')
        ? imageBase64.split('base64,')[1]
        : imageBase64;
      
      return {
        Bytes: base64Data,
      };
    });

    const requestBody = JSON.stringify({
      DocumentPages: documentPages,
    });
    const headers = await generateAWSHeaders(requestBody);
    console.log(`📤 Calling AWS Textract with ${images.length} image(s)...`);
    
    const response = await fetch(AWS_CONFIG.endpoint, {
      method: 'POST',
      headers,
      body: requestBody,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Textract API error:', errorText);
      throw new Error(`Textract API error: ${response.status} - ${errorText}`);
    }

    const textractResponse = await response.json();
    console.log('✅ Textract response received');
    console.log('🔍 Full raw response:', JSON.stringify(textractResponse, null, 2));

    return parseTextractResponse(textractResponse);
  } catch (error) {
    console.error('❌ Error calling AWS Textract:', error);
    throw error;
  }
}

export async function scanSingleIDWithTextract(imageBase64: string): Promise<IDScanResult> {
  const result = await scanIDWithTextract([imageBase64]);
  return result.frontData;
}

export function isTextractConfigured(): boolean {
  return (
    AWS_CONFIG.secretAccessKey.length > 0 &&
    AWS_CONFIG.accessKeyId.length > 0
  );
}

export function configureTextract(config: Partial<AWSConfig>): void {
  Object.assign(AWS_CONFIG, config);
}