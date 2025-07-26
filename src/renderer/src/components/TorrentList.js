import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { 
  Play, 
  Pause, 
  Trash2, 
  FolderOpen, 
  MoreHorizontal,
  Download,
  Upload,
  Users,
  Clock,
  Check
} from 'lucide-react';
import prettyBytes from 'pretty-bytes';
import { Header, HeaderTitle, ContentArea, EmptyState, EmptyStateIcon, EmptyStateTitle, EmptyStateText } from '../styles/AppStyles';
import ConfirmDialog from './ConfirmDialog';

const TorrentGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  overflow: hidden;
`;

const TorrentRow = styled.div`
  background: ${props => props.theme.colors.surface};
  padding: ${props => props.theme.spacing.md};
  display: grid;
  grid-template-columns: 1fr auto;
  gap: ${props => props.theme.spacing.md};
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
  }
`;

const TorrentInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
  min-width: 0;
`;

const TorrentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const TorrentName = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
`;

const TorrentStatus = styled.span`
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
  background: ${props => {
    switch (props.status) {
      case 'downloading': return props.theme.colors.info;
      case 'seeding': return props.theme.colors.success;
      case 'paused': return props.theme.colors.warning;
      case 'completed': return props.theme.colors.success;
      default: return props.theme.colors.textMuted;
    }
  }};
  color: ${props => props.theme.colors.background};
`;

const ProgressBar = styled.div`
  height: 4px;
  background: ${props => props.theme.colors.background};
  border-radius: 2px;
  overflow: hidden;
  margin: ${props => props.theme.spacing.xs} 0;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${props => props.downloading ? props.theme.colors.info : props.theme.colors.success};
  width: ${props => props.progress * 100}%;
  transition: width 0.3s ease;
  position: relative;

  ${props => props.downloading && `
    background: linear-gradient(
      90deg,
      ${props.theme.colors.info} 0%,
      ${props.theme.colors.primary} 50%,
      ${props.theme.colors.info} 100%
    );
    background-size: 40px 100%;
    animation: progress 1s linear infinite;
  `}
`;

const TorrentStats = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.lg};
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const StatGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const TorrentActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const ActionButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: ${props => props.theme.borderRadius.sm};
  border: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.surface};
    border-color: ${props => props.theme.colors.primary};
  }

  &.primary {
    background: ${props => props.theme.colors.primary};
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.background};

    &:hover {
      background: ${props => props.theme.colors.primaryHover};
    }
  }

  &.danger {
    &:hover {
      background: ${props => props.theme.colors.error};
      border-color: ${props => props.theme.colors.error};
      color: white;
    }
  }
`;

const ContextMenu = styled.div`
  position: fixed;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  box-shadow: ${props => props.theme.shadows.lg};
  z-index: 1000;
  min-width: 180px;
`;

const ContextMenuItem = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: none;
  border: none;
  color: ${props => props.theme.colors.text};
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  font-size: 0.875rem;
  transition: background-color 0.2s;

  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
  }

  &:first-child {
    border-radius: ${props => props.theme.borderRadius.md} ${props => props.theme.borderRadius.md} 0 0;
  }

  &:last-child {
    border-radius: 0 0 ${props => props.theme.borderRadius.md} ${props => props.theme.borderRadius.md};
  }

  &.danger {
    color: ${props => props.theme.colors.error};
  }
`;

const formatTimeRemaining = (seconds) => {
  if (!seconds || seconds === Infinity) return '∞';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return '<1m';
  }
};

const formatSpeed = (bytes) => {
  if (!bytes || bytes === 0) return '0 B/s';
  return `${prettyBytes(bytes)}/s`;
};

const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  return prettyBytes(bytes);
};

const getStatus = (torrent) => {
  if (torrent.done) return 'completed';
  if (torrent.paused) return 'paused';
  if (torrent.downloadSpeed > 0) return 'downloading';
  if (torrent.uploadSpeed > 0) return 'seeding';
  return 'idle';
};

const TorrentList = ({ torrents, onRemove, onPause, onResume, currentView }) => {
  const [contextMenu, setContextMenu] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [deleteFiles, setDeleteFiles] = useState(false);

  const handleContextMenu = useCallback((e, torrent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      torrent
    });
  }, []);

  const handleContextMenuAction = useCallback((action, torrent) => {
    setContextMenu(null);
    
    switch (action) {
      case 'pause':
        // Show confirmation for pause action
        setConfirmDialog({
          type: 'pause',
          torrent,
          title: 'Pause Torrent',
          message: 'Are you sure you want to pause this torrent?',
          confirmText: 'Pause',
          danger: false
        });
        break;
      case 'resume':
        onResume(torrent.infoHash);
        break;
      case 'remove':
        // Show confirmation for remove action
        setDeleteFiles(false);
        setConfirmDialog({
          type: 'remove',
          torrent,
          title: 'Remove Torrent',
          message: 'Are you sure you want to remove this torrent from the list?',
          confirmText: 'Remove',
          showDeleteFiles: true,
          danger: true
        });
        break;
      case 'removeWithFiles':
        // Direct remove with files (legacy - now handled by checkbox)
        setDeleteFiles(true);
        setConfirmDialog({
          type: 'remove',
          torrent,
          title: 'Remove Torrent',
          message: 'Are you sure you want to remove this torrent from the list?',
          confirmText: 'Remove',
          showDeleteFiles: true,
          danger: true
        });
        break;
      case 'openFolder':
        // Implementation would depend on your electron setup
        console.log('Open folder for:', torrent.name);
        break;
      default:
        break;
    }
  }, [onResume]);

  const handleConfirmAction = useCallback((shouldDeleteFiles) => {
    if (!confirmDialog) return;

    const { type, torrent } = confirmDialog;
    
    switch (type) {
      case 'pause':
        onPause(torrent.infoHash);
        break;
      case 'remove':
        onRemove(torrent.infoHash, shouldDeleteFiles);
        break;
      default:
        console.warn('Unknown action type:', type);
        break;
    }
    
    setConfirmDialog(null);
    setDeleteFiles(false);
  }, [confirmDialog, onPause, onRemove]);

  const handleCloseDialog = useCallback(() => {
    setConfirmDialog(null);
    setDeleteFiles(false);
  }, []);

  const handleClickOutside = useCallback((e) => {
    if (contextMenu) {
      setContextMenu(null);
    }
  }, [contextMenu]);

  React.useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [handleClickOutside]);

  if (torrents.length === 0) {
    const getEmptyMessage = () => {
      switch (currentView) {
        case 'downloading':
          return { title: 'No active downloads', text: 'Add a torrent to start downloading' };
        case 'completed':
          return { title: 'No completed torrents', text: 'Completed torrents will appear here' };
        case 'paused':
          return { title: 'No paused torrents', text: 'Paused torrents will appear here' };
        case 'seeding':
          return { title: 'Not seeding any torrents', text: 'Completed torrents being seeded will appear here' };
        default:
          return { title: 'No torrents added', text: 'Click "Add Torrent" to get started' };
      }
    };

    const message = getEmptyMessage();

    return (
      <>
        <Header>
          <HeaderTitle>Torrents</HeaderTitle>
        </Header>
        <ContentArea>
          <EmptyState>
            <EmptyStateIcon>📁</EmptyStateIcon>
            <EmptyStateTitle>{message.title}</EmptyStateTitle>
            <EmptyStateText>{message.text}</EmptyStateText>
          </EmptyState>
        </ContentArea>
      </>
    );
  }

  return (
    <>
      <Header>
        <HeaderTitle>
          Torrents ({torrents.length})
        </HeaderTitle>
      </Header>
      <ContentArea>
        <TorrentGrid>
          {torrents.map(torrent => {
            const status = getStatus(torrent);
            const isDownloading = status === 'downloading';
            
            return (
              <TorrentRow 
                key={torrent.infoHash}
                onContextMenu={(e) => handleContextMenu(e, torrent)}
              >
                <TorrentInfo>
                  <TorrentHeader>
                    <TorrentName title={torrent.name}>
                      {torrent.name}
                    </TorrentName>
                    <TorrentStatus status={status}>
                      {status === 'completed' && <Check size={12} />}
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </TorrentStatus>
                  </TorrentHeader>
                  
                  <ProgressBar>
                    <ProgressFill 
                      progress={torrent.progress}
                      downloading={isDownloading}
                    />
                  </ProgressBar>
                  
                  <TorrentStats>
                    <StatGroup>
                      <Download size={12} />
                      {formatSpeed(torrent.downloadSpeed)}
                    </StatGroup>
                    <StatGroup>
                      <Upload size={12} />
                      {formatSpeed(torrent.uploadSpeed)}
                    </StatGroup>
                    <StatGroup>
                      <Users size={12} />
                      {torrent.numPeers}
                    </StatGroup>
                    <StatGroup>
                      <Clock size={12} />
                      {formatTimeRemaining(torrent.timeRemaining)}
                    </StatGroup>
                    <StatGroup>
                      {formatBytes(torrent.downloaded)} / {formatBytes(torrent.length)}
                    </StatGroup>
                    <StatGroup>
                      Ratio: {(torrent.ratio || 0).toFixed(2)}
                    </StatGroup>
                  </TorrentStats>
                </TorrentInfo>
                
                <TorrentActions>
                  {torrent.paused ? (
                    <ActionButton 
                      className="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        onResume(torrent.infoHash);
                      }}
                      title="Resume"
                    >
                      <Play size={14} />
                    </ActionButton>
                  ) : (
                    <ActionButton 
                      onClick={(e) => {
                        e.stopPropagation();
                        onPause(torrent.infoHash);
                      }}
                      title="Pause"
                    >
                      <Pause size={14} />
                    </ActionButton>
                  )}
                  
                  <ActionButton 
                    onClick={(e) => {
                      e.stopPropagation();
                      // Open folder functionality
                    }}
                    title="Open Folder"
                  >
                    <FolderOpen size={14} />
                  </ActionButton>
                  
                  <ActionButton 
                    className="danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteFiles(false);
                      setConfirmDialog({
                        type: 'remove',
                        torrent,
                        title: 'Remove Torrent',
                        message: 'Are you sure you want to remove this torrent from the list?',
                        confirmText: 'Remove',
                        showDeleteFiles: true,
                        danger: true
                      });
                    }}
                    title="Remove"
                  >
                    <Trash2 size={14} />
                  </ActionButton>
                  
                  <ActionButton 
                    onClick={(e) => handleContextMenu(e, torrent)}
                    title="More Options"
                  >
                    <MoreHorizontal size={14} />
                  </ActionButton>
                </TorrentActions>
              </TorrentRow>
            );
          })}
        </TorrentGrid>
      </ContentArea>
      
      {contextMenu && (
        <ContextMenu 
          style={{ 
            left: contextMenu.x, 
            top: contextMenu.y 
          }}
        >
          {contextMenu.torrent.paused ? (
            <ContextMenuItem onClick={() => handleContextMenuAction('resume', contextMenu.torrent)}>
              <Play size={14} />
              Resume
            </ContextMenuItem>
          ) : (
            <ContextMenuItem onClick={() => handleContextMenuAction('pause', contextMenu.torrent)}>
              <Pause size={14} />
              Pause
            </ContextMenuItem>
          )}
          <ContextMenuItem onClick={() => handleContextMenuAction('openFolder', contextMenu.torrent)}>
            <FolderOpen size={14} />
            Open Folder
          </ContextMenuItem>
          <ContextMenuItem onClick={() => handleContextMenuAction('remove', contextMenu.torrent)}>
            <Trash2 size={14} />
            Remove Torrent
          </ContextMenuItem>
        </ContextMenu>
      )}

      <ConfirmDialog
        isOpen={!!confirmDialog}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmAction}
        title={confirmDialog?.title}
        message={confirmDialog?.message}
        torrentName={confirmDialog?.torrent?.name}
        showDeleteFiles={confirmDialog?.showDeleteFiles}
        deleteFiles={deleteFiles}
        onDeleteFilesChange={setDeleteFiles}
        confirmText={confirmDialog?.confirmText}
        danger={confirmDialog?.danger}
      />
    </>
  );
};

export default TorrentList;
