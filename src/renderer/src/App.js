import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import TorrentList from './components/TorrentList';
import Settings from './components/Settings';
import Statistics from './components/Statistics';
import AddTorrent from './components/AddTorrent';
import GlobalStyle, { darkTheme } from './styles/GlobalStyle';
import { AppContainer, MainContent } from './styles/AppStyles';

// Smart security measures (non-aggressive)
const isProduction = process.env.NODE_ENV === 'production' || !process.env.NODE_ENV;

if (isProduction) {
  // Disable right-click context menu (after DOM loads)
  document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('contextmenu', e => e.preventDefault());
    
    // Disable text selection for security
    document.addEventListener('selectstart', e => e.preventDefault());
    
    // Block common developer shortcuts (non-breaking)
    document.addEventListener('keydown', (e) => {
      if (
        e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault();
        return false;
      }
    });
  });
}

function App() {
  const [torrents, setTorrents] = useState([]);
  const [currentView, setCurrentView] = useState('all');
  const [settings, setSettings] = useState({});
  const [showAddTorrent, setShowAddTorrent] = useState(false);
  const [globalStats, setGlobalStats] = useState({
    totalDownloadSpeed: 0,
    totalUploadSpeed: 0,
    totalDownloaded: 0,
    totalUploaded: 0,
    activeTorrents: 0,
    totalTorrents: 0
  });

  const loadTorrents = useCallback(async () => {
    try {
      const torrentData = await window.electronAPI.getTorrents();
      setTorrents(torrentData);
      updateGlobalStats(torrentData);
    } catch (error) {
      console.error('Failed to load torrents:', error);
    }
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      const settingsData = await window.electronAPI.getSettings();
      setSettings(settingsData);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }, []);

  useEffect(() => {
    // Load initial data
    loadTorrents();
    loadSettings();

    // Set up event listeners
    window.electronAPI.onTorrentsUpdate((event, updatedTorrents) => {
      setTorrents(updatedTorrents);
      updateGlobalStats(updatedTorrents);
    });

    window.electronAPI.onTorrentComplete((event, data) => {
      console.log('Torrent completed:', data.name);
      // You could show a notification here
    });

    window.electronAPI.onTorrentError((event, data) => {
      console.error('Torrent error:', data);
      // You could show an error notification here
    });

    // Cleanup
    return () => {
      window.electronAPI.removeAllListeners('torrents-update');
      window.electronAPI.removeAllListeners('torrent-complete');
      window.electronAPI.removeAllListeners('torrent-error');
    };
  }, [loadTorrents, loadSettings]);

  // Drag and drop functionality
  useEffect(() => {
    if (!settings.ui?.enableDragEverywhere) return;

    const handleDragOver = (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    };

    const handleDrop = async (e) => {
      e.preventDefault();
      
      const files = Array.from(e.dataTransfer.files);
      const text = e.dataTransfer.getData('text');
      
      // Handle dropped files (torrent files)
      for (const file of files) {
        if (file.name.endsWith('.torrent')) {
          const arrayBuffer = await file.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          try {
            const result = await window.electronAPI.addTorrent(uint8Array);
            if (result.success) {
              console.log('Torrent added successfully');
            } else {
              console.error('Failed to add torrent:', result.error);
            }
          } catch (error) {
            console.error('Error adding torrent:', error);
          }
        }
      }
      
      // Handle dropped text (magnet links)
      if (text && (text.startsWith('magnet:') || text.startsWith('http'))) {
        try {
          const result = await window.electronAPI.addTorrent(text);
          if (result.success) {
            console.log('Torrent added successfully');
          } else {
            console.error('Failed to add torrent:', result.error);
          }
        } catch (error) {
          console.error('Error adding torrent:', error);
        }
      }
    };

    if (settings.ui?.enableDragEverywhere) {
      document.addEventListener('dragover', handleDragOver);
      document.addEventListener('drop', handleDrop);
    }

    return () => {
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('drop', handleDrop);
    };
  }, [settings.ui?.enableDragEverywhere]);

  const updateGlobalStats = (torrentData) => {
    const stats = torrentData.reduce((acc, torrent) => {
      acc.totalDownloadSpeed += torrent.downloadSpeed || 0;
      acc.totalUploadSpeed += torrent.uploadSpeed || 0;
      acc.totalDownloaded += torrent.downloaded || 0;
      acc.totalUploaded += torrent.uploaded || 0;
      if (!torrent.paused && !torrent.done) {
        acc.activeTorrents += 1;
      }
      return acc;
    }, {
      totalDownloadSpeed: 0,
      totalUploadSpeed: 0,
      totalDownloaded: 0,
      totalUploaded: 0,
      activeTorrents: 0,
      totalTorrents: torrentData.length
    });

    setGlobalStats(stats);
  };

  const handleAddTorrent = async (torrentId, options) => {
    try {
      const result = await window.electronAPI.addTorrent(torrentId, options);
      if (result.success) {
        setShowAddTorrent(false);
        loadTorrents(); // Refresh the list
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Failed to add torrent:', error);
      throw error;
    }
  };

  const handleRemoveTorrent = async (infoHash, deleteFiles = false) => {
    try {
      const result = await window.electronAPI.removeTorrent(infoHash, deleteFiles);
      if (result.success) {
        loadTorrents();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Failed to remove torrent:', error);
      throw error;
    }
  };

  const handlePauseTorrent = async (infoHash) => {
    try {
      await window.electronAPI.pauseTorrent(infoHash);
    } catch (error) {
      console.error('Failed to pause torrent:', error);
    }
  };

  const handleForceStopTorrent = async (infoHash) => {
    try {
      await window.electronAPI.forceStopTorrent(infoHash);
    } catch (error) {
      console.error('Failed to force stop torrent:', error);
    }
  };

  const handleResumeTorrent = async (infoHash) => {
    try {
      await window.electronAPI.resumeTorrent(infoHash);
    } catch (error) {
      console.error('Failed to resume torrent:', error);
    }
  };

  const handleUpdateSettings = async (newSettings) => {
    try {
      await window.electronAPI.updateSettings(newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  };

  const filteredTorrents = torrents.filter(torrent => {
    switch (currentView) {
      case 'downloading':
        return !torrent.done && !torrent.paused;
      case 'completed':
        return torrent.done;
      case 'paused':
        return torrent.paused;
      case 'seeding':
        return torrent.done && !torrent.paused;
      default:
        return true;
    }
  });

  return (
    <ThemeProvider theme={darkTheme}>
      <GlobalStyle />
      <HashRouter>
        <AppContainer>
          <Sidebar 
            currentView={currentView}
            onViewChange={setCurrentView}
            onAddTorrent={() => setShowAddTorrent(true)}
            globalStats={globalStats}
          />
          <MainContent>
            <Routes>
              <Route 
                path="/" 
                element={
                  <TorrentList 
                    torrents={filteredTorrents}
                    onRemove={handleRemoveTorrent}
                    onPause={handlePauseTorrent}
                    onForceStop={handleForceStopTorrent}
                    onResume={handleResumeTorrent}
                    currentView={currentView}
                  />
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <Settings 
                    settings={settings}
                    onUpdateSettings={handleUpdateSettings}
                  />
                } 
              />
              <Route 
                path="/statistics" 
                element={
                  <Statistics 
                    torrents={torrents}
                    globalStats={globalStats}
                  />
                } 
              />
            </Routes>
          </MainContent>
          {showAddTorrent && (
            <AddTorrent
              onAdd={handleAddTorrent}
              onClose={() => setShowAddTorrent(false)}
              settings={settings}
            />
          )}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#2a2a2a',
                color: '#ffffff',
                border: '1px solid #444',
              },
              success: {
                iconTheme: {
                  primary: '#00d4aa',
                  secondary: '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ff4757',
                  secondary: '#ffffff',
                },
              },
            }}
          />
        </AppContainer>
      </HashRouter>
    </ThemeProvider>
  );
}

export default App;
