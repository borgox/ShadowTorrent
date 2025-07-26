import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for managing torrent state
 */
export const useTorrents = () => {
  const [torrents, setTorrents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTorrents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const torrentData = await window.electronAPI.getTorrents();
      setTorrents(torrentData);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load torrents:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addTorrent = useCallback(async (torrentId, options = {}) => {
    try {
      const result = await window.electronAPI.addTorrent(torrentId, options);
      if (result.success) {
        await loadTorrents();
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [loadTorrents]);

  const removeTorrent = useCallback(async (infoHash, deleteFiles = false) => {
    try {
      const result = await window.electronAPI.removeTorrent(infoHash, deleteFiles);
      if (result.success) {
        await loadTorrents();
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [loadTorrents]);

  const pauseTorrent = useCallback(async (infoHash) => {
    try {
      await window.electronAPI.pauseTorrent(infoHash);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const resumeTorrent = useCallback(async (infoHash) => {
    try {
      await window.electronAPI.resumeTorrent(infoHash);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  useEffect(() => {
    loadTorrents();

    // Set up event listeners
    const handleTorrentsUpdate = (event, updatedTorrents) => {
      setTorrents(updatedTorrents);
    };

    const handleTorrentError = (event, data) => {
      setError(data.error || data);
    };

    window.electronAPI.onTorrentsUpdate(handleTorrentsUpdate);
    window.electronAPI.onTorrentError(handleTorrentError);

    return () => {
      window.electronAPI.removeAllListeners('torrents-update');
      window.electronAPI.removeAllListeners('torrent-error');
    };
  }, [loadTorrents]);

  return {
    torrents,
    loading,
    error,
    addTorrent,
    removeTorrent,
    pauseTorrent,
    resumeTorrent,
    refetch: loadTorrents,
    clearError: () => setError(null)
  };
};

/**
 * Custom hook for managing application settings
 */
export const useSettings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const settingsData = await window.electronAPI.getSettings();
      setSettings(settingsData);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (newSettings) => {
    try {
      setError(null);
      const result = await window.electronAPI.updateSettings(newSettings);
      if (result.success) {
        setSettings(newSettings);
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    error,
    updateSettings,
    refetch: loadSettings,
    clearError: () => setError(null)
  };
};

/**
 * Custom hook for local storage
 */
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
};

/**
 * Custom hook for debounced values
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Custom hook for previous value
 */
export const usePrevious = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

/**
 * Custom hook for window size
 */
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

/**
 * Custom hook for keyboard shortcuts
 */
export const useKeyboard = (targetKey, handler) => {
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === targetKey) {
        handler(event);
      }
    };

    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [targetKey, handler]);
};

/**
 * Custom hook for outside click detection
 */
export const useOutsideClick = (ref, handler) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        handler();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, handler]);
};

/**
 * Custom hook for interval
 */
export const useInterval = (callback, delay) => {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const tick = () => {
      savedCallback.current();
    };
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};
