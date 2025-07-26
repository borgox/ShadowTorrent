import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Save, FolderOpen, Shield, Zap, Eye, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { Header, HeaderTitle, ContentArea } from '../styles/AppStyles';

const SettingsContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const SettingsSection = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  border: 1px solid ${props => props.theme.colors.border};
  padding: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.lg};
  padding-bottom: ${props => props.theme.spacing.md};
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const SectionTitle = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const SectionDescription = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.875rem;
  margin-left: auto;
  max-width: 300px;
`;

const FormGroup = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};

  &:last-child {
    margin-bottom: 0;
  }
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

  &[type="number"] {
    max-width: 150px;
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

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  cursor: pointer;
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text};
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  accent-color: ${props => props.theme.colors.primary};
`;

const CheckboxLabel = styled.span`
  flex: 1;
`;

const CheckboxDescription = styled.span`
  color: ${props => props.theme.colors.textMuted};
  font-size: 0.75rem;
  max-width: 200px;
`;

const RangeGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const RangeInput = styled.input`
  flex: 1;
  accent-color: ${props => props.theme.colors.primary};
`;

const RangeValue = styled.span`
  min-width: 80px;
  text-align: right;
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${props => props.theme.spacing.xl};
  padding-top: ${props => props.theme.spacing.lg};
  border-top: 1px solid ${props => props.theme.colors.border};
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

const formatSpeed = (kbps) => {
  if (kbps === 0) return 'Unlimited';
  if (kbps < 1024) return `${kbps} KB/s`;
  return `${(kbps / 1024).toFixed(1)} MB/s`;
};

const Settings = ({ settings, onUpdateSettings }) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
    setHasChanges(false);
  }, [settings]);

  const updateSetting = (path, value) => {
    const keys = path.split('.');
    const newSettings = { ...localSettings };
    
    let current = newSettings;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    
    setLocalSettings(newSettings);
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onUpdateSettings(localSettings);
      setHasChanges(false);
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error(`Failed to save settings: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setLocalSettings(settings);
    setHasChanges(false);
  };

  const handleBrowsePath = async () => {
    try {
      const path = await window.electronAPI.selectDownloadFolder();
      if (path) {
        updateSetting('downloadPath', path);
      }
    } catch (error) {
      toast.error('Failed to select folder');
    }
  };

  return (
    <>
      <Header>
        <HeaderTitle>Settings</HeaderTitle>
      </Header>
      <ContentArea>
        <SettingsContainer>
          {/* General Settings */}
          <SettingsSection>
            <SectionHeader>
              <Download size={20} />
              <SectionTitle>General</SectionTitle>
              <SectionDescription>
                Basic download and storage settings
              </SectionDescription>
            </SectionHeader>

            <FormGroup>
              <Label>Default Download Location</Label>
              <PathSelector>
                <PathInput
                  value={localSettings.downloadPath || ''}
                  onChange={(e) => updateSetting('downloadPath', e.target.value)}
                  placeholder="Select download folder..."
                />
                <BrowseButton onClick={handleBrowsePath}>
                  <FolderOpen size={16} />
                  Browse
                </BrowseButton>
              </PathSelector>
            </FormGroup>

            <FormGroup>
              <Label>Maximum Connections</Label>
              <Input
                type="number"
                value={localSettings.maxConnections || 200}
                onChange={(e) => updateSetting('maxConnections', parseInt(e.target.value))}
                min="10"
                max="1000"
              />
            </FormGroup>
          </SettingsSection>

          {/* Bandwidth Settings */}
          <SettingsSection>
            <SectionHeader>
              <Zap size={20} />
              <SectionTitle>Bandwidth</SectionTitle>
              <SectionDescription>
                Control upload and download speeds
              </SectionDescription>
            </SectionHeader>

            <FormGroup>
              <Label>Download Speed Limit</Label>
              <RangeGroup>
                <RangeInput
                  type="range"
                  min="0"
                  max="10240"
                  step="128"
                  value={localSettings.downloadLimit || 0}
                  onChange={(e) => updateSetting('downloadLimit', parseInt(e.target.value))}
                />
                <RangeValue>
                  {formatSpeed(localSettings.downloadLimit || 0)}
                </RangeValue>
              </RangeGroup>
            </FormGroup>

            <FormGroup>
              <Label>Upload Speed Limit</Label>
              <RangeGroup>
                <RangeInput
                  type="range"
                  min="0"
                  max="10240"
                  step="128"
                  value={localSettings.uploadLimit || 0}
                  onChange={(e) => updateSetting('uploadLimit', parseInt(e.target.value))}
                />
                <RangeValue>
                  {formatSpeed(localSettings.uploadLimit || 0)}
                </RangeValue>
              </RangeGroup>
            </FormGroup>
          </SettingsSection>

          {/* Privacy Settings */}
          <SettingsSection>
            <SectionHeader>
              <Shield size={20} />
              <SectionTitle>Privacy & Security</SectionTitle>
              <SectionDescription>
                Enhanced privacy and security options
              </SectionDescription>
            </SectionHeader>

            <FormGroup>
              <CheckboxGroup>
                <CheckboxItem>
                  <Checkbox
                    type="checkbox"
                    checked={localSettings.privacy?.anonymousMode || false}
                    onChange={(e) => updateSetting('privacy.anonymousMode', e.target.checked)}
                  />
                  <CheckboxLabel>Anonymous Mode</CheckboxLabel>
                  <CheckboxDescription>
                    Hide your client info from peers
                  </CheckboxDescription>
                </CheckboxItem>

                <CheckboxItem>
                  <Checkbox
                    type="checkbox"
                    checked={localSettings.enableDHT || false}
                    onChange={(e) => updateSetting('enableDHT', e.target.checked)}
                  />
                  <CheckboxLabel>Enable DHT</CheckboxLabel>
                  <CheckboxDescription>
                    Distributed hash table for peer discovery
                  </CheckboxDescription>
                </CheckboxItem>

                <CheckboxItem>
                  <Checkbox
                    type="checkbox"
                    checked={localSettings.privacy?.enablePEX || false}
                    onChange={(e) => updateSetting('privacy.enablePEX', e.target.checked)}
                  />
                  <CheckboxLabel>Enable PEX</CheckboxLabel>
                  <CheckboxDescription>
                    Peer exchange protocol
                  </CheckboxDescription>
                </CheckboxItem>

                <CheckboxItem>
                  <Checkbox
                    type="checkbox"
                    checked={localSettings.privacy?.enableLSD || false}
                    onChange={(e) => updateSetting('privacy.enableLSD', e.target.checked)}
                  />
                  <CheckboxLabel>Enable LSD</CheckboxLabel>
                  <CheckboxDescription>
                    Local service discovery
                  </CheckboxDescription>
                </CheckboxItem>

                <CheckboxItem>
                  <Checkbox
                    type="checkbox"
                    checked={localSettings.enableUTP || false}
                    onChange={(e) => updateSetting('enableUTP', e.target.checked)}
                  />
                  <CheckboxLabel>Enable μTP</CheckboxLabel>
                  <CheckboxDescription>
                    Micro transport protocol for better performance
                  </CheckboxDescription>
                </CheckboxItem>
              </CheckboxGroup>
            </FormGroup>
          </SettingsSection>

          {/* UI Settings */}
          <SettingsSection>
            <SectionHeader>
              <Eye size={20} />
              <SectionTitle>Interface</SectionTitle>
              <SectionDescription>
                Customize the user interface
              </SectionDescription>
            </SectionHeader>

            <FormGroup>
              <CheckboxGroup>
                <CheckboxItem>
                  <Checkbox
                    type="checkbox"
                    checked={localSettings.ui?.compactMode || false}
                    onChange={(e) => updateSetting('ui.compactMode', e.target.checked)}
                  />
                  <CheckboxLabel>Compact Mode</CheckboxLabel>
                  <CheckboxDescription>
                    Reduce spacing and padding
                  </CheckboxDescription>
                </CheckboxItem>

                <CheckboxItem>
                  <Checkbox
                    type="checkbox"
                    checked={localSettings.ui?.showNotifications || false}
                    onChange={(e) => updateSetting('ui.showNotifications', e.target.checked)}
                  />
                  <CheckboxLabel>Show Notifications</CheckboxLabel>
                  <CheckboxDescription>
                    Display system notifications for events
                  </CheckboxDescription>
                </CheckboxItem>

                <CheckboxItem>
                  <Checkbox
                    type="checkbox"
                    checked={localSettings.ui?.enableDragEverywhere || false}
                    onChange={(e) => updateSetting('ui.enableDragEverywhere', e.target.checked)}
                  />
                  <CheckboxLabel>Enable Drag Everywhere</CheckboxLabel>
                  <CheckboxDescription>
                    Allow dropping torrent files and magnet links anywhere in the app
                  </CheckboxDescription>
                </CheckboxItem>
              </CheckboxGroup>
            </FormGroup>
          </SettingsSection>

          <ButtonGroup>
            <Button className="secondary" onClick={handleReset} disabled={!hasChanges}>
              Reset Changes
            </Button>
            <Button 
              className="primary" 
              onClick={handleSave} 
              disabled={!hasChanges || isSaving}
            >
              <Save size={16} />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </ButtonGroup>
        </SettingsContainer>
      </ContentArea>
    </>
  );
};

export default Settings;
