# VASTECH Construction Data Manager - Desktop App

Convert your web application to a desktop application using Electron.

## 📁 Project Structure

```
vastech-construction-desktop/
├── package.json              # Node.js project configuration
├── main.js                   # Electron main process
├── preload.js               # Preload script for security
├── renderer/                # Web app files
│   ├── index.html
│   ├── style.css
│   └── app.js
├── assets/                  # Icons and resources
│   ├── icon.ico            # Windows icon
│   ├── icon.icns           # macOS icon
│   └── icon.png            # Linux icon
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation Steps

1. **Create project directory:**
```bash
mkdir vastech-construction-desktop
cd vastech-construction-desktop
```

2. **Initialize the project:**
```bash
npm init -y
```

3. **Install Electron dependencies:**
```bash
npm install --save-dev electron@^26.2.1 electron-builder@^24.6.4
npm install electron-store@^8.1.0
```

4. **Copy all provided files to the project directory**

5. **Run the application:**
```bash
npm start
```

## 🔨 Building Executables

### Build for Windows (.exe):
```bash
npm run build-win
```

### Build for macOS (.dmg):
```bash
npm run build-mac
```

### Build for Linux (.AppImage):
```bash
npm run build-linux
```

### Build for all platforms:
```bash
npm run build
```

## 📦 Distribution

Built executables will be in the `dist/` folder:
- Windows: `dist/VASTECH Construction Data Manager Setup.exe`
- macOS: `dist/VASTECH Construction Data Manager.dmg`
- Linux: `dist/VASTECH Construction Data Manager.AppImage`

## ✨ Features

- **Offline First**: Works without internet connection
- **Local Data Storage**: All data saved locally on your computer
- **Auto-updater Ready**: Can be configured for automatic updates
- **Cross-platform**: Runs on Windows, macOS, and Linux
- **Native Feel**: Desktop integration with native menus and shortcuts

## 🔧 Configuration

The `package.json` includes all necessary configuration for:
- Application metadata
- Build targets for different platforms
- Icon configuration
- Installer settings

## 📋 System Requirements

### Windows:
- Windows 10 or later
- 64-bit architecture

### macOS:
- macOS 10.15 (Catalina) or later
- Intel or Apple Silicon

### Linux:
- Ubuntu 18.04 or equivalent
- 64-bit architecture

## 🛠️ Development

### Development Mode:
```bash
npm start
```

### Enable Developer Tools:
The app includes developer tools access via `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (macOS).

## 📝 Notes

- Data is automatically saved to the user's local storage
- The app maintains the same functionality as the web version
- Excel export works offline using the bundled library
- No internet connection required after installation

## 🔐 Security

- Uses Electron's context isolation for security
- Preload script ensures safe communication between main and renderer processes
- No remote content loading - everything bundled locally