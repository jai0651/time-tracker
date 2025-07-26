# Time Tracker Desktop App

A cross-platform desktop application for time tracking, built with Electron.

## Features

- **Secure Login**: Authenticate with your email and password
- **Time Tracking**: Start and stop timer sessions
- **Automatic Submission**: Time entries are automatically submitted to the backend
- **Session Management**: View current session details and duration
- **Cross-Platform**: Works on Windows, macOS, and Linux

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running (default: http://localhost:3000)

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure API URL:**
   ```bash
   cp env.example .env
   ```
   Edit `.env` and set your backend API URL:
   ```
   API_URL=http://localhost:3000
   ```

3. **Start the app in development mode:**
   ```bash
   npm run dev
   ```

## Usage

### Development
- `npm start` - Start the app
- `npm run dev` - Start with DevTools open

### Building for Distribution

**Build for all platforms:**
```bash
npm run build
```

**Build for specific platform:**
```bash
npm run build:mac    # macOS (.dmg)
npm run build:win    # Windows (.exe)
```

**Build artifacts will be created in the `releases/` folder.**

## Project Structure

```
electron-app/
├── main.js              # Main Electron process
├── renderer/            # Renderer process files
│   ├── index.html      # Main HTML file
│   ├── styles.css      # Application styles
│   └── renderer.js     # Renderer JavaScript
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

## API Integration

The desktop app integrates with your backend API:

- **Login**: `POST /auth/login`
- **Time Entries**: `POST /time-entries`

### Time Entry Format
```json
{
  "startTs": 1640995200000,
  "endTs": 1640998800000
}
```

## Troubleshooting

### Common Issues

1. **App won't start:**
   - Ensure Node.js is installed
   - Check that all dependencies are installed: `npm install`

2. **Can't connect to backend:**
   - Verify your backend is running
   - Check the API_URL in your `.env` file
   - Ensure the backend is accessible from the desktop app

3. **Build fails:**
   - Ensure you have the necessary build tools for your platform
   - For Windows builds on macOS/Linux, you may need Wine
   - For macOS builds on non-macOS systems, you may need additional setup

### Development Tips

- Use `npm run dev` to open DevTools for debugging
- Check the console for error messages
- The app stores the JWT token in localStorage for persistence

## License

MIT License - see LICENSE file for details. 