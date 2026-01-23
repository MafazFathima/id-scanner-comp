import React from 'react';
import { Header } from '../components/Header';
import { Clock, CheckCircle, ChevronRight, Filter, Search } from 'lucide-react';
import { useIsDesktop } from '../hooks/useMediaQuery';
import { Button } from '../components/Button';

interface HistoryScreenProps {
  onSelectScan: (scanId: string) => void;
  onNewScan: () => void;
}

export function HistoryScreen({ onSelectScan, onNewScan }: HistoryScreenProps) {
  const isDesktop = useIsDesktop();

  const scans = [
    {
      id: '1',
      name: 'JOHN MICHAEL SMITH',
      type: 'Driver\'s License',
      state: 'California',
      date: '2 hours ago',
      verified: true,
    },
    {
      id: '2',
      name: 'SARAH JANE JOHNSON',
      type: 'Passport',
      state: 'United States',
      date: 'Yesterday',
      verified: true,
    },
    {
      id: '3',
      name: 'ROBERT WILLIAMS',
      type: 'Driver\'s License',
      state: 'New York',
      date: '2 days ago',
      verified: true,
    },
    {
      id: '4',
      name: 'EMILY DAVIS',
      type: 'Passport',
      state: 'United States',
      date: '3 days ago',
      verified: true,
    },
    {
      id: '5',
      name: 'MICHAEL BROWN',
      type: 'Driver\'s License',
      state: 'Texas',
      date: '5 days ago',
      verified: true,
    },
  ];

  if (isDesktop) {
    return <HistoryScreenDesktop scans={scans} onSelectScan={onSelectScan} onNewScan={onNewScan} />;
  }

  return <HistoryScreenMobile scans={scans} onSelectScan={onSelectScan} onNewScan={onNewScan} />;
}

function HistoryScreenMobile({ scans, onSelectScan, onNewScan }: any) {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-background)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Header title="Scan History" />

      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: 'var(--spacing-lg)',
        gap: 'var(--spacing-lg)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <h1 style={{ margin: 0 }}>Recent Scans</h1>
            <p className="caption" style={{ margin: '4px 0 0 0' }}>
              {scans.length} scans in the last 7 days
            </p>
          </div>
          <button
            onClick={onNewScan}
            style={{
              padding: 'var(--spacing-xs) var(--spacing-md)',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-text-inverse)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '14px',
            }}
          >
            New Scan
          </button>
        </div>

        {/* Scan List */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-sm)',
        }}>
          {scans.map((scan: any) => (
            <ScanHistoryItem
              key={scan.id}
              scan={scan}
              onClick={() => onSelectScan(scan.id)}
            />
          ))}
        </div>

        {/* Empty State Helper */}
        <div style={{
          marginTop: 'auto',
          padding: 'var(--spacing-md)',
          textAlign: 'center',
        }}>
          <p className="caption" style={{ margin: 0 }}>
            Scans are stored locally and automatically deleted after 30 days
          </p>
        </div>
      </main>
    </div>
  );
}

function HistoryScreenDesktop({ scans, onSelectScan, onNewScan }: any) {
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
        flexDirection: 'column',
        padding: 'var(--spacing-2xl)',
        gap: 'var(--spacing-lg)',
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}>
          <div>
            <h1 style={{ margin: 0 }}>Scan History</h1>
            <p className="caption" style={{ margin: '8px 0 0 0' }}>
              {scans.length} scans in the last 7 days • All data stored locally
            </p>
          </div>
          <div style={{
            display: 'flex',
            gap: 'var(--spacing-md)',
          }}>
            <Button variant="secondary" icon={<Filter size={18} />}>
              Filter
            </Button>
            <Button variant="primary" onClick={onNewScan}>
              New Scan
            </Button>
          </div>
        </div>

        {/* Search */}
        <div style={{
          position: 'relative',
        }}>
          <Search 
            size={20} 
            color="var(--color-text-secondary)" 
            style={{
              position: 'absolute',
              left: 'var(--spacing-md)',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          />
          <input
            type="text"
            placeholder="Search by name, ID number, or document type..."
            style={{
              width: '100%',
              padding: 'var(--spacing-md) var(--spacing-md) var(--spacing-md) 48px',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              fontSize: '16px',
              fontFamily: 'var(--font-family)',
              backgroundColor: 'var(--color-surface)',
            }}
          />
        </div>

        {/* Scan Table */}
        <div style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          overflow: 'hidden',
        }}>
          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '40px 2fr 1.5fr 1.5fr 1fr 40px',
            gap: 'var(--spacing-md)',
            padding: 'var(--spacing-md) var(--spacing-lg)',
            backgroundColor: 'var(--color-background)',
            borderBottom: '1px solid var(--color-border)',
          }}>
            <span className="caption" style={{ fontWeight: 600 }}></span>
            <span className="caption" style={{ fontWeight: 600 }}>Name</span>
            <span className="caption" style={{ fontWeight: 600 }}>Document Type</span>
            <span className="caption" style={{ fontWeight: 600 }}>Issuing Authority</span>
            <span className="caption" style={{ fontWeight: 600 }}>Scan Time</span>
            <span className="caption" style={{ fontWeight: 600 }}></span>
          </div>

          {/* Table Rows */}
          {scans.map((scan: any) => (
            <button
              key={scan.id}
              onClick={() => onSelectScan(scan.id)}
              style={{
                display: 'grid',
                gridTemplateColumns: '40px 2fr 1.5fr 1.5fr 1fr 40px',
                gap: 'var(--spacing-md)',
                padding: 'var(--spacing-md) var(--spacing-lg)',
                borderBottom: '1px solid var(--color-border)',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: '1px solid var(--color-border)',
                textAlign: 'left',
                cursor: 'pointer',
                width: '100%',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-background)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {scan.verified ? (
                  <CheckCircle size={20} color="var(--color-success)" />
                ) : (
                  <Clock size={20} color="var(--color-text-secondary)" />
                )}
              </div>
              <span style={{ fontWeight: 600 }}>{scan.name}</span>
              <span className="caption" style={{ color: 'var(--color-text-primary)' }}>{scan.type}</span>
              <span className="caption" style={{ color: 'var(--color-text-primary)' }}>{scan.state}</span>
              <span className="caption" style={{ color: 'var(--color-text-secondary)' }}>{scan.date}</span>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <ChevronRight size={20} color="var(--color-text-secondary)" />
              </div>
            </button>
          ))}
        </div>

        {/* Footer Info */}
        <div style={{
          padding: 'var(--spacing-lg)',
          textAlign: 'center',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
        }}>
          <p className="caption" style={{ margin: 0 }}>
            All scans are stored locally on your device and automatically deleted after 30 days for privacy protection
          </p>
        </div>
      </main>
    </div>
  );
}

interface ScanHistoryItemProps {
  scan: {
    id: string;
    name: string;
    type: string;
    state: string;
    date: string;
    verified: boolean;
  };
  onClick: () => void;
}

function ScanHistoryItem({ scan, onClick }: ScanHistoryItemProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-md)',
        padding: 'var(--spacing-md)',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--color-background)';
        e.currentTarget.style.borderColor = 'var(--color-primary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--color-surface)';
        e.currentTarget.style.borderColor = 'var(--color-border)';
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '48px',
        height: '48px',
        minWidth: '48px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--color-background)',
      }}>
        {scan.verified ? (
          <CheckCircle size={24} color="var(--color-success)" />
        ) : (
          <Clock size={24} color="var(--color-text-secondary)" />
        )}
      </div>

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}>
        <h2 style={{ margin: 0, fontSize: '16px' }}>{scan.name}</h2>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-xs)',
        }}>
          <span className="caption">{scan.type}</span>
          <span className="caption" style={{ color: 'var(--color-border)' }}>•</span>
          <span className="caption">{scan.state}</span>
        </div>
        <span className="caption" style={{ fontSize: '12px' }}>{scan.date}</span>
      </div>

      <ChevronRight size={20} color="var(--color-text-secondary)" />
    </button>
  );
}
