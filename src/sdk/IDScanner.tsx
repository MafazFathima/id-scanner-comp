// src/sdk/IDScanner.tsx - Updated with two-sided scanning support
import React from "react";
import { SDKProvider, useSDK } from "./context";
import type { SDKConfig, SDKCallbacks, SDKScreen, ScanResult, DocumentType } from "./types";
import { WelcomeScreen } from "../screens/WelcomeScreen";
import { ScanScreen } from "../screens/ScanScreen";
import { DocumentSelectionScreen } from "../screens/DocumentSelectionScreen";
import { ScanningScreen } from "../screens/ScanningScreen";
import { ResultsScreen } from "../screens/ResultsScreen";
import { ErrorScreen } from "../screens/ErrorScreen";
import { HistoryScreen } from "../screens/HistoryScreen";
import { ThemeInjector } from "./ThemeInjector";

interface IDScannerProps {
  config?: Partial<SDKConfig>;
  callbacks?: SDKCallbacks;
  initialScreen?: SDKScreen;
  embedded?: boolean;
  showDebug?: boolean;
}

export function IDScanner({
  config,
  callbacks,
  initialScreen = "welcome",
  embedded = false,
  showDebug = false,
}: IDScannerProps) {
  React.useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalOverflowX = document.body.style.overflowX;

    document.body.style.overflowX = "hidden";
    document.body.style.maxWidth = "100vw";

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.overflowX = originalOverflowX;
      document.body.style.maxWidth = "";
    };
  }, []);

  return (
    <SDKProvider
      config={config}
      callbacks={callbacks}
      initialScreen={initialScreen}
    >
      <ThemeInjector />
      <IDScannerContent embedded={embedded} showDebug={showDebug} />
    </SDKProvider>
  );
}

function IDScannerContent({
  embedded,
  showDebug,
}: {
  embedded: boolean;
  showDebug: boolean;
}) {
  const { currentScreen, navigate, callbacks, config, addScanResult } = useSDK();
  
  // Two-sided scanning state
  const [selectedDocumentType, setSelectedDocumentType] = React.useState<DocumentType>('drivers-license');
  const [lastScanResult, setLastScanResult] = React.useState<ScanResult | null>(null);
  const [lastCompleteScan, setLastCompleteScan] = React.useState<any>(null);

  const handleGetStarted = () => navigate("scan");
  const handleBackToWelcome = () => navigate("welcome");

  // Navigate to document selection
  const handleStartScan = () => {
    callbacks.onScanStart?.();
    navigate("document-selection");
  };

  const handleUploadImage = () => {
    callbacks.onScanStart?.();
    navigate("document-selection");
  };

  // After document type is selected
  const handleDocumentSelected = (docType: DocumentType) => {
    setSelectedDocumentType(docType);
    navigate("scanning");
  };

  // Handle complete scan (with both sides if required)
  const handleScanComplete = (completeScanData: {
    documentType: DocumentType;
    frontImage: string;
    frontData: any;
    backImage?: string;
    backData?: any;
  }) => {
    console.log('✅ Complete scan finished:', completeScanData);

    // Merge front and back data
    const mergedData = {
      ...completeScanData.frontData,
      ...(completeScanData.backData || {}),
      // Add metadata about which side had which data
      _frontSide: completeScanData.frontData,
      _backSide: completeScanData.backData,
    };

    const result: ScanResult = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      documentType: completeScanData.documentType,
      confidence: completeScanData.frontData?.confidence || 0.99,
      verified: (completeScanData.frontData?.confidence || 0) > 0.8,
      data: {
        fullName: mergedData?.fullName || "Unknown",
        idNumber: mergedData?.idNumber || "Unknown",
        dateOfBirth: mergedData?.dateOfBirth || "Unknown",
        expirationDate: mergedData?.expirationDate || "Unknown",
        address: mergedData?.address || "Unknown",
        issuingAuthority: `${mergedData?.stateName || "Unknown"} DMV`,
      },
      metadata: {
        processingTime: 0,
        imageQuality: 0,
        documentCountry: "USA",
        documentState: mergedData?.state,
        hasFrontScan: true,
        hasBackScan: !!completeScanData.backImage,
      },
    };

    setLastCompleteScan(completeScanData);
    setLastScanResult(result);
    addScanResult(result);
    callbacks.onScanComplete?.(completeScanData);
    navigate("results");
  };

  const handleScanError = (error: Error) => {
    callbacks.onScanError?.({
      code: "scan-failed",
      message: error.message,
      details: error,
    });
    navigate("error");
  };

  const handleNewScan = () => navigate("document-selection");
  const handleViewHistory = () => navigate("history");
  const handleSelectScan = (scanId: string) => {
    navigate("results");
  };

  const containerStyle: React.CSSProperties = embedded
    ? {
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
      }
    : {
        minHeight: "100vh",
        width: "100%",
        maxWidth: "100vw",
        overflowY: "auto",
        overflowX: "hidden",
        boxSizing: "border-box",
      };

  const renderScreen = () => {
    if (currentScreen === "welcome" && !config.features?.showWelcome) {
      navigate("scan");
      return null;
    }

    switch (currentScreen) {
      case "welcome":
        return <WelcomeScreen onGetStarted={handleGetStarted} />;

      case "scan":
        return (
          <ScanScreen
            onBack={handleBackToWelcome}
            onStartScan={
              config.features?.enableCamera ? handleStartScan : undefined
            }
            onUploadImage={
              config.features?.enableUpload ? handleUploadImage : undefined
            }
            onViewHistory={
              config.features?.enableHistory ? handleViewHistory : undefined
            }
          />
        );

      case "document-selection":
        return (
          <DocumentSelectionScreen
            onSelectDocument={handleDocumentSelected}
            onBack={() => navigate("scan")}
          />
        );

      case "scanning":
        return (
          <ScanningScreen
            onComplete={handleScanComplete}
            onCancel={() => navigate("document-selection")}
            mode="camera"
            documentType={selectedDocumentType}
            requiresBackScan={config.features?.requireBackScan !== false}
          />
        );

      case "results":
        return (
          <ResultsScreen
            onBack={() => navigate("scan")}
            onNewScan={handleNewScan}
            scanData={lastCompleteScan}
            capturedImages={{
              front: lastCompleteScan?.frontImage,
              back: lastCompleteScan?.backImage,
            }}
          />
        );

      case "error":
        return (
          <ErrorScreen
            onRetry={handleStartScan}
            onBack={() => navigate("scan")}
            errorType="poor-quality"
          />
        );

      case "history":
        return (
          <HistoryScreen
            onSelectScan={handleSelectScan}
            onNewScan={handleNewScan}
          />
        );

      default:
        return <WelcomeScreen onGetStarted={handleGetStarted} />;
    }
  };

  return (
    <div style={containerStyle}>
      <div
        style={{
          width: "100%",
          height: "100%",
          overflow: currentScreen === "scanning" ? "hidden" : "auto",
        }}
      >
        {renderScreen()}
        <div
          style={{
            textAlign: "center",
            padding: "12px",
            paddingBottom:showDebug ? "90px" : "12px",
            fontSize: "16px",
            color: "#555",
          }}
        >
          By continuing, you agree to our Terms & Privacy Policy
        </div>
      </div>
      {showDebug && <DebugPanel />}
    </div>
  );
}

function DebugPanel() {
  const { currentScreen, navigate, theme, config } = useSDK();
  const screens: SDKScreen[] = [
    "welcome",
    "scan",
    "document-selection",
    "scanning",
    "results",
    "error",
    "history",
  ];

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        padding: "8px",
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        display: "flex",
        gap: "8px",
        justifyContent: "center",
        flexWrap: "wrap",
        zIndex: 9999,
        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <div
        style={{
          padding: "4px 8px",
          fontSize: "11px",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          color: "#ffffff",
          borderRadius: "4px",
          fontWeight: 600,
        }}
      >
        SDK Debug
      </div>
      {screens.map((screen) => (
        <button
          key={screen}
          onClick={() => navigate(screen)}
          style={{
            padding: "4px 8px",
            fontSize: "11px",
            backgroundColor:
              currentScreen === screen
                ? theme.colors?.primary
                : theme.colors?.secondary,
            color: theme.colors?.textInverse,
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            textTransform: "capitalize",
            fontWeight: currentScreen === screen ? 600 : 400,
          }}
        >
          {screen}
        </button>
      ))}
    </div>
  );
}