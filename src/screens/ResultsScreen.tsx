import React from 'react';
import { NavigationBar } from '../components/NavigationBar';
import { Button } from '../components/Button';
import { CheckCircle, Copy, Download, Share2, User, Calendar, MapPin, Hash, FileText } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { useIsDesktop } from '../hooks/useMediaQuery';
import { Header } from '../components/Header';

interface ResultsScreenProps {
  onBack: () => void;
  onNewScan: () => void;
}

export function ResultsScreen({ onBack, onNewScan }: ResultsScreenProps) {
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return <ResultsScreenDesktop onBack={onBack} onNewScan={onNewScan} />;
  }

  return <ResultsScreenMobile onBack={onBack} onNewScan={onNewScan} />;
}

function ResultsScreenMobile({ onBack, onNewScan }: ResultsScreenProps) {
  const handleCopy = () => {
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
        {/* Success Header */}
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
            <StatusBadge text="Verified • 99% Confidence" type="success" />
          </div>
        </div>

        {/* Extracted Data */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-sm)',
        }}>
          <h2 style={{ margin: 0 }}>Extracted Information</h2>
          
          <DataField
            icon={<User size={20} color="var(--color-primary)" />}
            label="Full Name"
            value="JOHN MICHAEL SMITH"
          />
          <DataField
            icon={<Hash size={20} color="var(--color-primary)" />}
            label="ID Number"
            value="D1234-5678-9012-34"
            mono
          />
          <DataField
            icon={<Calendar size={20} color="var(--color-primary)" />}
            label="Date of Birth"
            value="January 15, 1990"
          />
          <DataField
            icon={<Calendar size={20} color="var(--color-primary)" />}
            label="Expiration Date"
            value="December 31, 2027"
          />
          <DataField
            icon={<MapPin size={20} color="var(--color-primary)" />}
            label="Address"
            value="123 Main Street, San Francisco, CA 94102"
          />
        </div>

        {/* Document Details */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-sm)',
          padding: 'var(--spacing-md)',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
        }}>
          <DetailRow label="Document Type" value="Driver's License" />
          <DetailRow label="Issuing State" value="California, USA" />
          <DetailRow label="Scan Time" value="2026-01-22 14:32:15" mono />
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-sm)',
          marginTop: 'auto',
        }}>
          <div style={{
            display: 'flex',
            gap: 'var(--spacing-sm)',
          }}>
            <Button 
              variant="secondary" 
              fullWidth 
              icon={<Copy size={20} />}
              onClick={handleCopy}
            >
              Copy
            </Button>
            <Button 
              variant="secondary" 
              fullWidth 
              icon={<Share2 size={20} />}
            >
              Share
            </Button>
            <Button 
              variant="secondary" 
              fullWidth 
              icon={<Download size={20} />}
            >
              Export
            </Button>
          </div>
          <Button 
            variant="primary" 
            fullWidth 
            onClick={onNewScan}
          >
            Scan Another ID
          </Button>
        </div>
      </main>
    </div>
  );
}

function ResultsScreenDesktop({ onBack, onNewScan }: ResultsScreenProps) {
  const handleCopy = () => {
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
        {/* Left Side - Preview */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-lg)',
        }}>
          {/* Success Status */}
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
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
            }}>
              <h1 style={{ margin: 0 }}>Scan Successful</h1>
              <StatusBadge text="Verified • 99% Confidence" type="success" />
            </div>

            {/* ID Preview */}
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
          </div>

          {/* Document Metadata */}
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
            <DetailRow label="Document Type" value="Driver's License" />
            <DetailRow label="Issuing Authority" value="California DMV, USA" />
            <DetailRow label="Issue Date" value="January 10, 2022" />
            <DetailRow label="Scan Timestamp" value="2026-01-22 14:32:15 UTC" mono />
            <DetailRow label="Processing Time" value="1.8 seconds" />
            <DetailRow label="Confidence Score" value="99.2%" />
          </div>
        </div>

        {/* Right Side - Extracted Data */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-lg)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <h1 style={{ margin: 0 }}>Extracted Data</h1>
            <div style={{
              display: 'flex',
              gap: 'var(--spacing-sm)',
            }}>
              <Button 
                variant="secondary" 
                icon={<Copy size={18} />}
                onClick={handleCopy}
              >
                Copy
              </Button>
              <Button 
                variant="secondary" 
                icon={<Download size={18} />}
              >
                Export
              </Button>
            </div>
          </div>

          {/* Personal Information */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-sm)',
          }}>
            <h2 style={{ margin: 0 }}>Personal Information</h2>
            <DataField
              icon={<User size={20} color="var(--color-primary)" />}
              label="Full Name"
              value="JOHN MICHAEL SMITH"
            />
            <DataField
              icon={<Calendar size={20} color="var(--color-primary)" />}
              label="Date of Birth"
              value="January 15, 1990"
            />
            <DataField
              icon={<User size={20} color="var(--color-primary)" />}
              label="Sex"
              value="Male"
            />
            <DataField
              icon={<User size={20} color="var(--color-primary)" />}
              label="Height"
              value={'6\'0" (183 cm)'}
            />
          </div>

          {/* Document Information */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-sm)',
          }}>
            <h2 style={{ margin: 0 }}>Document Information</h2>
            <DataField
              icon={<Hash size={20} color="var(--color-primary)" />}
              label="ID Number"
              value="D1234-5678-9012-34"
              mono
            />
            <DataField
              icon={<Calendar size={20} color="var(--color-primary)" />}
              label="Expiration Date"
              value="December 31, 2027"
            />
            <DataField
              icon={<MapPin size={20} color="var(--color-primary)" />}
              label="Address"
              value="123 Main Street, San Francisco, CA 94102"
            />
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex',
            gap: 'var(--spacing-md)',
            marginTop: 'auto',
          }}>
            <Button 
              variant="secondary" 
              fullWidth
              onClick={onBack}
            >
              Back
            </Button>
            <Button 
              variant="primary" 
              fullWidth 
              onClick={onNewScan}
            >
              Scan Another ID
            </Button>
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
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        flex: 1,
      }}>
        <span className="caption">{label}</span>
        <span className={mono ? 'mono' : ''} style={{ 
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          wordBreak: 'break-word',
        }}>
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
      <span className={mono ? 'mono' : 'caption'} style={{ 
        fontWeight: 600, 
        color: 'var(--color-text-primary)',
        textAlign: 'right',
      }}>
        {value}
      </span>
    </div>
  );
}