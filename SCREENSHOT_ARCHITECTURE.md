# Screenshot Feature Architecture Documentation

## 📋 Overview

The screenshot feature captures user screen activity during work sessions, providing visual context for time tracking. Screenshots are taken automatically at configurable intervals and stored with permission tracking.

## 🏗️ System Architecture

### **High-Level Architecture**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Electron App  │    │   Backend API   │    │   Web UI        │
│   (Renderer)    │◄──►│   (Express.js)  │◄──►│   (React)       │
│                 │    │                 │    │                 │
│ • Screenshot    │    │ • Screenshot    │    │ • View          │
│   Capture       │    │   Storage       │    │   Screenshots   │
│ • Permission    │    │ • Analytics     │    │ • Analytics     │
│   Management    │    │ • Admin APIs    │    │ • Admin Panel   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Data Flow**
1. **Capture**: Electron app captures screen using `desktopCapturer`
2. **Compression**: Image compressed to 800×600 JPEG (70% quality)
3. **Upload**: Base64 data sent to backend API
4. **Storage**: Screenshot stored in PostgreSQL database
5. **Viewing**: Web UI displays screenshots from database

## 🗄️ Database Schema

### **Screenshot Model**
```sql
model Screenshot {
  id              String   @id @default(cuid())
  activityId      String?  // Linked activity
  employeeId      String   // Employee who took screenshot
  imageUrl        String   // Base64 data URL
  fileName        String   // Original filename
  fileSize        Int      // Size in bytes
  mimeType        String   // Image MIME type
  width           Int      // Image width
  height          Int      // Image height
  hasPermissions  Boolean  @default(false) // Permission status
  permissionError String?  // Permission error message
  capturedAt      DateTime @default(now())
  uploadedAt      DateTime @default(now())
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

## 🔧 Implementation Components

### **1. Electron App (Renderer Process)**

#### **ScreenshotService** (`electron-app/src/services/screenshot-service.js`)
```javascript
class ScreenshotService {
  // Core functionality
  async startScreenshotCapture(activityId)
  async stopScreenshotCapture()
  async captureAndUploadScreenshot(activityId)
  
  // Image processing
  async compressImageData(dataUrl) // 800×600, JPEG 70%
  getDataURLSize(dataURL)
  
  // Permission handling
  async checkScreenRecordingPermissions()
  async requestScreenPermissions()
}
```

#### **Key Features:**
- **Interval-based capture**: Configurable timing (default: 20 seconds for dev)
- **Permission management**: Automatic permission requests
- **Image compression**: Reduces payload size
- **Error handling**: Graceful fallbacks for permission denial

### **2. Electron App (Main Process)**

#### **IPC Handlers** (`electron-app/src/main/ipc-handlers.js`)
```javascript
// Screen capture using Electron's desktopCapturer
async handleCaptureScreenshot() {
  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: { width: 800, height: 600 }
  });
  return {
    imageUrl: source.thumbnail.toDataURL(),
    fileName: `screenshot_${Date.now()}.jpg`,
    // ... metadata
  };
}
```

### **3. Backend API**

#### **Routes** (`backend/routes/screenshots.js`)
```
POST   /api/v1/screenshots              # Upload screenshot
GET    /api/v1/screenshots/my           # Get user screenshots
GET    /api/v1/screenshots/admin/all    # Admin: Get all screenshots
GET    /api/v1/screenshots/admin/stats  # Admin: Get statistics
GET    /api/v1/screenshots/activity/:id # Get activity screenshots
DELETE /api/v1/screenshots/:id          # Delete screenshot
```

#### **Service Layer** (`backend/services/screenshotService.js`)
```javascript
// Core operations
async createScreenshot(screenshotData)
async getAllScreenshots(filters)
async getAllScreenshotStats(filters)

// Advanced filtering
- Employee filtering
- Date range filtering
- Permission status filtering
- File size filtering
- Sorting (capture date, file size, employee name)
```

### **4. Web UI**

#### **Admin Screenshots Page** (`web-vite-ui/src/pages/AdminScreenshotsPage.jsx`)
- **Analytics-style interface** similar to activity analytics
- **Comprehensive filtering** and sorting
- **Employee breakdown** statistics
- **Screenshot preview** functionality

#### **Components:**
- **ScreenshotFilters**: Date range, employee, permission filters
- **ScreenshotSummary**: Statistics and employee breakdown
- **ScreenshotTable**: Tabular view with thumbnails
- **ScreenshotViewer**: Modal for full-size viewing

## 💾 Storage Architecture

### **Current Approach: Base64 in Database**

#### **Storage Method:**
```javascript
// Screenshots stored as Base64 data URLs
imageUrl: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
```

#### **Compression Settings:**
- **Resolution**: 800×600 pixels (max)
- **Format**: JPEG with 70% quality
- **Base64 Overhead**: ~33% size increase

#### **Memory Analysis:**
```
Per Screenshot:
- Original: 50-150 KB
- Base64: 67-200 KB (+33% overhead)

For 1,000 screenshots:
- Base64: 67-200 MB
- File Storage: 50-150 MB + 100 KB (paths)
```

### **Advantages of Base64 Storage:**
✅ **Simplicity**: No file system management  
✅ **Reliability**: No orphaned files  
✅ **Consistency**: Atomic transactions  
✅ **Deployment**: Single database backup  

### **Disadvantages:**
❌ **Memory Overhead**: 33% size increase  
❌ **Database Size**: Larger database files  
❌ **Query Performance**: Slower with large TEXT fields  
❌ **Network Transfer**: Larger API payloads  

## 🔐 Permission Management

### **macOS Screen Recording Permissions**
```javascript
// Automatic permission request
const result = await dialog.showMessageBox({
  title: 'Screen Recording Permission Required',
  message: 'Time Tracker needs screen recording permission...',
  buttons: ['Grant Permission', 'Deny Permission', 'Learn More']
});
```

### **Permission Tracking:**
- **hasPermissions**: Boolean flag in database
- **permissionError**: Error message if denied
- **Fallback**: Placeholder image when permissions denied

## 📊 Analytics Features

### **Admin Analytics Interface**
- **Employee filtering**: Filter by specific employees
- **Date range filtering**: Custom date ranges
- **Permission filtering**: Filter by permission status
- **File size filtering**: Minimum file size requirements
- **Advanced sorting**: Multiple sort options

### **Statistics Dashboard:**
- **Total screenshots**: Overall count
- **Permission rate**: Percentage with permissions
- **File size analysis**: Total and average sizes
- **Employee breakdown**: Per-employee statistics

## 🚀 Performance Optimizations

### **Image Compression:**
```javascript
// Aggressive compression to reduce payload size
const maxWidth = 800;
const maxHeight = 600;
const quality = 0.7; // 70% JPEG quality
```

### **Payload Size Limits:**
```javascript
// 50MB limit for uploads
const maxSize = 50 * 1024 * 1024;
```

### **Database Indexing:**
```sql
-- Optimized indexes for queries
@@index([activityId])
@@index([employeeId])
@@index([capturedAt])
```

## 🔄 API Endpoints

### **Core Endpoints:**
```
POST   /screenshots                    # Upload screenshot
GET    /screenshots/my                 # User screenshots
GET    /screenshots/activity/:id       # Activity screenshots
DELETE /screenshots/:id                # Delete screenshot
```

### **Admin Endpoints:**
```
GET    /screenshots/admin/all          # All screenshots
GET    /screenshots/admin/stats        # Statistics
```

### **Query Parameters:**
```
?employeeId=123&startDate=2024-01-01&endDate=2024-01-31
?hasPermissions=true&sortBy=capturedAt&sortOrder=desc
?minFileSize=100&limit=50&offset=0
```

## 📱 UI Components

### **Screenshot Viewer Modal:**
- **Full-size preview**: Large image display
- **Detailed information**: Employee, activity, file details
- **Permission status**: Visual indicators
- **Responsive design**: Works on all screen sizes

### **Screenshot Table:**
- **Thumbnail previews**: 64×48px clickable thumbnails
- **Comprehensive data**: All screenshot metadata
- **Sorting/filtering**: Advanced data manipulation
- **Pagination**: Handle large datasets

## 🔧 Configuration

### **Development Settings:**
```javascript
// 20-second intervals for testing
this.screenshotIntervalMinutes = 0.33;
```

### **Production Settings:**
```javascript
// 5-minute intervals for production
this.screenshotIntervalMinutes = 5;
```

### **Compression Settings:**
```javascript
// Optimized for web viewing
const maxWidth = 800;
const maxHeight = 600;
const quality = 0.7;
```

## 📈 Scalability Considerations

### **Small Scale (< 1,000 screenshots):**
- ✅ **Base64 storage is fine**
- ✅ **Current approach works well**
- ✅ **Simple deployment**

### **Large Scale (> 10,000 screenshots):**
- ⚠️ **Consider file storage system**
- ⚠️ **Implement CDN for delivery**
- ⚠️ **Database optimization needed**

### **Hybrid Approach (Future):**
```javascript
// Keep metadata in database, files in storage
{
  id: "screenshot_id",
  fileName: "screenshot_123.jpg",
  filePath: "/uploads/screenshots/screenshot_123.jpg",
  fileSize: 150000,
  // ... other metadata
}
```

## 🛠️ Development Notes

### **Testing:**
- **Permission testing**: Test on macOS with screen recording
- **Payload testing**: Verify 50MB upload limits
- **Compression testing**: Check image quality vs size

### **Debugging:**
- **Console logs**: Detailed logging for troubleshooting
- **Network monitoring**: Payload size tracking
- **Permission status**: Clear permission indicators

### **Deployment:**
- **Database migration**: Screenshot table creation
- **Environment variables**: API URLs and limits
- **File system**: Ensure proper permissions

## 📚 Key Files

### **Backend:**
- `backend/prisma/schema.prisma` - Database schema
- `backend/controllers/screenshotController.js` - API controllers
- `backend/services/screenshotService.js` - Business logic
- `backend/routes/screenshots.js` - API routes

### **Electron App:**
- `electron-app/src/services/screenshot-service.js` - Core service
- `electron-app/src/main/ipc-handlers.js` - Screen capture
- `electron-app/src/renderer/app-controller.js` - UI integration

### **Web UI:**
- `web-vite-ui/src/pages/AdminScreenshotsPage.jsx` - Admin interface
- `web-vite-ui/src/components/screenshots/` - UI components
- `web-vite-ui/src/repository/screenshotRepository.js` - API client

---

*This documentation covers the complete screenshot feature architecture, implementation details, and storage approach. For questions or updates, refer to the codebase and this documentation.* 