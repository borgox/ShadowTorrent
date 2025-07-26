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
    maxConnections: 800, // Increased from 500 for even better performance
    uploadLimit: 0,
    downloadLimit: 0,
    enableDHT: true,
    enableUTP: true,
    privacy: {
      enablePEX: true,  // Enable PEX for better peer discovery
      enableLSD: true,  // Enable LSD for local peer discovery
      anonymousMode: false // Disable anonymous mode for better performance
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
    maxConns: settings.maxConnections, // Max peer connections
    dht: settings.enableDHT,
    lsd: settings.privacy.enableLSD,
    pex: settings.privacy.enablePEX,
    utp: settings.enableUTP,
    
    // Enhanced performance settings
    downloadLimit: settings.downloadLimit > 0 ? settings.downloadLimit * 1024 : -1,
    uploadLimit: settings.uploadLimit > 0 ? settings.uploadLimit * 1024 : -1,
    
    // Aggressive peer discovery
    dhtOpts: {
      bootstrap: [
        'router.bittorrent.com:6881',
        'dht.transmissionbt.com:6881',
        'router.utorrent.com:6881',
        'dht.libtorrent.org:25401',
        'router.silotis.us:6881'
      ]
    },
    
    tracker: {
      announce: settings.privacy.anonymousMode ? [] : [
        // Tier 1 - Most reliable trackers
        'udp://tracker.opentrackr.org:1337/announce',
        'udp://open.stealth.si:80/announce',
        'udp://tracker.tiny-vps.com:6969/announce',
        'udp://fasttracker.foreverpirates.co:6969/announce',
        
        // Tier 2 - Additional reliable trackers
        'udp://tracker.torrent.eu.org:451/announce',
        'udp://explodie.org:6969/announce',
        'udp://tracker.cyberia.is:6969/announce',
        'udp://ipv4.tracker.harry.lu:80/announce',
        'udp://tracker.uw0.xyz:6969/announce',
        
        // Tier 3 - Backup trackers
        'udp://opentor.org:2710/announce',
        'udp://tracker.dler.org:6969/announce',
        'udp://exodus.desync.com:6969/announce',
        'udp://movies.zsw.ca:6969/announce',
        'udp://tracker1.bt.moack.co.kr:80/announce',
        'udp://valakas.rollo.dnsabr.com:2710/announce',
        'udp://tracker.zerobytes.xyz:1337/announce',
        'udp://inferno.demonoid.is:3391/announce',
        'udp://tracker.torrentbay.to:6969/announce',
        'udp://tracker.therarbg.com:6969/announce',
        
        // HTTP/HTTPS trackers as fallback
        'https://tracker.nanoha.org:443/announce',
        'https://tracker.lilithraws.cf:443/announce',
        'http://tracker.opentrackr.org:1337/announce'
      ],
      getAnnounceOpts: () => ({
        numwant: 300, // Request even more peers (increased from 200)
        uploaded: 0,
        downloaded: 0,
        compact: 1
      })
    },
    
    // WebRTC settings for better connectivity
    webSeeds: true,
    
    // More aggressive timeout settings
    pieceTimeout: 30000, // 30 seconds
    chunkTimeout: 10000,  // 10 seconds
    
    // Enable more advanced features
    blocklist: null // Disable blocklist for maximum connectivity
  });

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
  // Performance optimizations for individual torrents
  torrent.maxWebConns = 15; // Increased max web seed connections
  
  // More aggressive connection settings
  torrent.strategy = 'sequential'; // Try sequential downloading for better streaming
  
  torrent.on('wire', (wire) => {
    // Optimize wire protocol
    wire.setKeepAlive(true);
    wire.setTimeout(60000); // Increased timeout to 60 seconds
    
    // Request more pieces at once for better throughput
    wire.requests.maxLength = 250; // Increased from default
    
    // Enable extended messaging for better peer communication
    if (wire.extended) {
      wire.extended('ut_metadata', { msg_type: 0, piece: 0 });
    }
  });

  torrent.on('download', () => {
    sendTorrentUpdate();
    // Save state less frequently for better performance
    if (Math.random() < 0.1) { // Only 10% of the time
      saveTorrentState();
    }
  });

  torrent.on('upload', () => {
    sendTorrentUpdate();
    // Save state less frequently for better performance
    if (Math.random() < 0.1) { // Only 10% of the time
      saveTorrentState();
    }
  });

  torrent.on('ready', () => {
    if (!isProduction) console.log(`Torrent ready: ${torrent.name} (${torrent.files.length} files)`);
    
    // Set higher priority for popular files
    torrent.files.forEach((file, index) => {
      if (file.length > 1024 * 1024) { // Files larger than 1MB
        file.select(index); // Prioritize larger files
      }
    });
    
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
    
    // Enhanced torrent options for better performance
    const torrentOptions = {
      path: downloadPath,
      maxWebConns: 15, // Max web seed connections
      announce: [
        // Add additional trackers to the torrent for better peer discovery
        'udp://tracker.opentrackr.org:1337/announce',
        'udp://open.stealth.si:80/announce',
        'udp://tracker.tiny-vps.com:6969/announce',
        'udp://fasttracker.foreverpirates.co:6969/announce',
        'udp://tracker.torrent.eu.org:451/announce',
        'udp://explodie.org:6969/announce',
        'udp://tracker.cyberia.is:6969/announce',
        'udp://ipv4.tracker.harry.lu:80/announce',
        'udp://tracker.uw0.xyz:6969/announce',
        'udp://opentor.org:2710/announce'
      ],
      // Force higher piece selection priority
      strategy: 'sequential',
      ...options
    };
    
    const torrent = torrentClient.add(torrentId, torrentOptions);
    
    // Immediately try to maximize connections
    torrent.on('ready', () => {
      // Force maximum peer connections for this torrent
      if (torrent.discovery) {
        torrent.discovery.setInterval(1000); // More frequent peer discovery
      }
      
      // Select all files by default for faster overall completion
      torrent.files.forEach((file, index) => {
        file.select(index);
      });
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
      // First pause the torrent to stop all activity
      if (typeof torrent.pause === 'function') {
        torrent.pause();
      }
      
      // Wait a moment for operations to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Properly destroy the torrent with callback
      await new Promise((resolve, reject) => {
        if (typeof torrent.destroy === 'function') {
          torrent.destroy((err) => {
            if (err) {
              console.error('Error destroying torrent:', err);
              reject(err);
            } else {
              resolve();
            }
          });
        } else {
          // Fallback: remove from client
          try {
            torrentClient.remove(torrent);
            resolve();
          } catch (removeErr) {
            reject(removeErr);
          }
        }
      });
      
      // Optional: Delete files if requested
      if (deleteFiles && torrent.files) {
        const fs = require('fs').promises;
        const path = require('path');
        
        try {
          for (const file of torrent.files) {
            const filePath = path.join(torrent.path, file.path);
            try {
              await fs.unlink(filePath);
            } catch (fileErr) {
              console.warn('Could not delete file:', filePath, fileErr.message);
            }
          }
          
          // Try to remove empty directory
          try {
            await fs.rmdir(path.join(torrent.path, torrent.name));
          } catch (dirErr) {
            // Directory might not be empty, that's okay
          }
        } catch (deleteErr) {
          console.warn('Error deleting files:', deleteErr.message);
        }
      }
      
      saveTorrentState(); // Update persistence
      sendTorrentUpdate();
      return { success: true };
    }
    return { success: false, error: 'Torrent not found' };
  } catch (error) {
    console.error('Remove torrent error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('pause-torrent', async (event, infoHash) => {
  try {
    const torrent = torrentClient.get(infoHash);
    if (torrent) {
      if (typeof torrent.pause === 'function') {
        torrent.pause();
        // Also close all peer connections
        if (torrent.wires) {
          torrent.wires.forEach(wire => {
            if (wire.destroy) wire.destroy();
          });
        }
      } else {
        // Alternative: set paused property
        torrent.paused = true;
      }
      saveTorrentState(); // Update persistence
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
      if (typeof torrent.resume === 'function') {
        torrent.resume();
      } else {
        // Alternative: set paused property
        torrent.paused = false;
      }
      saveTorrentState(); // Update persistence
      sendTorrentUpdate();
      return { success: true };
    }
    return { success: false, error: 'Torrent not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Force stop torrent - more aggressive than pause
ipcMain.handle('force-stop-torrent', async (event, infoHash) => {
  try {
    const torrent = torrentClient.get(infoHash);
    if (torrent) {
      // First pause if available
      if (typeof torrent.pause === 'function') {
        torrent.pause();
      }
      
      // Destroy all wire connections
      if (torrent.wires) {
        torrent.wires.forEach(wire => {
          if (wire.destroy) {
            wire.destroy();
          }
        });
        torrent.wires.length = 0; // Clear the array
      }
      
      // Stop all discovery
      if (torrent.discovery) {
        torrent.discovery.stop();
      }
      
      // Clear any pending requests
      if (torrent._selections) {
        torrent._selections.clear();
      }
      
      // Mark as paused
      torrent.paused = true;
      
      saveTorrentState();
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
