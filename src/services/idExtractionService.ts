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

const ID_ASPECT_RATIO = 1.586; // ID-1 card ratio
const JPEG_UPLOAD_QUALITY = 0.99;

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image for preprocessing"));
    img.src = src;
  });
}

async function prepareImageForUpload(imageBase64: string): Promise<string> {
  const image = await loadImage(imageBase64);

  const srcWidth = image.naturalWidth || image.width;
  const srcHeight = image.naturalHeight || image.height;

  if (!srcWidth || !srcHeight) {
    throw new Error("Invalid image dimensions");
  }

  let cropX = 0;
  let cropY = 0;
  let cropWidth = srcWidth;
  let cropHeight = srcHeight;

  const sourceAspect = srcWidth / srcHeight;

  // Center-crop to ID card aspect ratio for consistent extraction input.
  if (sourceAspect > ID_ASPECT_RATIO) {
    cropWidth = Math.round(srcHeight * ID_ASPECT_RATIO);
    cropX = Math.round((srcWidth - cropWidth) / 2);
  } else if (sourceAspect < ID_ASPECT_RATIO) {
    cropHeight = Math.round(srcWidth / ID_ASPECT_RATIO);
    cropY = Math.round((srcHeight - cropHeight) / 2);
  }

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Failed to create canvas context");
  }

  canvas.width = Math.max(1, cropWidth);
  canvas.height = Math.max(1, cropHeight);

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(
    image,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    canvas.width,
    canvas.height,
  );

  const processedBase64 = canvas.toDataURL("image/jpeg", JPEG_UPLOAD_QUALITY);

  console.log("[ID-EXTRACT] Image preprocessing:", {
    sourceResolution: `${srcWidth}x${srcHeight}`,
    uploadResolution: `${canvas.width}x${canvas.height}`,
    sourceAspect: sourceAspect.toFixed(3),
    targetAspect: ID_ASPECT_RATIO,
    estimatedSizeKB: Math.round((processedBase64.length * 0.75) / 1024),
  });

  return processedBase64;
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
    const processedImage = await prepareImageForUpload(image);
    const blob = await fetch(processedImage).then((r) => r.blob());
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
