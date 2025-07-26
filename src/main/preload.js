const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Torrent operations
  addTorrent: (torrentId, options) => ipcRenderer.invoke('add-torrent', torrentId, options),
  removeTorrent: (infoHash, deleteFiles) => ipcRenderer.invoke('remove-torrent', infoHash, deleteFiles),
  pauseTorrent: (infoHash) => ipcRenderer.invoke('pause-torrent', infoHash),
  resumeTorrent: (infoHash) => ipcRenderer.invoke('resume-torrent', infoHash),
  forceStopTorrent: (infoHash) => ipcRenderer.invoke('force-stop-torrent', infoHash),
  getTorrents: () => ipcRenderer.invoke('get-torrents'),

  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  updateSettings: (settings) => ipcRenderer.invoke('update-settings', settings),
  selectDownloadFolder: () => ipcRenderer.invoke('select-download-folder'),

  // System operations
  openFile: (filePath) => ipcRenderer.invoke('open-file', filePath),
  showInFolder: (filePath) => ipcRenderer.invoke('show-in-folder', filePath),

  // Event listeners
  onTorrentsUpdate: (callback) => ipcRenderer.on('torrents-update', callback),
  onTorrentComplete: (callback) => ipcRenderer.on('torrent-complete', callback),
  onTorrentError: (callback) => ipcRenderer.on('torrent-error', callback),

  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),

  // Utility
  getVersion: () => process.versions.electron,
  getPlatform: () => process.platform
});
