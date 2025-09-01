// VASTECH Construction Desktop App - Preload Script
// preload.js - Secure bridge between main and renderer processes

const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs').promises;

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  
  // Data persistence methods
  store: {
    get: (key) => ipcRenderer.invoke('store-get', key),
    set: (key, value) => ipcRenderer.invoke('store-set', key, value),
    delete: (key) => ipcRenderer.invoke('store-delete', key)
  },

  // File system operations for export/import
  fs: {
    writeFile: async (filePath, data) => {
      try {
        await fs.writeFile(filePath, data, 'utf8');
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    readFile: async (filePath) => {
      try {
        const data = await fs.readFile(filePath, 'utf8');
        return { success: true, data };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
  },

  // Dialog methods
  dialog: {
    showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
    showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options)
  },

  // Menu event listeners
  onMenuAction: (callback) => {
    // Listen for menu actions from main process
    ipcRenderer.on('menu-new-entry', callback);
    ipcRenderer.on('menu-export-excel', callback);
    ipcRenderer.on('menu-export-csv', callback);
    ipcRenderer.on('menu-clear-filters', callback);
    ipcRenderer.on('menu-backup-data', callback);
    ipcRenderer.on('menu-restore-data', callback);
    ipcRenderer.on('menu-clear-data', callback);
  },

  // Remove menu event listeners
  removeMenuListeners: () => {
    ipcRenderer.removeAllListeners('menu-new-entry');
    ipcRenderer.removeAllListeners('menu-export-excel');
    ipcRenderer.removeAllListeners('menu-export-csv');
    ipcRenderer.removeAllListeners('menu-clear-filters');
    ipcRenderer.removeAllListeners('menu-backup-data');
    ipcRenderer.removeAllListeners('menu-restore-data');
    ipcRenderer.removeAllListeners('menu-clear-data');
  },

  // Platform information
  platform: process.platform,
  
  // Version information
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  },

  // Utility methods
  utils: {
    formatPath: (filePath) => {
      // Normalize path separators for different platforms
      return filePath.replace(/\\/g, '/');
    },
    
    getCurrentTimestamp: () => {
      return new Date().toISOString();
    }
  }
});

// DOM Content Loaded event
window.addEventListener('DOMContentLoaded', () => {
  // Add desktop-specific styling
  document.body.classList.add('desktop-app');
  
  // Add platform-specific class
  document.body.classList.add(`platform-${process.platform}`);
  
  // Update version info if element exists
  const versionElement = document.getElementById('app-version');
  if (versionElement) {
    versionElement.textContent = `v1.0.0 (Electron ${process.versions.electron})`;
  }
  
  // Add keyboard shortcuts info
  const keyboardShortcuts = {
    'Ctrl+N': 'New Entry',
    'Ctrl+E': 'Export to Excel',
    'Ctrl+Shift+E': 'Export to CSV',
    'Ctrl+Shift+F': 'Clear Filters',
    'F5': 'Refresh',
    'F11': 'Toggle Fullscreen',
    'Ctrl+Shift+I': 'Developer Tools'
  };
  
  // Store shortcuts info for potential help dialog
  window.keyboardShortcuts = keyboardShortcuts;
});

// Handle unhandled errors in renderer process
window.addEventListener('error', (event) => {
  console.error('Renderer error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Prevent drag and drop of files (security)
document.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.stopPropagation();
});

document.addEventListener('drop', (e) => {
  e.preventDefault();
  e.stopPropagation();
});

// Prevent context menu (optional - remove if you want right-click menu)
document.addEventListener('contextmenu', (e) => {
  // Allow context menu in development
  if (process.env.NODE_ENV !== 'development') {
    e.preventDefault();
  }
});

// Disable text selection drag (optional)
document.addEventListener('selectstart', (e) => {
  if (e.target.nodeName === 'INPUT' || e.target.nodeName === 'TEXTAREA') {
    return;
  }
  // Allow text selection in development
  if (process.env.NODE_ENV !== 'development') {
    e.preventDefault();
  }
});