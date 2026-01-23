# Universal ID Scanner - Flutter SDK

Flutter implementation of the Universal ID Scanner SDK.

## Installation

Add to your `pubspec.yaml`:

```yaml
dependencies:
  universal_id_scanner: ^1.0.0
```

## Usage

### Basic Implementation

```dart
import 'package:flutter/material.dart';
import 'package:universal_id_scanner/universal_id_scanner.dart';

class ScannerPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return IDScanner(
      config: SDKConfig(
        appName: 'My App',
        theme: SDKTheme(
          colors: ThemeColors(
            primary: Color(0xFF2563EB),
            success: Color(0xFF10B981),
          ),
        ),
      ),
      callbacks: SDKCallbacks(
        onScanComplete: (ScanResult data) {
          print('Scan completed: ${data.toJson()}');
          Navigator.pop(context, data);
        },
        onScanError: (ScanError error) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Scan failed: ${error.message}')),
          );
        },
      ),
    );
  }
}
```

### Custom Theme

```dart
IDScanner(
  config: SDKConfig(
    theme: SDKTheme(
      colors: ThemeColors(
        primary: Color(0xFF6366F1),
        primaryHover: Color(0xFF4F46E5),
        success: Color(0xFF22C55E),
        error: Color(0xFFEF4444),
        background: Color(0xFFFFFFFF),
        surface: Color(0xFFF9FAFB),
      ),
      spacing: Spacing(
        xs: 8.0,
        sm: 12.0,
        md: 16.0,
        lg: 24.0,
      ),
      radius: Radius(
        md: 8.0,
        lg: 12.0,
      ),
    ),
    features: Features(
      showWelcome: true,
      enableHistory: true,
      enableCamera: true,
      enableUpload: true,
    ),
  ),
)
```

### Embedded Mode

```dart
// For embedding in existing screens
IDScanner(
  embedded: true,
  initialScreen: SDKScreen.scan,
  config: SDKConfig(
    features: Features(
      showWelcome: false,
      enableHistory: false,
    ),
  ),
  callbacks: SDKCallbacks(
    onScanComplete: (data) {
      // Handle result
    },
  ),
)
```

### Full Example

```dart
class MyApp extends StatefulWidget {
  @override
  _MyAppState createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  ScanResult? _lastScan;

  void _startScanner() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => IDScanner(
          config: SDKConfig(
            appName: 'AcmeCorp Verify',
            theme: SDKTheme(
              colors: ThemeColors(
                primary: Color(0xFF8B5CF6),
              ),
            ),
          ),
          callbacks: SDKCallbacks(
            onScanComplete: (data) {
              setState(() {
                _lastScan = data;
              });
              Navigator.pop(context, data);
            },
          ),
        ),
      ),
    );

    if (result != null) {
      print('Received scan result: ${result.data.fullName}');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('ID Scanner Demo'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            ElevatedButton(
              onPressed: _startScanner,
              child: Text('Scan ID'),
            ),
            if (_lastScan != null) ...[
              SizedBox(height: 20),
              Text('Last scan: ${_lastScan!.data.fullName}'),
              Text('ID: ${_lastScan!.data.idNumber}'),
            ],
          ],
        ),
      ),
    );
  }
}
```

## Configuration Options

### SDKConfig

```dart
SDKConfig({
  String? appName,
  Widget? logo,
  SDKTheme? theme,
  Features? features,
  Behavior? behavior,
  List<DocumentType>? documentTypes,
  String? locale,
  Map<String, Map<String, String>>? translations,
  Privacy? privacy,
})
```

### Callbacks

```dart
SDKCallbacks({
  Function()? onScanStart,
  Function(double progress, String status)? onScanProgress,
  Function(ScanResult data)? onScanComplete,
  Function(ScanError error)? onScanError,
  Function()? onScanCancel,
  Function(ScanResult data, ExportFormat format)? onExport,
  Function(ScanResult data)? onShare,
  Function(String scanId)? onDelete,
  Function(SDKScreen screen)? onNavigate,
})
```

## Platform-Specific Setup

### iOS

Add camera permissions to `Info.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>We need camera access to scan ID documents</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>We need photo library access to upload ID images</string>
```

### Android

Add camera permissions to `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-feature android:name="android.hardware.camera" />
```

## License

MIT License
