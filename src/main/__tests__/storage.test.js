const Store = require('electron-store');

// Mock electron-store
jest.mock('electron-store');

describe('Settings and Storage Tests', () => {
  let store;
  let mockStore;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock store instance
    mockStore = {
      get: jest.fn((key, defaultValue) => {
        const defaults = {
          'downloadPath': '/tmp/downloads',
          'maxConnections': 500,
          'enablePEX': true,
          'enableLSD': true,
          'enableDHT': true,
          'anonymousMode': false,
          'uploadLimit': 0,
          'downloadLimit': 0
        };
        return defaults[key] || defaultValue;
      }),
      set: jest.fn(),
      has: jest.fn((key) => {
        const existingKeys = ['downloadPath', 'maxConnections'];
        return existingKeys.includes(key);
      }),
      delete: jest.fn(),
      clear: jest.fn(),
      size: 8
    };

    Store.mockImplementation(() => mockStore);
    store = new Store();
  });

  test('should initialize electron-store', () => {
    expect(Store).toHaveBeenCalled();
    expect(store).toBeDefined();
  });

  test('should get default settings values', () => {
    expect(store.get('maxConnections', 200)).toBe(500);
    expect(store.get('enablePEX', false)).toBe(true);
    expect(store.get('enableLSD', false)).toBe(true);
    expect(store.get('anonymousMode', true)).toBe(false);
  });

  test('should save settings', () => {
    const newSettings = {
      maxConnections: 800,
      downloadPath: '/new/path',
      uploadLimit: 1024
    };

    Object.keys(newSettings).forEach(key => {
      store.set(key, newSettings[key]);
    });

    expect(store.set).toHaveBeenCalledWith('maxConnections', 800);
    expect(store.set).toHaveBeenCalledWith('downloadPath', '/new/path');
    expect(store.set).toHaveBeenCalledWith('uploadLimit', 1024);
  });

  test('should check if settings exist', () => {
    expect(store.has('downloadPath')).toBe(true);
    expect(store.has('nonExistentSetting')).toBe(false);
  });

  test('should delete specific setting', () => {
    store.delete('maxConnections');
    expect(store.delete).toHaveBeenCalledWith('maxConnections');
  });

  test('should clear all settings', () => {
    store.clear();
    expect(store.clear).toHaveBeenCalled();
  });

  test('should handle torrent state persistence', () => {
    const torrentData = {
      magnetURI: 'magnet:?xt=urn:btih:test-hash',
      name: 'test-torrent',
      downloadPath: '/tmp/downloads/test-torrent',
      progress: 0.75,
      paused: false
    };

    store.set('torrents.test-hash', torrentData);
    expect(store.set).toHaveBeenCalledWith('torrents.test-hash', torrentData);

    const retrieved = store.get('torrents.test-hash');
    expect(store.get).toHaveBeenCalledWith('torrents.test-hash');
  });

  test('should validate settings bounds', () => {
    // Test max connections bounds
    const validateMaxConnections = (value) => {
      return Math.max(50, Math.min(2000, value));
    };

    expect(validateMaxConnections(10)).toBe(50);  // Too low
    expect(validateMaxConnections(500)).toBe(500); // Valid
    expect(validateMaxConnections(3000)).toBe(2000); // Too high
  });

  test('should handle performance settings', () => {
    const performanceSettings = {
      maxConnections: 500,
      enablePEX: true,
      enableLSD: true,
      enableDHT: true,
      anonymousMode: false
    };

    // Simulate applying performance optimizations
    Object.keys(performanceSettings).forEach(key => {
      store.set(`performance.${key}`, performanceSettings[key]);
    });

    expect(store.set).toHaveBeenCalledWith('performance.maxConnections', 500);
    expect(store.set).toHaveBeenCalledWith('performance.enablePEX', true);
    expect(store.set).toHaveBeenCalledWith('performance.anonymousMode', false);
  });
});
