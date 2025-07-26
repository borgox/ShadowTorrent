const { app, BrowserWindow } = require('electron');
const path = require('path');

// Mock Electron modules
jest.mock('electron', () => ({
  app: {
    whenReady: jest.fn(() => Promise.resolve()),
    on: jest.fn(),
    quit: jest.fn(),
    isPackaged: false,
    getPath: jest.fn((name) => {
      if (name === 'userData') return '/tmp/test-userdata';
      return '/tmp/test-app';
    })
  },
  BrowserWindow: jest.fn().mockImplementation(() => ({
    loadURL: jest.fn(() => Promise.resolve()),
    loadFile: jest.fn(() => Promise.resolve()),
    on: jest.fn(),
    webContents: {
      openDevTools: jest.fn(),
      on: jest.fn(),
      send: jest.fn()
    },
    maximize: jest.fn(),
    show: jest.fn()
  })),
  ipcMain: {
    handle: jest.fn(),
    on: jest.fn()
  }
}));

// Mock electron-store
jest.mock('electron-store', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn((key, defaultValue) => defaultValue),
    set: jest.fn(),
    has: jest.fn(() => false),
    delete: jest.fn(),
    clear: jest.fn()
  }));
});

// Mock WebTorrent
jest.mock('webtorrent', () => {
  return jest.fn().mockImplementation(() => ({
    add: jest.fn(),
    remove: jest.fn(),
    destroy: jest.fn(),
    torrents: [],
    downloadSpeed: 0,
    uploadSpeed: 0,
    progress: 0,
    on: jest.fn()
  }));
});

describe('ShadowTorrent Main Process', () => {
  let main;
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset modules to ensure clean state
    jest.resetModules();
  });

  test('should create main window when app is ready', async () => {
    // Import after mocks are set up
    main = require('../main.js');
    
    // Simulate app ready event
    const readyCallback = app.whenReady.mock.calls[0] ? app.whenReady.mock.calls[0][0] : null;
    if (readyCallback) {
      await readyCallback();
    }

    expect(BrowserWindow).toHaveBeenCalled();
  });

  test('should initialize electron store', () => {
    const Store = require('electron-store');
    expect(Store).toHaveBeenCalled();
  });

  test('should handle app activation on macOS', () => {
    main = require('../main.js');
    
    // Find the 'activate' event handler
    const activateHandler = app.on.mock.calls.find(call => call[0] === 'activate');
    expect(activateHandler).toBeDefined();
    
    if (activateHandler) {
      const callback = activateHandler[1];
      // Simulate no windows open
      BrowserWindow.getAllWindows = jest.fn(() => []);
      callback();
    }
  });

  test('should quit app when all windows are closed (non-macOS)', () => {
    // Mock process.platform
    Object.defineProperty(process, 'platform', {
      value: 'win32'
    });
    
    main = require('../main.js');
    
    // Find the 'window-all-closed' event handler
    const windowsClosedHandler = app.on.mock.calls.find(call => call[0] === 'window-all-closed');
    expect(windowsClosedHandler).toBeDefined();
    
    if (windowsClosedHandler) {
      const callback = windowsClosedHandler[1];
      callback();
      expect(app.quit).toHaveBeenCalled();
    }
  });
});
