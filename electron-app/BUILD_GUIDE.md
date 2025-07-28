# Time Tracker Desktop - macOS Build Guide

This guide explains how to build and distribute the Time Tracker desktop application for macOS.

## Prerequisites

- macOS 10.12 or later
- Node.js 16+ and npm
- Xcode Command Line Tools (for code signing)

## Quick Build

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build for macOS:**
   ```bash
   npm run build:mac
   ```

3. **Find the built app:**
   - DMG installer: `releases/Time Tracker-1.0.0-arm64.dmg`
   - App bundle: `releases/mac-arm64/Time Tracker.app`

## Build Configuration

The app is configured in `package.json` with the following macOS-specific settings:

### App Metadata
- **App ID**: `com.timetracker.desktop`
- **Product Name**: `Time Tracker`
- **Category**: Productivity
- **Target**: DMG installer

### Security & Permissions
- **Hardened Runtime**: Enabled for better security
- **Entitlements**: Configured for network access, file access, and device permissions
- **Code Signing**: Optional (requires Apple Developer account)

## File Structure

```
electron-app/
├── main.js                 # Main entry point
├── src/                    # Source code
│   ├── main/              # Main process code
│   └── renderer/          # Renderer process code
├── renderer/               # Static assets
│   ├── index.html         # Main HTML file
│   ├── styles.css         # Styles
│   └── renderer.js        # Renderer script
├── assets/                 # App assets
│   └── icon.png           # App icon
├── build/                  # Build configuration
│   └── entitlements.mac.plist  # macOS entitlements
└── releases/               # Built applications
    ├── mac-arm64/         # App bundle
    └── *.dmg              # DMG installers
```

## Development vs Production

### Development Mode
```bash
npm run dev
```
- Hot reloading enabled
- DevTools open automatically
- Debug logging enabled

### Production Build
```bash
npm run build:mac
```
- Optimized for performance
- No DevTools
- Minified code

## Code Signing (Optional)

For distribution outside your organization, you'll need to code sign the app:

1. **Get Apple Developer Account**
2. **Install certificates:**
   ```bash
   # Install Developer ID Application certificate
   security import /path/to/certificate.p12 -k ~/Library/Keychains/login.keychain
   ```

3. **Build with signing:**
   ```bash
   npm run build:mac
   ```

## Distribution

### Internal Distribution
- Copy the DMG file to your team
- Users can drag the app to Applications folder

### External Distribution
- Code sign the app (see above)
- Upload to your website or app store
- Consider notarization for macOS Catalina+

## Troubleshooting

### Common Issues

1. **"App can't be opened" error:**
   - Right-click the app → Open
   - Or disable Gatekeeper: `sudo spctl --master-disable`

2. **Network permissions:**
   - Check entitlements.mac.plist
   - Ensure network client/server permissions are enabled

3. **File access issues:**
   - Verify file permissions in entitlements
   - Check app sandbox settings

### Build Errors

1. **Missing dependencies:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Icon issues:**
   - Ensure `assets/icon.png` exists
   - Icon should be 512x512 or larger

3. **Entitlements errors:**
   - Verify `build/entitlements.mac.plist` exists
   - Check XML syntax

## Testing

1. **Test the built app:**
   ```bash
   open releases/mac-arm64/Time\ Tracker.app
   ```

2. **Test DMG installation:**
   - Double-click the DMG file
   - Drag app to Applications
   - Launch from Applications folder

## Version Management

To update the app version:

1. **Update version in package.json:**
   ```json
   {
     "version": "1.0.1"
   }
   ```

2. **Rebuild:**
   ```bash
   npm run build:mac
   ```

## Security Notes

- The app uses hardened runtime for better security
- Network permissions are required for API communication
- File access permissions needed for screenshots
- Camera/microphone permissions for future features

## Support

For build issues or questions:
1. Check the console output for error messages
2. Verify all dependencies are installed
3. Ensure macOS version compatibility
4. Check file permissions and entitlements 