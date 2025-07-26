import React from 'react';
import styled, { keyframes } from 'styled-components';
import { AlertTriangle, Trash2, X } from 'lucide-react';

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
`;

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
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const Dialog = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xl};
  min-width: 400px;
  max-width: 500px;
  animation: ${slideIn} 0.2s ease-out;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const IconContainer = styled.div`
  background: ${props => props.danger ? '#dc2626' : '#f59e0b'};
  color: white;
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const Message = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.5;
  margin: 0 0 ${props => props.theme.spacing.lg} 0;
`;

const TorrentName = styled.div`
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.md};
  margin: ${props => props.theme.spacing.md} 0;
  font-family: monospace;
  font-size: 0.9rem;
  color: ${props => props.theme.colors.text};
  word-break: break-all;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  margin: ${props => props.theme.spacing.lg} 0;
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
`;

const Checkbox = styled.input`
  accent-color: #dc2626;
`;

const CheckboxLabel = styled.label`
  color: ${props => props.theme.colors.text};
  font-weight: 500;
  cursor: pointer;
  user-select: none;
`;

const Actions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.md};
  border: 1px solid ${props => props.theme.colors.border};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  min-width: 100px;

  ${props => props.primary ? `
    background: #dc2626;
    color: white;
    border-color: #dc2626;

    &:hover:not(:disabled) {
      background: #b91c1c;
      border-color: #b91c1c;
    }
  ` : `
    background: ${props.theme.colors.surface};
    color: ${props.theme.colors.text};

    &:hover:not(:disabled) {
      background: ${props.theme.colors.surfaceHover};
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: ${props => props.theme.spacing.md};
  right: ${props => props.theme.spacing.md};
  background: none;
  border: none;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.sm};
  
  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
    color: ${props => props.theme.colors.text};
  }
`;

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  torrentName,
  showDeleteFiles = false,
  deleteFiles = false,
  onDeleteFilesChange,
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = false
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm(deleteFiles);
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <Dialog>
        <CloseButton onClick={onClose}>
          <X size={16} />
        </CloseButton>
        
        <Header>
          <IconContainer danger={danger}>
            {danger ? <Trash2 size={20} /> : <AlertTriangle size={20} />}
          </IconContainer>
          <Title>{title}</Title>
        </Header>

        <Message>{message}</Message>

        {torrentName && (
          <TorrentName>{torrentName}</TorrentName>
        )}

        {showDeleteFiles && (
          <CheckboxContainer>
            <Checkbox
              type="checkbox"
              id="deleteFiles"
              checked={deleteFiles}
              onChange={(e) => onDeleteFilesChange(e.target.checked)}
            />
            <CheckboxLabel htmlFor="deleteFiles">
              Also delete downloaded files from disk
            </CheckboxLabel>
          </CheckboxContainer>
        )}

        <Actions>
          <Button onClick={onClose}>
            {cancelText}
          </Button>
          <Button primary={danger} onClick={handleConfirm}>
            {confirmText}
          </Button>
        </Actions>
      </Dialog>
    </Overlay>
  );
};

export default ConfirmDialog;
