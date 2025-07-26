const { app, BrowserWindow, ipcMain, dialog, shell, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');
const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');

let WebTorrent;

// Production hardening - disable debugging
const isProduction = process.env.NODE_ENV === 'production' || !process.env.NODE_ENV;

if (isProduction) {
  // Disable security warnings
  process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
  
  // Disable console logging in production
  const originalConsole = console;
  console = {
    log: () => {},
    error: () => {},
    warn: () => {},
    info: () => {},
    debug: () => {},
    trace: () => {}
  };
  
  // Detect if DevTools are opened
  app.on('web-contents-created', (event, contents) => {
    contents.on('devtools-opened', () => {
      contents.closeDevTools();
    });
  });
}

// Initialize store for settings
const store = new Store({
  defaults: {
    downloadPath: app.getPath('downloads'),
    maxConnections: 200,
    uploadLimit: 0,
    downloadLimit: 0,
    enableDHT: true,
    enableUTP: true,
    privacy: {
      enablePEX: false,
      enableLSD: false,
      anonymousMode: true
    },
    ui: {
      theme: 'dark',
      compactMode: false,
      showNotifications: true,
      enableDragEverywhere: true
    },
    activeTorrents: [] // Store active torrents for persistence
  }
});

let mainWindow;
let torrentClient;
let httpServer;
let wsServer;

// Initialize WebTorrent client with privacy settings
async function initializeTorrentClient() {
  if (!WebTorrent) {
    WebTorrent = (await import('webtorrent')).default;
  }
  
  const settings = store.get();
  
  torrentClient = new WebTorrent({
    maxConns: settings.maxConnections,
    dht: settings.enableDHT,
    lsd: settings.privacy.enableLSD,
    pex: settings.privacy.enablePEX,
    utp: settings.enableUTP,
    tracker: {
      announce: settings.privacy.anonymousMode ? [] : undefined,
      getAnnounceOpts: () => ({
        numwant: 50,
        uploaded: 0,
        downloaded: 0
      })
    }
  });

  // Set up bandwidth limits
  if (settings.uploadLimit > 0) {
    torrentClient.throttleUpload(settings.uploadLimit * 1024);
  }
  if (settings.downloadLimit > 0) {
    torrentClient.throttleDownload(settings.downloadLimit * 1024);
  }

  // Client event handlers
  torrentClient.on('error', (err) => {
    if (!isProduction) console.error('WebTorrent error:', err);
    sendToRenderer('torrent-error', err.message);
  });

  torrentClient.on('torrent', (torrent) => {
    if (!isProduction) console.log('Torrent added:', torrent.name);
    setupTorrentHandlers(torrent);
    saveTorrentState();
    sendTorrentUpdate();
  });

  // Restore previously active torrents
  await restoreTorrents();
}

// Set up handlers for individual torrents
function setupTorrentHandlers(torrent) {
  torrent.on('download', () => {
    sendTorrentUpdate();
    saveTorrentState();
  });

  torrent.on('upload', () => {
    sendTorrentUpdate();
    saveTorrentState();
  });

  torrent.on('done', () => {
    if (!isProduction) console.log('Torrent finished:', torrent.name);
    sendToRenderer('torrent-complete', {
      name: torrent.name,
      infoHash: torrent.infoHash
    });
    saveTorrentState();
    sendTorrentUpdate();
  });

  torrent.on('error', (err) => {
    if (!isProduction) console.error('Torrent error:', err);
    sendToRenderer('torrent-error', {
      name: torrent.name,
      error: err.message
    });
  });
}

// Save torrent state for persistence
function saveTorrentState() {
  const activeTorrents = torrentClient.torrents.map(torrent => ({
    magnetURI: torrent.magnetURI,
    infoHash: torrent.infoHash,
    name: torrent.name,
    paused: torrent.paused,
    downloadPath: torrent.path,
    progress: torrent.progress
  }));
  
  store.set('activeTorrents', activeTorrents);
}

// Restore torrents from previous session
async function restoreTorrents() {
  const activeTorrents = store.get('activeTorrents', []);
  const downloadPath = store.get('downloadPath');
  
  for (const torrentInfo of activeTorrents) {
    try {
      // Skip completed torrents unless they're seeding
      if (torrentInfo.progress >= 1) {
        // Check if files still exist for seeding
        const torrentPath = path.join(torrentInfo.downloadPath || downloadPath, torrentInfo.name);
        if (!fs.existsSync(torrentPath)) {
          continue;
        }
      }
      
      const torrent = torrentClient.add(torrentInfo.magnetURI, {
        path: torrentInfo.downloadPath || downloadPath
      });
      
      // Restore paused state
      if (torrentInfo.paused && torrent.pause) {
        torrent.pause();
      }
      
    } catch (error) {
      if (!isProduction) console.error('Failed to restore torrent:', torrentInfo.name, error);
    }
  }
}

// Send torrent updates to renderer
function sendTorrentUpdate() {
  const torrents = torrentClient.torrents.map(torrent => ({
    infoHash: torrent.infoHash,
    name: torrent.name || 'Unknown',
    progress: torrent.progress,
    downloaded: torrent.downloaded,
    uploaded: torrent.uploaded,
    downloadSpeed: torrent.downloadSpeed,
    uploadSpeed: torrent.uploadSpeed,
    numPeers: torrent.numPeers,
    ratio: torrent.uploaded / torrent.downloaded || 0,
    timeRemaining: torrent.timeRemaining,
    length: torrent.length,
    files: torrent.files.map(file => ({
      name: file.name,
      length: file.length,
      downloaded: file.downloaded,
      progress: file.progress
    })),
    paused: torrent.paused,
    done: torrent.done
  }));

  sendToRenderer('torrents-update', torrents);
  
  // Send to WebSocket clients
  if (wsServer) {
    wsServer.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'torrents-update',
          data: torrents
        }));
      }
    });
  }
}

// Send message to renderer process
function sendToRenderer(channel, data) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, data);
  }
}

// Create main window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      devTools: !isProduction, // Disable DevTools in production
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false
    },
    titleBarStyle: 'hiddenInset',
    autoHideMenuBar: true, // Hide menu bar (View, Edit, Tools, etc.)
    menuBarVisible: false, // Completely hide menu bar
    backgroundColor: '#1a1a1a',
    show: false,
    icon: path.join(__dirname, '../renderer/public/favicon.ico') // Use your custom favicon
  });

  // Production hardening
  if (isProduction) {
    // Disable right-click context menu only for non-torrent elements
    mainWindow.webContents.on('context-menu', (e, params) => {
      // Allow context menu if clicking on specific elements (like torrents)
      // The renderer will handle torrent-specific context menus
      if (!params.selectionText && !params.linkURL && !params.hasImageContents) {
        e.preventDefault();
      }
    });
    
    // Disable F12 and other developer shortcuts
    mainWindow.webContents.on('before-input-event', (event, input) => {
      if (input.key === 'F12' || 
          (input.control && input.shift && input.key === 'I') ||
          (input.control && input.shift && input.key === 'J') ||
          (input.control && input.key === 'U')) {
        event.preventDefault();
      }
    });
    
    // Block external navigation
    mainWindow.webContents.on('will-navigate', (event, url) => {
      if (!url.startsWith('file://') && !url.startsWith('http://localhost')) {
        event.preventDefault();
      }
    });
  }

  // Load the React app
  const isDev = process.env.NODE_ENV === 'development';
  
  // Force production mode if not explicitly set as development
  if (!isDev && !process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
  }
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load from the built files
    const indexPath = path.join(__dirname, '../renderer/build/index.html');
    mainWindow.loadFile(indexPath);
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Add error handling for loading issues
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    if (!isProduction) console.log('Failed to load:', errorCode, errorDescription, validatedURL);
  });

  mainWindow.webContents.on('dom-ready', () => {
    if (!isProduction) console.log('DOM ready event fired');
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Set up HTTP server for torrent streaming
function setupHttpServer() {
  const app = express();
  app.use(cors());

  app.get('/stream/:infoHash/:fileIndex', (req, res) => {
    const { infoHash, fileIndex } = req.params;
    const torrent = torrentClient.get(infoHash);
    
    if (!torrent) {
      return res.status(404).send('Torrent not found');
    }

    const file = torrent.files[parseInt(fileIndex)];
    if (!file) {
      return res.status(404).send('File not found');
    }

    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : file.length - 1;
      const chunksize = (end - start) + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${file.length}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'application/octet-stream'
      });

      file.createReadStream({ start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': file.length,
        'Content-Type': 'application/octet-stream'
      });
      file.createReadStream().pipe(res);
    }
  });

  httpServer = app.listen(8888, () => {
    if (!isProduction) console.log('HTTP server running on port 8888');
  });

  // Set up WebSocket server
  wsServer = new WebSocket.Server({ port: 8889 });
  if (!isProduction) console.log('WebSocket server running on port 8889');
}

// IPC handlers
ipcMain.handle('add-torrent', async (event, torrentId, options = {}) => {
  try {
    const downloadPath = options.path || store.get('downloadPath');
    
    const torrent = torrentClient.add(torrentId, {
      path: downloadPath,
      ...options
    });

    return {
      success: true,
      infoHash: torrent.infoHash
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
});

ipcMain.handle('remove-torrent', async (event, infoHash, deleteFiles = false) => {
  try {
    const torrent = torrentClient.get(infoHash);
    if (torrent) {
      torrent.destroy({ destroyStore: deleteFiles });
      saveTorrentState(); // Update persistence
      sendTorrentUpdate();
      return { success: true };
    }
    return { success: false, error: 'Torrent not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('pause-torrent', async (event, infoHash) => {
  try {
    const torrent = torrentClient.get(infoHash);
    if (torrent) {
      torrent.pause();
      sendTorrentUpdate();
      return { success: true };
    }
    return { success: false, error: 'Torrent not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('resume-torrent', async (event, infoHash) => {
  try {
    const torrent = torrentClient.get(infoHash);
    if (torrent) {
      torrent.resume();
      sendTorrentUpdate();
      return { success: true };
    }
    return { success: false, error: 'Torrent not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-torrents', async () => {
  const torrents = torrentClient.torrents.map(torrent => ({
    infoHash: torrent.infoHash,
    name: torrent.name || 'Unknown',
    progress: torrent.progress,
    downloaded: torrent.downloaded,
    uploaded: torrent.uploaded,
    downloadSpeed: torrent.downloadSpeed,
    uploadSpeed: torrent.uploadSpeed,
    numPeers: torrent.numPeers,
    ratio: torrent.uploaded / torrent.downloaded || 0,
    timeRemaining: torrent.timeRemaining,
    length: torrent.length,
    files: torrent.files.map(file => ({
      name: file.name,
      length: file.length,
      downloaded: file.downloaded,
      progress: file.progress
    })),
    paused: torrent.paused,
    done: torrent.done
  }));

  return torrents;
});

ipcMain.handle('get-settings', async () => {
  return store.store;
});

ipcMain.handle('update-settings', async (event, newSettings) => {
  store.set(newSettings);
  
  // Reinitialize client if needed
  if (torrentClient) {
    torrentClient.destroy();
  }
  await initializeTorrentClient();
  
  return { success: true };
});

ipcMain.handle('select-download-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Download Folder',
    properties: ['openDirectory']
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('open-file', async (event, filePath) => {
  shell.openPath(filePath);
});

ipcMain.handle('show-in-folder', async (event, filePath) => {
  shell.showItemInFolder(filePath);
});

// App event handlers
app.whenReady().then(async () => {
  // Disable application menu completely
  Menu.setApplicationMenu(null);
  
  // Production hardening (non-aggressive)
  if (isProduction) {
    // Set clean app name
    app.setName('ShadowTorrent');
  }
  
  createWindow();
  await initializeTorrentClient();
  setupHttpServer();

  // Send initial torrent update
  setTimeout(() => {
    sendTorrentUpdate();
  }, 1000);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (torrentClient) {
      torrentClient.destroy();
    }
    if (httpServer) {
      httpServer.close();
    }
    if (wsServer) {
      wsServer.close();
    }
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle second instance
app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

// Make this app a single instance app
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}
