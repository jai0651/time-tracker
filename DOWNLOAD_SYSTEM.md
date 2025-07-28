# Desktop App Download System

## 📋 Overview

The desktop app download system allows employees to download the Electron-based Time Tracker application directly from the web UI. The system provides both programmatic downloads and direct download links.

## 🏗️ Architecture

### **System Components:**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web UI        │    │   Backend API   │    │   Electron App  │
│   (Dashboard)   │◄──►│   (Downloads)   │◄──►│   (Built DMG)   │
│                 │    │                 │    │                 │
│ • Download UI   │    │ • File Serving  │    │ • macOS DMG     │
│ • Progress      │    │ • File Info     │    │ • ARM64 Build   │
│ • Direct Links  │    │ • Error Handling│    │ • Auto Updates  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Implementation

### **1. Backend API (Downloads Route)**

**File:** `backend/routes/downloads.js`

**Endpoints:**
- `GET /api/v1/downloads/desktop-app` - Download the DMG file
- `GET /api/v1/downloads/desktop-app/info` - Get file information

**Features:**
- ✅ **File streaming**: Efficient large file downloads
- ✅ **Error handling**: Graceful failure handling
- ✅ **File validation**: Checks if DMG exists
- ✅ **Headers**: Proper download headers and caching

### **2. Web UI Integration**

**File:** `web-vite-ui/src/repository/downloadRepository.js`

**Methods:**
- `getDesktopAppInfo()` - Fetch download information
- `downloadDesktopApp()` - Programmatic download
- `getDesktopAppDownloadUrl()` - Direct download URL

**Features:**
- ✅ **Blob handling**: Browser-based file downloads
- ✅ **Progress tracking**: Download state management
- ✅ **Error handling**: User-friendly error messages

### **3. Dashboard Integration**

**File:** `web-vite-ui/src/pages/DashboardPage.jsx`

**Features:**
- ✅ **Enhanced UI**: Beautiful download section
- ✅ **File info display**: Version, size, platform
- ✅ **Dual download options**: Button + direct link
- ✅ **Loading states**: Progress indicators

## 📦 Build Process

### **Electron App Build:**
```bash
# Navigate to electron app
cd electron-app

# Install dependencies
npm install

# Build for macOS
npm run build:mac

# Result: releases/Time Tracker-1.0.0-arm64.dmg
```

### **Build Script:**
```bash
# Use the automated build script
./scripts/build-electron.sh
```

## 🚀 Usage

### **For Employees:**
1. **Login** to the web UI
2. **Navigate** to Dashboard page
3. **View** download information (version, size, platform)
4. **Click** "Download Desktop App" button
5. **Install** the downloaded DMG file

### **For Administrators:**
1. **Build** the Electron app: `./scripts/build-electron.sh`
2. **Verify** the DMG file exists: `electron-app/releases/`
3. **Test** the download in web UI
4. **Monitor** download logs in backend

## 📊 File Information

### **Current Build:**
- **File Name**: `Time Tracker-1.0.0-arm64.dmg`
- **Platform**: macOS (ARM64)
- **Version**: 1.0.0
- **Size**: ~90 MB
- **Location**: `electron-app/releases/`

### **Build Configuration:**
```json
{
  "build": {
    "appId": "com.timetracker.desktop",
    "productName": "Time Tracker",
    "files": [
      "main.js",
      "src/**/*",
      "renderer/**/*",
      "node_modules/**/*"
    ],
    "mac": {
      "category": "public.app-category.productivity",
      "target": "dmg"
    }
  }
}
```

## 🔄 API Endpoints

### **Download Endpoints:**
```
GET /api/v1/downloads/desktop-app
- Downloads the DMG file
- Sets proper headers for file download
- Streams file efficiently

GET /api/v1/downloads/desktop-app/info
- Returns file information
- Includes version, size, platform
- Used for UI display
```

### **Response Format (Info):**
```json
{
  "fileName": "Time Tracker-1.0.0-arm64.dmg",
  "fileSize": 94371840,
  "fileSizeFormatted": "90.0 MB",
  "version": "1.0.0",
  "platform": "macOS (ARM64)",
  "lastModified": "2024-01-15T10:30:00.000Z",
  "downloadUrl": "/api/v1/downloads/desktop-app"
}
```

## 🛠️ Development

### **Building Updates:**
1. **Update** Electron app code
2. **Run** build script: `./scripts/build-electron.sh`
3. **Verify** new DMG file
4. **Test** download in web UI

### **Testing:**
- **File existence**: Check if DMG exists
- **Download functionality**: Test both download methods
- **Error handling**: Test with missing file
- **UI responsiveness**: Test loading states

### **Monitoring:**
- **Download logs**: Backend console logs
- **File access**: Check file permissions
- **User feedback**: Monitor download success rates

## 🔧 Configuration

### **Backend Settings:**
```javascript
// File path configuration
const appPath = path.join(__dirname, '../electron-app/releases/Time Tracker-1.0.0-arm64.dmg');

// Download headers
res.setHeader('Content-Type', 'application/octet-stream');
res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
res.setHeader('Content-Length', fileSize);
```

### **Frontend Settings:**
```javascript
// Download repository configuration
const downloadUrl = `${api.defaults.baseURL}/downloads/desktop-app`;
const infoUrl = `${api.defaults.baseURL}/downloads/desktop-app/info`;
```

## 📈 Future Enhancements

### **Multi-Platform Support:**
- **Windows**: Add `.exe` builds
- **Linux**: Add `.AppImage` builds
- **Auto-detection**: Detect user's platform

### **Version Management:**
- **Auto-updates**: Check for newer versions
- **Version comparison**: Show update notifications
- **Rollback support**: Previous version downloads

### **Analytics:**
- **Download tracking**: Count downloads
- **Platform stats**: Track user platforms
- **Success rates**: Monitor download success

## 🚨 Troubleshooting

### **Common Issues:**

**1. File Not Found:**
```bash
# Check if DMG exists
ls -la electron-app/releases/Time\ Tracker-1.0.0-arm64.dmg
```

**2. Build Failures:**
```bash
# Clean and rebuild
cd electron-app
rm -rf node_modules
npm install
npm run build:mac
```

**3. Download Errors:**
- Check backend logs for file access errors
- Verify file permissions
- Test direct download URL

**4. UI Issues:**
- Check browser console for errors
- Verify API endpoints are accessible
- Test with different browsers

## 📚 Key Files

### **Backend:**
- `backend/routes/downloads.js` - Download API routes
- `backend/server.js` - Route registration

### **Frontend:**
- `web-vite-ui/src/repository/downloadRepository.js` - Download client
- `web-vite-ui/src/pages/DashboardPage.jsx` - Download UI

### **Electron App:**
- `electron-app/package.json` - Build configuration
- `electron-app/releases/` - Built DMG files
- `scripts/build-electron.sh` - Build automation

---

*This system provides a complete solution for distributing the Electron desktop app through the web UI, with proper error handling, progress tracking, and user-friendly interface.* 