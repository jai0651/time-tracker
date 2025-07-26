# 🚀 Development Guide - Time Tracker Electron App

## Hot Reloading Setup

This Electron app now includes hot reloading for a development experience similar to Vite or nodemon!

### 🎯 Quick Start

```bash
# Method 1: Using npm script
npm run dev

# Method 2: Using the development script
./dev.sh

# Method 3: Direct electron command
electron . --dev
```

### 🔥 What's Hot Reloaded

- **Main Process** (`main.js`): App restarts automatically
- **Renderer Process** (`renderer/`): Browser window reloads automatically
- **HTML/CSS/JS**: Changes reflect immediately
- **Configuration**: `dev.config.js` changes trigger reload

### 📁 File Structure

```
electron-app/
├── main.js              # Main process (hot reloaded)
├── dev.config.js        # Development configuration
├── dev.sh              # Development startup script
├── renderer/
│   ├── index.html      # Main UI (hot reloaded)
│   ├── renderer.js     # Renderer logic (hot reloaded)
│   └── styles.css      # Styles (hot reloaded)
└── package.json        # Dependencies and scripts
```

### ⚙️ Development Configuration

Edit `dev.config.js` to customize hot reloading:

```javascript
module.exports = {
  watchRenderer: true,        // Watch renderer files
  debug: true,               // Enable debug logging
  watchPatterns: [           // Files to watch
    'renderer/**/*',
    'main.js'
  ],
  ignorePatterns: [          // Files to ignore
    'node_modules/**/*',
    'releases/**/*'
  ]
};
```

### 🛠️ Available Scripts

```bash
npm run dev          # Start with hot reloading
npm run dev:watch    # Alias for dev (same as above)
npm start           # Start without hot reloading
npm run build       # Build for production
npm run build:mac   # Build for macOS
npm run build:win   # Build for Windows
```

### 🔍 Development Features

- **Hot Reloading**: Changes reflect immediately
- **DevTools**: Automatically opens in development mode
- **Console Logging**: Enhanced logging for debugging
- **Error Handling**: Graceful fallback if hot reloading fails

### 🐛 Troubleshooting

If hot reloading doesn't work:

1. **Check console**: Look for error messages
2. **Restart app**: Close and run `npm run dev` again
3. **Clear cache**: Delete `node_modules` and run `npm install`
4. **Check permissions**: Ensure `dev.sh` is executable (`chmod +x dev.sh`)

### 📝 Development Tips

- **Save files**: Changes are detected automatically
- **DevTools**: Use F12 or Cmd+Option+I to open DevTools
- **Console**: Check terminal for hot reloading status
- **Performance**: Hot reloading is only active in development mode

### 🎉 Happy Coding!

Your changes will now reflect immediately, making development much faster and more enjoyable! 