const ID_EXTRACTION_API_URL =
  import.meta.env.VITE_ID_EXTRACTION_API_URL || "http://127.0.0.1:8000/extract-barcode-batch";

type ExtractionMethod = "barcode" | "ocr" | "combined";

export interface IDScanResult {
  fullName?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  idNumber?: string;
  idType?: string;
  issueDate?: string;
  expirationDate?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  sex?: string;
  height?: string;
  eyeColor?: string;
  hairColor?: string;
  confidence: number;
  extractionMethod: ExtractionMethod;
  rawResponse?: unknown;
}

export interface DualSideScanResult {
  frontData: IDScanResult;
  backData?: IDScanResult;
  combinedConfidence: number;
}

interface ExtractionApiResponse {
  results?: any[];
  [key: string]: unknown;
}

function toIDScanResult(result: any): IDScanResult {
  const structured = result?.structuredData || {};
  const person = structured.person || {};
  const document = structured.document || {};
  const address = structured.address || {};
  const physical = structured.physicalAttributes || {};

  const firstName = person.firstName;
  const middleName = person.middleName;
  const lastName = person.lastName;
  const fullName = [firstName, middleName, lastName].filter(Boolean).join(" ") || undefined;

  const source = structured.sourcePriority;
  const extractionMethod: ExtractionMethod =
    source === "BARCODE" ? "barcode" : source === "OCR" ? "ocr" : "combined";

  return {
    firstName,
    middleName,
    lastName,
    fullName,
    idNumber: document.licenseNumber,
    idType: structured.idType,
    issueDate: document.issueDate,
    expirationDate: document.expiryDate,
    dateOfBirth: person.dob,
    address: address.street,
    city: address.city,
    state: address.state,
    zipCode: address.postalCode,
    sex: person.sex,
    height: physical.heightIn,
    eyeColor: physical.eyeColor,
    hairColor: physical.hairColor,
    confidence: 0.95,
    extractionMethod,
    rawResponse: result,
  };
}

export async function extractIDData(images: string[]): Promise<DualSideScanResult> {
  const uploadImages = images.filter(Boolean);

  if (!uploadImages.length) {
    throw new Error("No images provided");
  }

  const formData = new FormData();
  for (let i = 0; i < uploadImages.length; i++) {
    const image = uploadImages[i];
    const side = i === 0 ? "front" : "back";
    const blob = await fetch(image).then((r) => r.blob());
    formData.append("files", blob, `DL ${side}.jpg`);
  }

  const response = await fetch(ID_EXTRACTION_API_URL, {
    method: "POST",
    headers: { accept: "application/json" },
    body: formData,
  });

  const responseText = await response.text();
  let data: ExtractionApiResponse = {};

  try {
    data = responseText ? (JSON.parse(responseText) as ExtractionApiResponse) : {};
  } catch {
    console.log("[ID-EXTRACT] API raw response:", responseText);
  }

  console.log("[ID-EXTRACT] API response:", data);

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  const results = Array.isArray(data.results) ? data.results : [];
  const frontData = toIDScanResult(results[0] || {});
  const backData = results[1] ? toIDScanResult(results[1]) : undefined;

  return {
    frontData,
    backData,
    combinedConfidence: backData
      ? (frontData.confidence + backData.confidence) / 2
      : frontData.confidence,
  };
}

export async function scanIDWithTextract(images: string[]): Promise<DualSideScanResult> {
  return extractIDData(images);
}

export async function scanSingleIDWithTextract(imageBase64: string): Promise<IDScanResult> {
  const result = await extractIDData([imageBase64]);
  return result.frontData;
}
