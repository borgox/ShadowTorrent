import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { useDropzone } from 'react-dropzone';
import { X, Upload, Link, FolderOpen, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
`;

const Modal = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  border: 1px solid ${props => props.theme.colors.border};
  box-shadow: ${props => props.theme.shadows.lg};
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  animation: slideIn 0.3s ease-out;
`;

const ModalHeader = styled.div`
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ModalTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const CloseButton = styled.button`
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
    background: ${props => props.theme.colors.surfaceHover};
    border-color: ${props => props.theme.colors.primary};
  }
`;

const ModalBody = styled.div`
  padding: ${props => props.theme.spacing.lg};
  max-height: 60vh;
  overflow-y: auto;
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const Tab = styled.button`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  background: none;
  border: none;
  color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.textSecondary};
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  border-bottom: 2px solid ${props => props.active ? props.theme.colors.primary : 'transparent'};
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};

  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

const DropZone = styled.div`
  border: 2px dashed ${props => props.isDragActive ? props.theme.colors.primary : props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xxl};
  text-align: center;
  background: ${props => props.isDragActive ? props.theme.colors.background : 'transparent'};
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: ${props => props.theme.spacing.lg};

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.background};
  }
`;

const DropZoneIcon = styled.div`
  font-size: 3rem;
  margin-bottom: ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.textMuted};
`;

const DropZoneText = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: ${props => props.theme.spacing.sm};
  font-weight: 500;
`;

const DropZoneSubtext = styled.p`
  color: ${props => props.theme.colors.textMuted};
  font-size: 0.875rem;
`;

const FormGroup = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const Label = styled.label`
  display: block;
  font-weight: 500;
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.sm};
  font-size: 0.875rem;
`;

const Input = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.text};
  font-size: 0.875rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }

  &::placeholder {
    color: ${props => props.theme.colors.textMuted};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.text};
  font-size: 0.875rem;
  font-family: ${props => props.theme.fonts.mono};
  resize: vertical;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }

  &::placeholder {
    color: ${props => props.theme.colors.textMuted};
  }
`;

const PathSelector = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
`;

const PathInput = styled(Input)`
  flex: 1;
`;

const BrowseButton = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  font-size: 0.875rem;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
    border-color: ${props => props.theme.colors.primary};
  }
`;

const ModalFooter = styled.div`
  padding: ${props => props.theme.spacing.lg};
  border-top: 1px solid ${props => props.theme.colors.border};
  display: flex;
  gap: ${props => props.theme.spacing.md};
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};

  &.primary {
    background: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.background};
    border: 1px solid ${props => props.theme.colors.primary};

    &:hover:not(:disabled) {
      background: ${props => props.theme.colors.primaryHover};
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &.secondary {
    background: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text};
    border: 1px solid ${props => props.theme.colors.border};

    &:hover {
      background: ${props => props.theme.colors.surfaceHover};
    }
  }
`;

const AddTorrent = ({ onAdd, onClose, settings }) => {
  const [activeTab, setActiveTab] = useState('file');
  const [magnetUrl, setMagnetUrl] = useState('');
  const [downloadPath, setDownloadPath] = useState(settings.downloadPath || '');
  const [isLoading, setIsLoading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && file.name.endsWith('.torrent')) {
      try {
        setIsLoading(true);
        const arrayBuffer = await file.arrayBuffer();
        const torrentData = new Uint8Array(arrayBuffer);
        await onAdd(torrentData, { path: downloadPath });
        toast.success('Torrent added successfully!');
      } catch (error) {
        toast.error(`Failed to add torrent: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    } else {
      toast.error('Please select a valid .torrent file');
    }
  }, [onAdd, downloadPath]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/x-bittorrent': ['.torrent']
    },
    multiple: false
  });

  const handleMagnetSubmit = async () => {
    if (!magnetUrl.trim()) {
      toast.error('Please enter a magnet link');
      return;
    }

    if (!magnetUrl.startsWith('magnet:')) {
      toast.error('Please enter a valid magnet link');
      return;
    }

    try {
      setIsLoading(true);
      await onAdd(magnetUrl, { path: downloadPath });
      toast.success('Torrent added successfully!');
    } catch (error) {
      toast.error(`Failed to add torrent: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBrowsePath = async () => {
    try {
      const path = await window.electronAPI.selectDownloadFolder();
      if (path) {
        setDownloadPath(path);
      }
    } catch (error) {
      toast.error('Failed to select folder');
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <Modal>
        <ModalHeader>
          <ModalTitle>
            <Plus size={20} />
            Add Torrent
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={16} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <TabContainer>
            <Tab active={activeTab === 'file'} onClick={() => setActiveTab('file')}>
              <Upload size={16} />
              Torrent File
            </Tab>
            <Tab active={activeTab === 'magnet'} onClick={() => setActiveTab('magnet')}>
              <Link size={16} />
              Magnet Link
            </Tab>
          </TabContainer>

          {activeTab === 'file' && (
            <DropZone {...getRootProps()} isDragActive={isDragActive}>
              <input {...getInputProps()} />
              <DropZoneIcon>📁</DropZoneIcon>
              <DropZoneText>
                {isDragActive
                  ? 'Drop the torrent file here'
                  : 'Drag & drop a torrent file here, or click to browse'
                }
              </DropZoneText>
              <DropZoneSubtext>
                Supports .torrent files
              </DropZoneSubtext>
            </DropZone>
          )}

          {activeTab === 'magnet' && (
            <FormGroup>
              <Label>Magnet Link</Label>
              <TextArea
                value={magnetUrl}
                onChange={(e) => setMagnetUrl(e.target.value)}
                placeholder="magnet:?xt=urn:btih:..."
              />
            </FormGroup>
          )}

          <FormGroup>
            <Label>Download Location</Label>
            <PathSelector>
              <PathInput
                value={downloadPath}
                onChange={(e) => setDownloadPath(e.target.value)}
                placeholder="Select download folder..."
              />
              <BrowseButton onClick={handleBrowsePath}>
                <FolderOpen size={16} />
                Browse
              </BrowseButton>
            </PathSelector>
          </FormGroup>
        </ModalBody>

        <ModalFooter>
          <Button className="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            className="primary" 
            onClick={activeTab === 'magnet' ? handleMagnetSubmit : undefined}
            disabled={isLoading || (activeTab === 'magnet' && !magnetUrl.trim())}
          >
            {isLoading ? 'Adding...' : 'Add Torrent'}
          </Button>
        </ModalFooter>
      </Modal>
    </Overlay>
  );
};

export default AddTorrent;
