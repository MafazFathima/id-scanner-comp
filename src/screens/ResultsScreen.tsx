// src/screens/ResultsScreen.tsx - FIXED VERSION
import React, { useState } from 'react';
import { NavigationBar } from '../components/NavigationBar';
import { Button } from '../components/Button';
import { CheckCircle, Copy, Download, Zap, TrendingUp, User, Calendar, MapPin, Hash, FileText } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { useIsDesktop } from '../hooks/useMediaQuery';
import { Header } from '../components/Header';
import type { HybridScanResult } from '../types/scanResults';

interface ResultsScreenProps {
  scanData?: any;
  capturedImages?: {
    front?: string;
    back?: string;
  };
  onBack: () => void;
  onNewScan: () => void;
}

const FIELD_LABELS: Record<string, string> = {
  fullName: "Full Name",
  firstName: "First Name",
  middleName: "Middle Name",
  lastName: "Last Name",
  idNumber: "ID Number",
  idType: "Document Type",
  issueDate: "Issue Date",
  expirationDate: "Expiration Date",
  dateOfBirth: "Date of Birth",
  address: "Address",
  city: "City",
  state: "State",
  stateName: "Issuing State",
  zipCode: "ZIP Code",
  endorsements: "Endorsements",
  restrictions: "Restrictions",
  sex: "Sex",
  height: "Height",
  eyeColor: "Eye Color",
  vehicleClass: "Vehicle Class",
  weight: "Weight",
  suffix: "Suffix",
};

const FIELD_ICONS: Record<string, React.ReactNode> = {
  fullName: <User size={20} color="var(--color-primary)" />,
  firstName: <User size={20} color="var(--color-primary)" />,
  middleName: <User size={20} color="var(--color-primary)" />,
  lastName: <User size={20} color="var(--color-primary)" />,
  idNumber: <Hash size={20} color="var(--color-primary)" />,
  dateOfBirth: <Calendar size={20} color="var(--color-primary)" />,
  expirationDate: <Calendar size={20} color="var(--color-primary)" />,
  issueDate: <Calendar size={20} color="var(--color-primary)" />,
  address: <MapPin size={20} color="var(--color-primary)" />,
  city: <MapPin size={20} color="var(--color-primary)" />,
  state: <MapPin size={20} color="var(--color-primary)" />,
  zipCode: <MapPin size={20} color="var(--color-primary)" />,
};

export function ResultsScreen({ scanData, capturedImages, onBack, onNewScan }: ResultsScreenProps) {
  if (!scanData) {
    return (
      <div style={{ padding: 24 }}>
        <h2>⚠️ No scan data available</h2>
        <Button onClick={onNewScan}>Scan Again</Button>
      </div>
    );
  }

  // CRITICAL FIX: Extract hybrid results correctly
  const frontHybridResult: HybridScanResult = scanData.frontData || scanData;
  const backHybridResult: HybridScanResult | undefined = scanData.backData;

  // CRITICAL FIX: Merge data more intelligently
  const mergedData = {
    ...frontHybridResult.selectedData,
    ...Object.fromEntries(
      Object.entries(backHybridResult?.selectedData || {}).filter(
        ([key, value]) => value !== '' && value !== undefined && value !== null
      )
    ),
  };

  console.log('🔍 ResultsScreen - Front data:', frontHybridResult);
  console.log('🔍 ResultsScreen - Back data:', backHybridResult);
  console.log('🔍 ResultsScreen - Merged data:', mergedData);

  const isDesktop = useIsDesktop();

  return isDesktop ? (
    <ResultsScreenDesktop 
      frontHybridResult={frontHybridResult}
      backHybridResult={backHybridResult}
      mergedData={mergedData}
      capturedImages={capturedImages || {}} 
      onBack={onBack} 
      onNewScan={onNewScan}
      hasBothSides={!!(capturedImages?.front && capturedImages?.back)}
    />
  ) : (
    <ResultsScreenMobile 
      frontHybridResult={frontHybridResult}
      backHybridResult={backHybridResult}
      mergedData={mergedData}
      capturedImages={capturedImages || {}} 
      onBack={onBack} 
      onNewScan={onNewScan}
      hasBothSides={!!(capturedImages?.front && capturedImages?.back)}
    />
  );
}

interface ResultsScreenInternalProps {
  frontHybridResult: HybridScanResult;
  backHybridResult?: HybridScanResult;
  mergedData: Record<string, any>;
  capturedImages: { front?: string; back?: string };
  onBack: () => void;
  onNewScan: () => void;
  hasBothSides: boolean;
}

function ResultsScreenMobile({ 
  frontHybridResult,
  backHybridResult,
  mergedData,
  capturedImages, 
  onBack, 
  onNewScan,
  hasBothSides 
}: ResultsScreenInternalProps) {
  const [selectedSide, setSelectedSide] = useState<'front' | 'back'>('front');
  
  // CRITICAL FIX: Show results from correct side
  const displayedResult = selectedSide === 'front' ? frontHybridResult : backHybridResult;
  
  const handleCopy = () => {
    const textData = Object.entries(mergedData)
      .filter(([key, value]) => value !== undefined && key !== 'rawResponse' && key !== 'confidence' && key !== 'rawText')
      .map(([key, value]) => `${FIELD_LABELS[key] || key}: ${value}`)
      .join('\n');

    navigator.clipboard.writeText(textData);
    alert('Data copied to clipboard');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-background)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <NavigationBar title="Scan Results" onBack={onBack} />

      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: 'var(--spacing-lg)',
        gap: 'var(--spacing-lg)',
      }}>

        {/* Success Card with Hybrid Info */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--spacing-md)',
          padding: 'var(--spacing-lg)',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#10b98115',
          }}>
            <CheckCircle size={40} color="var(--color-success)" />
          </div>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--spacing-xs)',
          }}>
            <h2 style={{ margin: 0 }}>Scan Successful</h2>
            
            {/* CRITICAL FIX: Show overall confidence from merged data */}
            <StatusBadge 
              text={`${frontHybridResult.overallConfidence}% Confidence`} 
              type={frontHybridResult.overallConfidence >= 90 ? 'success' : 'warning'} 
            />
            
            {/* Hybrid scan method indicator */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: 'rgba(251, 191, 36, 0.1)',
              borderRadius: 'var(--radius-sm)',
              marginTop: '8px',
            }}>
              <Zap size={14} color="#f59e0b" />
              <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 600 }}>
                Hybrid AI: {frontHybridResult.selectedMethod.toUpperCase()}
              </span>
            </div>

            {hasBothSides && (
              <span className="caption" style={{ color: 'var(--color-text-secondary)', marginTop: '8px' }}>
                ✓ Front & Back sides scanned
              </span>
            )}
          </div>

          {/* CRITICAL FIX: Show comparison for selected side */}
          {displayedResult && (
            <div style={{
              width: '100%',
              padding: 'var(--spacing-sm)',
              backgroundColor: 'rgba(59, 130, 246, 0.05)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
            }}>
              <div style={{
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '8px',
                color: 'var(--color-text)',
                textAlign: 'center',
              }}>
                {selectedSide.toUpperCase()} Side Scan Comparison
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '13px',
                marginBottom: '8px',
              }}>
                <span>📄 OCR (Textract):</span>
                <strong>{displayedResult.comparisonDetails.textractConfidence}%</strong>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '13px',
              }}>
                <span>📊 Barcode (PDF417):</span>
                <strong>{displayedResult.comparisonDetails.pdf417Confidence}%</strong>
              </div>
              <div style={{
                marginTop: '8px',
                paddingTop: '8px',
                borderTop: '1px solid rgba(59, 130, 246, 0.2)',
                fontSize: '12px',
                color: 'var(--color-text-secondary)',
                textAlign: 'center',
              }}>
                <TrendingUp size={12} style={{ marginRight: '4px' }} />
                Best: {displayedResult.comparisonDetails.recommendedMethod.toUpperCase()}
              </div>
            </div>
          )}

          {/* Image switcher */}
          {hasBothSides && (
            <>
              <div style={{
                display: 'flex',
                gap: 'var(--spacing-xs)',
                marginTop: 'var(--spacing-sm)',
              }}>
                <Button
                  variant={selectedSide === 'front' ? 'primary' : 'secondary'}
                  onClick={() => setSelectedSide('front')}
                  style={{ fontSize: '14px', padding: '8px 16px' }}
                >
                  Front
                </Button>
                <Button
                  variant={selectedSide === 'back' ? 'primary' : 'secondary'}
                  onClick={() => setSelectedSide('back')}
                  style={{ fontSize: '14px', padding: '8px 16px' }}
                >
                  Back
                </Button>
              </div>

              {capturedImages[selectedSide] && (
                <img 
                  src={capturedImages[selectedSide]} 
                  alt={`${selectedSide} side`} 
                  style={{
                    width: '100%',
                    maxWidth: '400px',
                    borderRadius: 'var(--radius-lg)',
                    border: '2px solid var(--color-border)',
                    marginTop: 'var(--spacing-sm)',
                  }} 
                />
              )}
            </>
          )}

          {!hasBothSides && capturedImages.front && (
            <img 
              src={capturedImages.front} 
              alt="Scanned document" 
              style={{
                width: '100%',
                maxWidth: '400px',
                borderRadius: 'var(--radius-lg)',
                border: '2px solid var(--color-border)',
                marginTop: 'var(--spacing-sm)',
              }} 
            />
          )}
        </div>

        {/* Extracted Information */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-sm)',
        }}>
          <h2 style={{ margin: 0 }}>Extracted Information</h2>

          {Object.entries(mergedData)
            .filter(([key, value]) => 
              value !== undefined && 
              value !== null &&
              value !== '' &&
              key !== 'rawResponse' && 
              key !== 'confidence' && 
              key !== 'rawText' &&
              !key.startsWith('_')
            )
            .map(([key, value]) => (
              <DataField
                key={key}
                icon={FIELD_ICONS[key] || <User size={20} color="var(--color-primary)" />}
                label={FIELD_LABELS[key] || key}
                value={String(value)}
              />
            ))
          }

          {/* Show message if no data */}
          {Object.keys(mergedData).filter(k => 
            mergedData[k] && k !== 'rawText' && k !== 'rawResponse'
          ).length === 0 && (
            <div style={{
              padding: 'var(--spacing-lg)',
              textAlign: 'center',
              color: 'var(--color-text-secondary)',
            }}>
              No data extracted from scan
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-sm)',
          marginTop: 'auto',
        }}>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
            <Button variant="secondary" fullWidth icon={<Copy size={20} />} onClick={handleCopy}>
              Copy
            </Button>
            <Button variant="secondary" fullWidth icon={<Download size={20} />}>
              Export
            </Button>
          </div>
          <Button variant="primary" fullWidth onClick={onNewScan}>
            Scan Another ID
          </Button>
        </div>
      </main>
    </div>
  );
}

function ResultsScreenDesktop({ 
  frontHybridResult,
  backHybridResult,
  mergedData,
  capturedImages, 
  onBack, 
  onNewScan,
  hasBothSides 
}: ResultsScreenInternalProps) {
  const [selectedSide, setSelectedSide] = useState<'front' | 'back'>('front');
  const displayedResult = selectedSide === 'front' ? frontHybridResult : backHybridResult;

  const handleCopy = () => {
    const textData = Object.entries(mergedData)
      .filter(([key, value]) => value !== undefined && key !== 'rawResponse' && key !== 'confidence' && key !== 'rawText')
      .map(([key, value]) => `${FIELD_LABELS[key] || key}: ${value}`)
      .join('\n');

    navigator.clipboard.writeText(textData);
    alert('Data copied to clipboard');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-background)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Header title="Universal ID Scanner" showMenu={false} />

      <main style={{
        flex: 1,
        display: 'flex',
        gap: 'var(--spacing-2xl)',
        padding: 'var(--spacing-2xl)',
        maxWidth: '1400px',
        width: '100%',
        margin: '0 auto',
      }}>

        {/* Left Column */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--spacing-lg)',
            padding: 'var(--spacing-2xl)',
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-border)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#10b98115',
            }}>
              <CheckCircle size={48} color="var(--color-success)" />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
              <h1 style={{ margin: 0 }}>Scan Successful</h1>
              <StatusBadge 
                text={`${frontHybridResult.overallConfidence}% Confidence`} 
                type={frontHybridResult.overallConfidence >= 90 ? 'success' : 'warning'} 
              />
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: 'rgba(251, 191, 36, 0.1)',
                borderRadius: 'var(--radius-md)',
                marginTop: '8px',
              }}>
                <Zap size={16} color="#f59e0b" />
                <span style={{ fontSize: '14px', color: '#f59e0b', fontWeight: 600 }}>
                  Hybrid AI Scan - {frontHybridResult.selectedMethod.toUpperCase()} Selected
                </span>
              </div>
            </div>

            {/* Comparison card */}
            {displayedResult && (
              <div style={{
                width: '100%',
                padding: 'var(--spacing-md)',
                backgroundColor: 'rgba(59, 130, 246, 0.05)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
              }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>
                  {selectedSide.toUpperCase()} Side Scan Comparison
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span>📄 OCR (Textract):</span>
                    <strong>{displayedResult.comparisonDetails.textractConfidence}%</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span>📊 Barcode (PDF417):</span>
                    <strong>{displayedResult.comparisonDetails.pdf417Confidence}%</strong>
                  </div>
                  <div style={{
                    marginTop: '8px',
                    paddingTop: '8px',
                    borderTop: '1px solid rgba(59, 130, 246, 0.2)',
                    fontSize: '13px',
                    color: 'var(--color-primary)',
                  }}>
                    <TrendingUp size={14} style={{ marginRight: '4px' }} />
                    Recommended: {displayedResult.comparisonDetails.recommendedMethod.toUpperCase()}
                  </div>
                </div>
              </div>
            )}

            {/* Image display */}
            {hasBothSides && (
              <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-md)' }}>
                <Button
                  variant={selectedSide === 'front' ? 'primary' : 'secondary'}
                  onClick={() => setSelectedSide('front')}
                >
                  Front Side
                </Button>
                <Button
                  variant={selectedSide === 'back' ? 'primary' : 'secondary'}
                  onClick={() => setSelectedSide('back')}
                >
                  Back Side
                </Button>
              </div>
            )}

            {capturedImages[selectedSide] && (
              <img 
                src={capturedImages[selectedSide]} 
                alt={`${selectedSide} side`} 
                style={{
                  width: '100%',
                  maxWidth: '400px',
                  borderRadius: 'var(--radius-lg)',
                  border: '2px solid var(--color-border)',
                  marginTop: 'var(--spacing-md)',
                }} 
              />
            )}
          </div>
        </div>

        {/* Right Column */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h1 style={{ margin: 0 }}>Extracted Data</h1>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              <Button variant="secondary" icon={<Copy size={18} />} onClick={handleCopy}>Copy</Button>
              <Button variant="secondary" icon={<Download size={18} />}>Export</Button>
            </div>
          </div>

          {Object.entries(mergedData)
            .filter(([key, value]) => 
              value !== undefined && 
              value !== null &&
              value !== '' &&
              key !== 'rawResponse' && 
              key !== 'confidence' && 
              key !== 'rawText' &&
              !key.startsWith('_')
            )
            .map(([key, value]) => (
              <DataField
                key={key}
                icon={FIELD_ICONS[key] || <User size={20} color="var(--color-primary)" />}
                label={FIELD_LABELS[key] || key}
                value={String(value)}
              />
            ))
          }

          <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'auto' }}>
            <Button variant="secondary" fullWidth onClick={onBack}>Back</Button>
            <Button variant="primary" fullWidth onClick={onNewScan}>Scan Another ID</Button>
          </div>
        </div>
      </main>
    </div>
  );
}

interface DataFieldProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function DataField({ icon, label, value }: DataFieldProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 'var(--spacing-sm)',
      padding: 'var(--spacing-md)',
      backgroundColor: 'var(--color-surface)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--color-border)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
        minWidth: '40px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--color-background)',
      }}>
        {icon}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        <span className="caption">{label}</span>
        <span style={{ fontWeight: 600, color: 'var(--color-text-primary)', wordBreak: 'break-word' }}>
          {value}
        </span>
      </div>
    </div>
  );
}