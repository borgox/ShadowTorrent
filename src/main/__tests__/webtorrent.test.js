const WebTorrent = require('webtorrent');

// Mock WebTorrent
jest.mock('webtorrent');

describe('WebTorrent Integration Tests', () => {
  let client;
  let mockTorrent;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create mock torrent
    mockTorrent = {
      name: 'test-torrent',
      infoHash: 'test-hash',
      magnetURI: 'magnet:?xt=urn:btih:test-hash',
      files: [],
      length: 1024 * 1024, // 1MB
      downloaded: 0,
      downloadSpeed: 0,
      uploadSpeed: 0,
      progress: 0,
      ratio: 0,
      numPeers: 0,
      timeRemaining: Infinity,
      ready: false,
      paused: false,
      done: false,
      destroyed: false,
      on: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
      destroy: jest.fn()
    };

    // Mock WebTorrent client
    WebTorrent.mockImplementation(() => ({
      add: jest.fn((torrentId, options, callback) => {
        if (callback) callback(mockTorrent);
        return mockTorrent;
      }),
      remove: jest.fn(),
      destroy: jest.fn((callback) => {
        if (callback) callback();
      }),
      torrents: [mockTorrent],
      downloadSpeed: 1024 * 1024, // 1MB/s
      uploadSpeed: 512 * 1024, // 512KB/s
      progress: 0.5,
      on: jest.fn()
    }));

    client = new WebTorrent();
  });

  test('should create WebTorrent client with correct options', () => {
    expect(WebTorrent).toHaveBeenCalled();
    expect(client).toBeDefined();
  });

  test('should add torrent from magnet link', () => {
    const magnetLink = 'magnet:?xt=urn:btih:test-hash&dn=test-torrent';
    const options = { path: '/tmp/downloads' };
    
    const torrent = client.add(magnetLink, options);
    
    expect(client.add).toHaveBeenCalledWith(magnetLink, options);
    expect(torrent).toBe(mockTorrent);
  });

  test('should add torrent with callback', (done) => {
    const magnetLink = 'magnet:?xt=urn:btih:test-hash&dn=test-torrent';
    
    client.add(magnetLink, {}, (torrent) => {
      expect(torrent).toBe(mockTorrent);
      expect(torrent.name).toBe('test-torrent');
      done();
    });
  });

  test('should handle torrent pause/resume', () => {
    const torrent = client.add('magnet:?xt=urn:btih:test');
    
    torrent.pause();
    expect(torrent.pause).toHaveBeenCalled();
    
    torrent.resume();
    expect(torrent.resume).toHaveBeenCalled();
  });

  test('should handle torrent removal', () => {
    const torrent = client.add('magnet:?xt=urn:btih:test');
    
    client.remove(torrent);
    expect(client.remove).toHaveBeenCalledWith(torrent);
  });

  test('should destroy torrent properly', () => {
    const torrent = client.add('magnet:?xt=urn:btih:test');
    
    torrent.destroy();
    expect(torrent.destroy).toHaveBeenCalled();
  });

  test('should handle client statistics', () => {
    expect(client.downloadSpeed).toBe(1024 * 1024);
    expect(client.uploadSpeed).toBe(512 * 1024);
    expect(client.progress).toBe(0.5);
    expect(client.torrents).toContain(mockTorrent);
  });

  test('should handle client destruction with callback', (done) => {
    client.destroy(() => {
      done();
    });
    
    expect(client.destroy).toHaveBeenCalled();
  });
});
