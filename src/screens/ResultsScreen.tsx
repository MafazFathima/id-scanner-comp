// src/screens/ResultsScreen.tsx 
import React, { useState } from 'react';
import { NavigationBar } from '../components/NavigationBar';
import { Button } from '../components/Button';
import { CheckCircle, Copy, Download, Share2, User, Calendar, MapPin, Hash, FileText, Image as ImageIcon } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { useIsDesktop } from '../hooks/useMediaQuery';
import { Header } from '../components/Header';
import type { IDScanResult } from '../services/textractService';

interface ResultsScreenProps {
  scanData?: any;
  capturedImages?: {
    front?: string;
    back?: string;
  };
  onBack: () => void;
  onNewScan: () => void;
}

interface ResultsScreenInternalProps {
  scanData: any;
  capturedImages: {
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
  suffix: "Suffix",
  eyeColor: "Eye Color",
  dd: "Document Discriminator",
  rev: "Revision Date",
};

const FIELD_ICONS: Record<string, React.ReactNode> = {
  fullName: <User size={20} color="var(--color-primary)" />,
  firstName: <User size={20} color="var(--color-primary)" />,
  middleName: <User size={20} color="var(--color-primary)" />,
  lastName: <User size={20} color="var(--color-primary)" />,
  idNumber: <Hash size={20} color="var(--color-primary)" />,
  idType: <FileText size={20} color="var(--color-primary)" />,
  issueDate: <Calendar size={20} color="var(--color-primary)" />,
  expirationDate: <Calendar size={20} color="var(--color-primary)" />,
  dateOfBirth: <Calendar size={20} color="var(--color-primary)" />,
  address: <MapPin size={20} color="var(--color-primary)" />,
  city: <MapPin size={20} color="var(--color-primary)" />,
  state: <MapPin size={20} color="var(--color-primary)" />,
  stateName: <MapPin size={20} color="var(--color-primary)" />,
  zipCode: <MapPin size={20} color="var(--color-primary)" />,
  endorsements: <FileText size={20} color="var(--color-primary)" />,
  restrictions: <FileText size={20} color="var(--color-primary)" />,
  sex: <User size={20} color="var(--color-primary)" />,
  height: <User size={20} color="var(--color-primary)" />,
  suffix: <User size={20} color="var(--color-primary)" />,
  eyeColor: <User size={20} color="var(--color-primary)" />,
  dd: <Hash size={20} color="var(--color-primary)" />,         // ✨ NEW
  rev: <Calendar size={20} color="var(--color-primary)" />,
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

  // // Merge front and back data
  // const frontData = scanData.frontData || scanData;
  // const backData = scanData.backData;
  // const mergedData = { ...frontData, ...(backData || {}) };

const frontData = scanData.frontData || scanData;
const backData = scanData.backData;
const mergedData = { 
  ...frontData, 
  ...(backData && Object.fromEntries(
    Object.entries(backData).filter(([_, v]) => v !== '' && v !== undefined && v !== null)
  ))
};

  const isDesktop = useIsDesktop();

  return isDesktop ? (
    <ResultsScreenDesktop 
      scanData={mergedData} 
      capturedImages={capturedImages || {}} 
      onBack={onBack} 
      onNewScan={onNewScan}
      hasBothSides={!!(capturedImages?.front && capturedImages?.back)}
    />
  ) : (
    <ResultsScreenMobile 
      scanData={mergedData} 
      capturedImages={capturedImages || {}} 
      onBack={onBack} 
      onNewScan={onNewScan}
      hasBothSides={!!(capturedImages?.front && capturedImages?.back)}
    />
  );
}

function ResultsScreenMobile({ 
  scanData, 
  capturedImages, 
  onBack, 
  onNewScan,
  hasBothSides 
}: ResultsScreenInternalProps & { hasBothSides: boolean }) {
  const [selectedSide, setSelectedSide] = useState<'front' | 'back'>('front');
  const confidencePercent = Math.round(scanData.confidence * 100);

  const handleCopy = () => {
    const textData = Object.entries(scanData)
      .filter(([key, value]) => value !== undefined && key !== 'rawResponse' && key !== 'confidence' && !key.startsWith('_'))
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
            <StatusBadge 
              text={`Verified • ${confidencePercent}% Confidence`} 
              type={confidencePercent >= 90 ? 'success' : 'warning'} 
            />
            {hasBothSides && (
              <span className="caption" style={{ color: 'var(--color-success)' }}>
                ✓ Front & Back sides scanned
              </span>
            )}
          </div>

          {/* Image switcher for two-sided docs */}
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

          {/* Single image for single-sided docs */}
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

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-sm)',
        }}>
          <h2 style={{ margin: 0 }}>Extracted Information</h2>

          {Object.entries(scanData)
            .filter(([key, value]) => value !== undefined && key !== 'rawResponse' && key !== 'confidence' && !key.startsWith('_'))
            .map(([key, value]) => (
              <DataField
                key={key}
                icon={FIELD_ICONS[key] || <User size={20} color="var(--color-primary)" />}
                label={FIELD_LABELS[key] || key}
                value={String(value)}
              />
            ))
          }
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-sm)',
          marginTop: 'auto',
        }}>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
            <Button variant="secondary" fullWidth icon={<Copy size={20} />} onClick={handleCopy}>Copy</Button>
            <Button variant="secondary" fullWidth icon={<Download size={20} />}>Export</Button>
          </div>
          <Button variant="primary" fullWidth onClick={onNewScan}>Scan Another ID</Button>
        </div>
      </main>
    </div>
  );
}

function ResultsScreenDesktop({ 
  scanData, 
  capturedImages, 
  onBack, 
  onNewScan,
  hasBothSides 
}: ResultsScreenInternalProps & { hasBothSides: boolean }) {
  const [selectedSide, setSelectedSide] = useState<'front' | 'back'>('front');
  const confidencePercent = Math.round(scanData.confidence * 100);

  const handleCopy = () => {
    const textData = Object.entries(scanData)
      .filter(([key, value]) => value !== undefined && key !== 'rawResponse' && key !== 'confidence' && !key.startsWith('_'))
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
                text={`Verified • ${confidencePercent}% Confidence`} 
                type={confidencePercent >= 90 ? 'success' : 'warning'} 
              />
              {hasBothSides && (
                <span className="caption" style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                  ✓ Both sides verified
                </span>
              )}
            </div>

            {/* Image display with side toggle */}
            {hasBothSides && (
              <div style={{
                display: 'flex',
                gap: 'var(--spacing-sm)',
                marginTop: 'var(--spacing-md)',
              }}>
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

            {capturedImages[selectedSide] ? (
              <img src={capturedImages[selectedSide]} alt={`${selectedSide} side`} style={{
                width: '100%',
                maxWidth: '400px',
                borderRadius: 'var(--radius-lg)',
                border: '2px solid var(--color-border)',
                marginTop: 'var(--spacing-md)',
              }} />
            ) : capturedImages.front ? (
              <img src={capturedImages.front} alt="Scanned document" style={{
                width: '100%',
                maxWidth: '400px',
                borderRadius: 'var(--radius-lg)',
                border: '2px solid var(--color-border)',
                marginTop: 'var(--spacing-md)',
              }} />
            ) : (
              <div style={{
                width: '100%',
                maxWidth: '400px',
                aspectRatio: '1.586',
                backgroundColor: 'var(--color-background)',
                borderRadius: 'var(--radius-lg)',
                border: '2px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 'var(--spacing-md)',
              }}>
                <FileText size={48} color="var(--color-text-secondary)" />
              </div>
            )}
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-md)',
            padding: 'var(--spacing-lg)',
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
          }}>
            <h2 style={{ margin: 0 }}>Document Details</h2>
            {Object.entries(scanData)
              .filter(([key, value]) => value !== undefined && key !== 'rawResponse' && key !== 'confidence' && !key.startsWith('_'))
              .map(([key, value]) => (
                <DetailRow key={key} label={FIELD_LABELS[key] || key} value={String(value)} />
              ))
            }
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h1 style={{ margin: 0 }}>Extracted Data</h1>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              <Button variant="secondary" icon={<Copy size={18} />} onClick={handleCopy}>Copy</Button>
              <Button variant="secondary" icon={<Download size={18} />}>Export</Button>
            </div>
          </div>

          {Object.entries(scanData)
            .filter(([key, value]) => value !== undefined && key !== 'rawResponse' && key !== 'confidence' && !key.startsWith('_'))
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
  mono?: boolean;
}

function DataField({ icon, label, value, mono = false }: DataFieldProps) {
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
        <span className={mono ? 'mono' : ''} style={{ fontWeight: 600, color: 'var(--color-text-primary)', wordBreak: 'break-word' }}>
          {value}
        </span>
      </div>
    </div>
  );
}

function DetailRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 'var(--spacing-md)',
    }}>
      <span className="caption">{label}</span>
      <span className={mono ? 'mono' : 'caption'} style={{ fontWeight: 600, color: 'var(--color-text-primary)', textAlign: 'right' }}>
        {value}
      </span>
    </div>
  );
}
