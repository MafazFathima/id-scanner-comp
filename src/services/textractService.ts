
// src>service>textractService.ts
/**
 * AWS Textract Service Integration
 * 
 * This module provides client-side integration with AWS Textract AnalyzeID API.
 * 
 * SECURITY WARNING: This implementation exposes AWS credentials in the browser.
 * This is acceptable for development/demo purposes but NOT recommended for production.
 * 
 * For production, use:
 * - AWS Cognito Identity Pools for temporary credentials
 * - Backend proxy server to handle AWS requests
 * - API Gateway with Lambda functions
 */

// AWS Configuration
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
  accessKeyId: 'AKIA3VTPFXMJZVQR5LFV',
  secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || '', 
  endpoint: 'https://textract.us-east-1.amazonaws.com',
};

/**
 * Parsed ID data structure
 */
export interface IDScanResult {
  // Personal Information
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  fullName: string;
  dateOfBirth: string;
  sex?: string;
  
  // Document Information
  idNumber: string;
  idType: string;
  issueDate: string;
  expirationDate: string;
  
  // Address Information
  address: string;
  city: string;
  state: string;
  stateName: string;
  zipCode: string;
  
  // License-specific fields
  class?: string;
  restrictions?: string;
  endorsements?: string;
  
  // Physical Description
  height?: string;
  eyeColor?: string;
  
  // Metadata
  confidence: number;
  rawResponse?: any; // Store raw Textract response
}

/**
 * AWS Signature V4 Helper Functions
 */

// Simple SHA256 hash implementation
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// HMAC SHA256
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

// Generate signing key
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

// Convert ArrayBuffer to hex string
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Generate AWS Signature V4 headers
 */
async function generateAWSHeaders(requestBody: string): Promise<Record<string, string>> {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);

  // Request parameters
  const method = 'POST';
  const canonicalUri = '/';
  const canonicalQuerystring = '';
  const host = `textract.${AWS_CONFIG.region}.amazonaws.com`;
  const amzTarget = 'Textract.AnalyzeID';
  const contentType = 'application/x-amz-json-1.1';

  // Hash the request body
  const payloadHash = await sha256(requestBody);

  // Create canonical headers
  const canonicalHeaders =
    `content-type:${contentType}\n` +
    `host:${host}\n` +
    `x-amz-content-sha256:${payloadHash}\n` +
    `x-amz-date:${amzDate}\n` +
    `x-amz-target:${amzTarget}\n`;

  const signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date;x-amz-target';

  // Create canonical request
  const canonicalRequest =
    method + '\n' +
    canonicalUri + '\n' +
    canonicalQuerystring + '\n' +
    canonicalHeaders + '\n' +
    signedHeaders + '\n' +
    payloadHash;

  // Create string to sign
  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = `${dateStamp}/${AWS_CONFIG.region}/${AWS_CONFIG.service}/aws4_request`;
  const stringToSign =
    algorithm + '\n' +
    amzDate + '\n' +
    credentialScope + '\n' +
    await sha256(canonicalRequest);

  // Calculate signature
  const signingKey = await getSignatureKey(
    AWS_CONFIG.secretAccessKey,
    dateStamp,
    AWS_CONFIG.region,
    AWS_CONFIG.service
  );
  const signatureBuffer = await hmacSha256(signingKey, stringToSign);
  const signature = bufferToHex(signatureBuffer);

  // Create authorization header
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

/**
 * Parse Textract AnalyzeID response
 */
function parseTextractResponse(response: any): IDScanResult {
  const fields = response.IdentityDocuments?.[0]?.IdentityDocumentFields || [];

  const getFieldValue = (fieldType: string): string => {
    const field = fields.find((f: any) => f.Type?.Text === fieldType);
    return field?.ValueDetection?.Text || '';
  };

  // Calculate average confidence
  const confidences = fields
    .map((f: any) => f.ValueDetection?.Confidence || 0)
    .filter((c: number) => c > 0);
  const avgConfidence =
    confidences.length > 0
      ? confidences.reduce((a: number, b: number) => a + b, 0) / confidences.length
      : 0;

  // Extract name fields
  const firstName = getFieldValue('FIRST_NAME');
  const middleName = getFieldValue('MIDDLE_NAME');
  const lastName = getFieldValue('LAST_NAME');
  const suffix = getFieldValue('SUFFIX');
  const fullName = [firstName, middleName, lastName, suffix]
    .filter(Boolean)
    .join(' ');

  // Extract address fields
  const streetAddress = getFieldValue('ADDRESS');
  const city = getFieldValue('CITY_IN_ADDRESS');
  const state = getFieldValue('STATE_IN_ADDRESS');
  const zipCode = getFieldValue('ZIP_CODE_IN_ADDRESS');
  const fullAddress = [
    streetAddress,
    city,
    state,
    zipCode
  ].filter(Boolean).join(', ');

  return {
    // Personal Information
    firstName,
    middleName: middleName || undefined,
    lastName,
    suffix: suffix || undefined,
    fullName,
    dateOfBirth: getFieldValue('DATE_OF_BIRTH'),
    sex: getFieldValue('SEX') || undefined,
    
    // Document Information
    idNumber: getFieldValue('DOCUMENT_NUMBER'),
    idType: getFieldValue('ID_TYPE'),
    issueDate: getFieldValue('DATE_OF_ISSUE'),
    expirationDate: getFieldValue('EXPIRATION_DATE'),
    
    // Address Information
    address: fullAddress,
    city,
    state,
    stateName: getFieldValue('STATE_NAME'),
    zipCode,
    
    // License-specific
    class: getFieldValue('CLASS') || undefined,
    restrictions: getFieldValue('RESTRICTIONS') || undefined,
    endorsements: getFieldValue('ENDORSEMENTS') || undefined,
    
    // Physical Description
    height: getFieldValue('HEIGHT') || undefined,
    eyeColor: getFieldValue('EYE_COLOR') || undefined,
    
    // Metadata
    confidence: avgConfidence / 100, // Convert to 0-1 scale
    rawResponse: response,
  };
}

/**
 * Main function to call AWS Textract AnalyzeID
 * 
 * @param imageBase64 - Base64 encoded image (with or without data URL prefix)
 * @returns Parsed ID scan result
 */
export async function scanIDWithTextract(imageBase64: string): Promise<IDScanResult> {
  // Validate AWS configuration
  if (!AWS_CONFIG.secretAccessKey) {
    throw new Error(
      'AWS Secret Access Key is not configured. Please update AWS_CONFIG.secretAccessKey in textractService.ts'
    );
  }

  try {
    // Remove data URL prefix if present
    const base64Data = imageBase64.includes('base64,')
      ? imageBase64.split('base64,')[1]
      : imageBase64;

    // Prepare request body
    const requestBody = JSON.stringify({
      DocumentPages: [
        {
          Bytes: base64Data,
        },
      ],
    });

    // Generate AWS Signature V4 headers
    const headers = await generateAWSHeaders(requestBody);

    console.log('Calling AWS Textract...');
    
    // Make API call
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
    console.log('Textract response:', textractResponse);

    // Parse and return result
    return parseTextractResponse(textractResponse);
  } catch (error) {
    console.error('Error calling AWS Textract:', error);
    throw error;
  }
}

/**
 * Check if AWS Textract is properly configured
 */
export function isTextractConfigured(): boolean {
  return (
    AWS_CONFIG.secretAccessKey.length > 0 &&
    AWS_CONFIG.accessKeyId.length > 0
  );
}

/**
 * Update AWS configuration (useful for runtime configuration)
 */
export function configureTextract(config: Partial<AWSConfig>): void {
  Object.assign(AWS_CONFIG, config);
}