// src/screens/DocumentSelectionScreen.tsx
import React from 'react';
import { NavigationBar } from '../components/NavigationBar';
import { Header } from '../components/Header';
import { FileText, CreditCard, FileCheck } from 'lucide-react';
import { useIsDesktop } from '../hooks/useMediaQuery';
import type { DocumentType, DocumentRequirements } from '../sdk/types';

interface DocumentSelectionScreenProps {
  onSelectDocument: (docType: DocumentType) => void;
  onBack: () => void;
}

const DOCUMENT_OPTIONS: DocumentRequirements[] = [
  {
    type: 'drivers-license',
    label: "Driver's License",
    requiresFront: true,
    requiresBack: true,
    icon: '🪪',
  },
  {
    type: 'national-id',
    label: 'National ID',
    requiresFront: true,
    requiresBack: true,
    icon: '🆔',
  },
  {
    type: 'passport',
    label: 'Passport',
    requiresFront: true,
    requiresBack: false,
    icon: '🛂',
  },
  {
    type: 'visa',
    label: 'Visa',
    requiresFront: true,
    requiresBack: false,
    icon: '📋',
  },
];

export function DocumentSelectionScreen({ onSelectDocument, onBack }: DocumentSelectionScreenProps) {
  const isDesktop = useIsDesktop();

  return isDesktop ? (
    <DocumentSelectionDesktop onSelectDocument={onSelectDocument} onBack={onBack} />
  ) : (
    <DocumentSelectionMobile onSelectDocument={onSelectDocument} onBack={onBack} />
  );
}

function DocumentSelectionMobile({ onSelectDocument, onBack }: DocumentSelectionScreenProps) {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-background)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* <NavigationBar title="Select Document Type" onBack={onBack} /> */}
<div style={{ marginTop: 'var(--spacing-lg)' }}>
  <NavigationBar title="Select Document Type" onBack={onBack} />
</div>

      <main style={{
        flex: 1,
        paddingRight: 'var(--spacing-lg)',
        paddingLeft: 'var(--spacing-lg)',
        // paddingBottom: 'var(--spacing-xxl)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-lg)',
      }}>
        <div>
          <h2 style={{ margin: 0 }}>What would you like to scan?</h2>
          <p className="caption" style={{marginBottom:'-12px',marginTop: 'var(--spacing-xs)', color: 'var(--color-text-secondary)' }}>
            Select the type of document you want to scan
          </p>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-md)',
        }}>
          {DOCUMENT_OPTIONS.map((doc) => (
            <DocumentCard
              key={doc.type}
              document={doc}
              onClick={() => onSelectDocument(doc.type)}
            />
          ))}
        </div>

        <div style={{
          marginTop: 'auto',
          padding: 'var(--spacing-md)',
          backgroundColor: '#3b82f608',
          borderRadius: 'var(--radius-md)',
          border: '1px solid #3b82f620',
        }}>
          <p className="caption" style={{ margin: 0, textAlign: 'center' }}>
            ℹ️ Documents requiring both sides will prompt you to scan front and back
          </p>
        </div>
      </main>
    </div>
  );
}

function DocumentSelectionDesktop({ onSelectDocument, onBack }: DocumentSelectionScreenProps) {
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
        padding: 'var(--spacing-2xl)',
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
      }}>
        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
          <h1 style={{ margin: 0 }}>Select Document Type</h1>
          <p className="caption" style={{ marginTop: 'var(--spacing-sm)', color: 'var(--color-text-secondary)' }}>
            Choose the type of document you want to scan. Documents requiring both sides will guide you through the process.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--spacing-lg)',
        }}>
          {DOCUMENT_OPTIONS.map((doc) => (
            <DocumentCard
              key={doc.type}
              document={doc}
              onClick={() => onSelectDocument(doc.type)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

interface DocumentCardProps {
  document: DocumentRequirements;
  onClick: () => void;
}

function DocumentCard({ document, onClick }: DocumentCardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: 'var(--spacing-lg)',
        backgroundColor: 'var(--color-surface)',
        border: '2px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-md)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-primary)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-border)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-md)',
      }}>
        <div style={{
          fontSize: '32px',
          width: '48px',
          height: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-background)',
          borderRadius: 'var(--radius-md)',
        }}>
          {document.icon}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: '18px' }}>{document.label}</h3>
          <p className="caption" style={{ margin: '4px 0 0 0', color: 'var(--color-text-secondary)' }}>
            {document.requiresBack ? 'Front & Back scan required' : 'Single scan required'}
          </p>
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: 'var(--spacing-xs)',
        flexWrap: 'wrap',
      }}>
        {document.requiresFront && (
          <span style={{
            padding: '4px 8px',
            fontSize: '12px',
            backgroundColor: '#3b82f615',
            color: 'var(--color-primary)',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 500,
          }}>
            Front Required
          </span>
        )}
        {document.requiresBack && (
          <span style={{
            padding: '4px 8px',
            fontSize: '12px',
            backgroundColor: '#3b82f615',
            color: 'var(--color-primary)',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 500,
          }}>
            Back Required
          </span>
        )}
      </div>
    </div>
  );
}