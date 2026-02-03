// src>screens>Scancreen.tsx
import React from "react";
import { NavigationBar } from "../components/NavigationBar";
import { Button } from "../components/Button";
import { ScannerViewfinder } from "../components/ScannerViewfinder";
import { StatusBadge } from "../components/StatusBadge";
import { Camera, Upload, Image, FileText, History } from "lucide-react";
import { useIsDesktop } from "../hooks/useMediaQuery";
import { Header } from "../components/Header";

interface ScanScreenProps {
  onBack: () => void;
  onStartScan?: () => void;
  onUploadImage?: () => void;
  onViewHistory?: () => void;
}

export function ScanScreen({
  onBack,
  onStartScan,
  onUploadImage,
  onViewHistory,
}: ScanScreenProps) {
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return (
      <ScanScreenDesktop
        onBack={onBack}
        onStartScan={onStartScan}
        onUploadImage={onUploadImage}
        onViewHistory={onViewHistory}
      />
    );
  }

  return (
    <ScanScreenMobile
      onBack={onBack}
      onStartScan={onStartScan}
      onUploadImage={onUploadImage}
    />
  );
}

function ScanScreenMobile({
  onBack,
  onStartScan,
  onUploadImage,
}: ScanScreenProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%", // ✅ ADD
        maxWidth: "100%",
        margin: "auto auto",
        backgroundColor: "var(--color-background)",
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",
        // paddingBottom: "20px",
      }}
    >
      <div
        style={{
          marginTop: "16px",
          height: "60px",
          overflow: "hidden",
        }}
      >
        <NavigationBar title="Scan ID" onBack={onBack} />
      </div>

      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          // paddingTop: "var(--spacing-xs)"!,
          // padding: "var(--spacing-lg)",
           paddingTop: "var(--spacing-xs)",   // 👈 top
    paddingLeft: "var(--spacing-lg)",
    paddingRight: "var(--spacing-lg)",
    // paddingBottom: "var(--spacing-sm)",
          gap: "var(--spacing-lg)",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "390px",
            display: "flex",
            flexDirection: "column",
            gap: "var(--spacing-lg)",
            margin: "auto auto",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>
              Position your ID in the frame
            </p>
            <StatusBadge text="Ready" type="success" />
          </div>

          <ScannerViewfinder />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--spacing-sm)",
              padding: "var(--spacing-md)",
              backgroundColor: "var(--color-surface)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--color-border)",
            }}
          >
            <h2 style={{ margin: 0 }}>Scanning Tips</h2>
            <ul
              style={{
                margin: 0,
                paddingLeft: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "var(--spacing-xs)",
              }}
            >
              <li className="caption">Ensure good lighting conditions</li>
              <li className="caption">Keep ID flat and in focus</li>
              <li className="caption">Avoid glare and shadows</li>
              <li className="caption">Capture all four corners</li>
            </ul>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--spacing-sm)",
              marginTop: "auto",
            }}
          >
            <Button
              variant="primary"
              fullWidth
              icon={<Camera size={20} />}
              onClick={onStartScan}
            >
              Start Camera
            </Button>
            <Button
              variant="secondary"
              fullWidth
              icon={<Upload size={20} />}
              onClick={onUploadImage}
            >
              Upload from Gallery
            </Button>
          </div>

          <div
            style={{
              marginTop: "var(--spacing-sm)",
              marginBottom: "var(--spacing-sm)",
            }}
          >
            <h3
              style={{
                margin: "0 0 12px 0",
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--color-text)",
                textAlign: "center",
              }}
            >
              Supported Documents
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "16px",
                width: "100%",
              }}
            >
              <DocumentTypeMobile
                icon={<FileText size={24} />}
                label="Driver's License"
              />
              <DocumentTypeMobile
                icon={<FileText size={24} />}
                label="National ID"
              />
              <DocumentTypeMobile
                icon={<FileText size={24} />}
                label="Passport"
              />
              <DocumentTypeMobile
                icon={<FileText size={24} />}
                label="visa"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function DocumentTypeMobile({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
        padding: "16px 12px",
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        cursor: "pointer",
        // minHeight: "85px",
        transition: "all 0.2s ease",
      }}
    >
      <div
        style={{
          color: "var(--color-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>
      <span
        style={{
          fontSize: "13px",
          textAlign: "center",
          color: "var(--color-text-secondary)",
          fontWeight: 500,
          lineHeight: "1.3",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function ScanScreenDesktop({
  onBack,
  onStartScan,
  onUploadImage,
  onViewHistory,
}: ScanScreenProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--color-background)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header title="Universal ID Scanner" showMenu={false} />

      <main
        style={{
          flex: 1,
          display: "flex",
          gap: "var(--spacing-2xl)",
          padding: "var(--spacing-2xl)",
          maxWidth: "1400px",
          width: "100%",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            flex: 2,
            display: "flex",
            flexDirection: "column",
            gap: "var(--spacing-lg)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h1 style={{ margin: 0 }}>Scan Your ID</h1>
              <p className="caption" style={{ margin: "4px 0 0 0" }}>
                Position your ID within the frame for automatic detection
              </p>
            </div>
            <StatusBadge text="Camera Ready" type="success" />
          </div>

          <div
            style={{
              aspectRatio: "16 / 10",
              width: "100%",
            }}
          >
            <ScannerViewfinder />
          </div>

          <div
            style={{
              display: "flex",
              gap: "var(--spacing-md)",
            }}
          >
            <div style={{ flex: 1 }}>
              <Button
                variant="primary"
                fullWidth
                icon={<Camera size={20} />}
                onClick={onStartScan}
              >
                Start Camera Scan
              </Button>
            </div>
            <div style={{ flex: 1 }}>
              <Button
                variant="secondary"
                fullWidth
                icon={<Upload size={20} />}
                onClick={onUploadImage}
              >
                Upload Image
              </Button>
            </div>
            {onViewHistory && (
              <Button
                variant="secondary"
                icon={<History size={20} />}
                onClick={onViewHistory}
              >
                History
              </Button>
            )}
          </div>

          <div
            style={{
              display: "flex",
              gap: "var(--spacing-md)",
              padding: "var(--spacing-lg)",
              backgroundColor: "var(--color-surface)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--color-border)",
            }}
          >
            <DocumentType
              icon={<FileText size={24} />}
              label="Driver's License"
            />
            <DocumentType icon={<Image size={24} />} label="Passport" />
            <DocumentType icon={<FileText size={24} />} label="National ID" />
            <DocumentType icon={<FileText size={24} />} label="Visa" />
          </div>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "var(--spacing-lg)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--spacing-md)",
              padding: "var(--spacing-lg)",
              backgroundColor: "var(--color-surface)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--color-border)",
            }}
          >
            <h2 style={{ margin: 0 }}>Scanning Tips</h2>
            <ul
              style={{
                margin: 0,
                paddingLeft: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "var(--spacing-sm)",
              }}
            >
              <li className="caption">Use bright, even lighting</li>
              <li className="caption">Place ID on a flat, dark surface</li>
              <li className="caption">Keep camera steady and parallel</li>
              <li className="caption">Avoid shadows and glare</li>
              <li className="caption">Ensure all text is in focus</li>
              <li className="caption">Capture all four corners</li>
            </ul>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--spacing-md)",
              padding: "var(--spacing-lg)",
              backgroundColor: "#10b98108",
              borderRadius: "var(--radius-lg)",
              border: "1px solid #10b98130",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--spacing-sm)",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "var(--color-success)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 style={{ margin: 0, color: "var(--color-success)" }}>
                Privacy Protected
              </h2>
            </div>
            <ul
              style={{
                margin: 0,
                paddingLeft: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "var(--spacing-xs)",
              }}
            >
              <li className="caption">All processing is done locally</li>
              <li className="caption">No data sent to external servers</li>
              <li className="caption">Images are not stored</li>
              <li className="caption">GDPR & CCPA compliant</li>
            </ul>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "var(--spacing-md)",
            }}
          >
            <StatCard value="99%" label="Accuracy Rate" />
            <StatCard value="<2s" label="Scan Time" />
            <StatCard value="150+" label="ID Types" />
            <StatCard value="195" label="Countries" />
          </div>
        </div>
      </main>
    </div>
  );
}

function DocumentType({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "var(--spacing-xs)",
        padding: "var(--spacing-md)",
      }}
    >
      <div style={{ color: "var(--color-primary)" }}>{icon}</div>
      <span
        className="caption"
        style={{ textAlign: "center", fontSize: "12px" }}
      >
        {label}
      </span>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--spacing-xs)",
        padding: "var(--spacing-md)",
        backgroundColor: "var(--color-surface)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div
        style={{
          fontSize: "24px",
          fontWeight: 700,
          color: "var(--color-primary)",
        }}
      >
        {value}
      </div>
      <p className="caption" style={{ margin: 0, fontSize: "12px" }}>
        {label}
      </p>
    </div>
  );
}
