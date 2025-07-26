import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useTorrents, useSettings } from '../hooks';

// Action types
const ActionTypes = {
  SET_CURRENT_VIEW: 'SET_CURRENT_VIEW',
  SET_SHOW_ADD_TORRENT: 'SET_SHOW_ADD_TORRENT',
  SET_GLOBAL_STATS: 'SET_GLOBAL_STATS',
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  SET_THEME: 'SET_THEME',
  SET_COMPACT_MODE: 'SET_COMPACT_MODE'
};

// Initial state
const initialState = {
  currentView: 'all',
  showAddTorrent: false,
  globalStats: {
    totalDownloadSpeed: 0,
    totalUploadSpeed: 0,
    totalDownloaded: 0,
    totalUploaded: 0,
    activeTorrents: 0,
    totalTorrents: 0
  },
  notifications: [],
  theme: 'dark',
  compactMode: false
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_CURRENT_VIEW:
      return { ...state, currentView: action.payload };
    
    case ActionTypes.SET_SHOW_ADD_TORRENT:
      return { ...state, showAddTorrent: action.payload };
    
    case ActionTypes.SET_GLOBAL_STATS:
      return { ...state, globalStats: action.payload };
    
    case ActionTypes.SET_NOTIFICATIONS:
      return { ...state, notifications: action.payload };
    
    case ActionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, {
          id: Date.now(),
          ...action.payload
        }]
      };
    
    case ActionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
    
    case ActionTypes.SET_THEME:
      return { ...state, theme: action.payload };
    
    case ActionTypes.SET_COMPACT_MODE:
      return { ...state, compactMode: action.payload };
    
    default:
      return state;
  }
};

// Create contexts
const AppStateContext = createContext();
const AppDispatchContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { torrents, loading: torrentsLoading, error: torrentsError, ...torrentActions } = useTorrents();
  const { settings, loading: settingsLoading, error: settingsError, ...settingActions } = useSettings();

  // Update global stats when torrents change
  useEffect(() => {
    const stats = torrents.reduce((acc, torrent) => {
      acc.totalDownloadSpeed += torrent.downloadSpeed || 0;
      acc.totalUploadSpeed += torrent.uploadSpeed || 0;
      acc.totalDownloaded += torrent.downloaded || 0;
      acc.totalUploaded += torrent.uploaded || 0;
      if (!torrent.paused && !torrent.done) {
        acc.activeTorrents += 1;
      }
      acc.totalTorrents += 1;
      return acc;
    }, {
      totalDownloadSpeed: 0,
      totalUploadSpeed: 0,
      totalDownloaded: 0,
      totalUploaded: 0,
      activeTorrents: 0,
      totalTorrents: torrents.length
    });

    dispatch({ type: ActionTypes.SET_GLOBAL_STATS, payload: stats });
  }, [torrents]);

  // Update theme and compact mode from settings
  useEffect(() => {
    if (settings.ui) {
      dispatch({ type: ActionTypes.SET_THEME, payload: settings.ui.theme || 'dark' });
      dispatch({ type: ActionTypes.SET_COMPACT_MODE, payload: settings.ui.compactMode || false });
    }
  }, [settings]);

  const contextValue = {
    // State
    ...state,
    torrents,
    settings,
    loading: torrentsLoading || settingsLoading,
    error: torrentsError || settingsError,
    
    // Actions
    ...torrentActions,
    ...settingActions,
    
    // UI Actions
    setCurrentView: (view) => dispatch({ type: ActionTypes.SET_CURRENT_VIEW, payload: view }),
    setShowAddTorrent: (show) => dispatch({ type: ActionTypes.SET_SHOW_ADD_TORRENT, payload: show }),
    
    // Notification actions
    addNotification: (notification) => dispatch({ type: ActionTypes.ADD_NOTIFICATION, payload: notification }),
    removeNotification: (id) => dispatch({ type: ActionTypes.REMOVE_NOTIFICATION, payload: id }),
    
    // Theme actions
    setTheme: (theme) => dispatch({ type: ActionTypes.SET_THEME, payload: theme }),
    setCompactMode: (compact) => dispatch({ type: ActionTypes.SET_COMPACT_MODE, payload: compact })
  };

  return (
    <AppStateContext.Provider value={contextValue}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
};

// Custom hooks to use the context
export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
};

export const useAppDispatch = () => {
  const context = useContext(AppDispatchContext);
  if (context === undefined) {
    throw new Error('useAppDispatch must be used within an AppProvider');
  }
  return context;
};

// Action creators
export const actions = {
  setCurrentView: (view) => ({ type: ActionTypes.SET_CURRENT_VIEW, payload: view }),
  setShowAddTorrent: (show) => ({ type: ActionTypes.SET_SHOW_ADD_TORRENT, payload: show }),
  setGlobalStats: (stats) => ({ type: ActionTypes.SET_GLOBAL_STATS, payload: stats }),
  addNotification: (notification) => ({ type: ActionTypes.ADD_NOTIFICATION, payload: notification }),
  removeNotification: (id) => ({ type: ActionTypes.REMOVE_NOTIFICATION, payload: id }),
  setTheme: (theme) => ({ type: ActionTypes.SET_THEME, payload: theme }),
  setCompactMode: (compact) => ({ type: ActionTypes.SET_COMPACT_MODE, payload: compact })
};
