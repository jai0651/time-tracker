# Screenshot Feature Implementation

## Overview

The screenshot feature automatically captures screenshots during work activities to provide visual context for time tracking. Screenshots are taken at regular intervals and uploaded to the backend with proper permission tracking.

## Features

### Automatic Screenshot Capture
- Screenshots are taken automatically when a timer is started
- Development interval: every 20 seconds (for testing)
- Production interval: every 5 minutes
- Screenshots are uploaded to the backend immediately after capture
- Permission status is tracked and displayed to the user

### Permission Handling
- Automatically requests screen recording permissions when starting a timer
- Shows user-friendly dialog explaining why permissions are needed
- Gracefully handles permission denial with clear messaging
- Creates placeholder screenshots when permissions are denied
- Displays permission status in the UI with retry option
- Permission flags are properly set in screenshot metadata

### UI Integration
- Screenshot status indicator shows:
  - Number of screenshots taken
  - Permission status (✅ or ❌)
  - Screenshot interval
- Status updates in real-time during timer sessions

## Technical Implementation

### Backend API
The backend already has a complete screenshots API with the following endpoints:
- `POST /api/v1/screenshots` - Upload single screenshot
- `POST /api/v1/screenshots/batch` - Upload multiple screenshots
- `GET /api/v1/screenshots/my` - Get user's screenshots
- `GET /api/v1/screenshots/activity/:activityId` - Get screenshots for activity
- `GET /api/v1/screenshots/stats` - Get screenshot statistics
- `DELETE /api/v1/screenshots/:id` - Delete screenshot
- `PUT /api/v1/screenshots/:id` - Update screenshot metadata

### Database Schema
The `Screenshot` model includes:
- `activityId` - Links to work activity
- `employeeId` - Employee who took the screenshot
- `imageUrl` - Base64 encoded image data
- `hasPermissions` - Whether app had proper permissions
- `permissionError` - Description of permission issues
- `capturedAt` - When screenshot was taken
- `width`, `height`, `fileSize`, `mimeType` - Image metadata

### Electron App Implementation

#### ScreenshotService (`src/services/screenshot-service.js`)
- Handles screenshot capture via IPC calls to main process
- Manages screenshot intervals and uploads
- Tracks permission status and screenshot count
- Provides methods for linking screenshots to activities

#### IPC Handlers (`src/main/ipc-handlers.js`)
- `capture-screenshot` - Captures screenshot using Electron's desktopCapturer
- `check-screen-permissions` - Checks if app has screen recording permissions

#### UI Integration
- Screenshot status display in timer screen
- Real-time updates of screenshot count and permission status
- Visual indicators for permission status

## Usage

### Starting Screenshot Capture
1. Start a timer for any shift
2. Screenshot capture begins automatically
3. Screenshots are taken every 5 minutes
4. Status is displayed in the timer screen

### Permission Setup (macOS)
1. When starting a timer, the app will automatically request screen recording permission
2. A dialog will appear explaining why the permission is needed
3. Choose "Grant Permission" to allow screenshots
4. If denied, you can retry later using the "Retry Permission" button
5. Alternatively, go to System Preferences > Security & Privacy > Privacy > Screen Recording
6. Add the Time Tracker app to the list of allowed apps

### Viewing Screenshots
- Screenshots are automatically linked to activities when saved
- View screenshots through the backend API
- Screenshot statistics available via API

## Configuration

### Screenshot Interval
The development interval is 20 seconds for testing. To change this:

```javascript
// In the ScreenshotService
this.screenshotIntervalMinutes = 0.33; // 20 seconds (development)
this.screenshotIntervalMinutes = 5; // 5 minutes (production)
```

### Screenshot Quality
Screenshot quality is controlled by the `thumbnailSize` parameter in the IPC handler:

```javascript
// In ipc-handlers.js
thumbnailSize: { width: 1920, height: 1080 } // Adjust resolution
```

## Error Handling

### Permission Denied
- App continues to function normally
- Placeholder screenshots are created
- Permission status is clearly displayed to user
- No crashes or interruptions

### Network Issues
- Screenshots are captured locally
- Upload retries are handled gracefully
- Failed uploads don't affect timer functionality

### Storage Issues
- Screenshots are uploaded immediately
- No local storage required
- Backend handles all storage concerns

## Security Considerations

- Screenshots are uploaded to secure backend
- Permission status is tracked and logged
- No screenshots are stored locally
- User is informed of all screenshot activity
- Screenshots are linked to specific activities for audit trail

## Future Enhancements

- Configurable screenshot intervals
- Screenshot preview in UI
- Manual screenshot capture option
- Screenshot compression for bandwidth optimization
- Screenshot annotation features 