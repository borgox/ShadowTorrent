import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { 
  Download, 
  Upload, 
  Play, 
  Pause, 
  CheckCircle, 
  Settings, 
  BarChart3, 
  Plus,
  Zap,
  Shield
} from 'lucide-react';
import prettyBytes from 'pretty-bytes';

const SidebarContainer = styled.div`
  width: 280px;
  background: ${props => props.theme.colors.surface};
  border-right: 1px solid ${props => props.theme.colors.border};
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const SidebarHeader = styled.div`
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const AppTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const AppSubtitle = styled.p`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textMuted};
  margin-top: ${props => props.theme.spacing.xs};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const Navigation = styled.nav`
  flex: 1;
  padding: ${props => props.theme.spacing.md} 0;
`;

const NavSection = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const NavSectionTitle = styled.h3`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${props => props.theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0 ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const NavItem = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  background: ${props => props.active ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.active ? props.theme.colors.background : props.theme.colors.text};
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  font-weight: ${props => props.active ? '600' : '400'};

  &:hover {
    background: ${props => props.active ? props.theme.colors.primaryHover : props.theme.colors.surfaceHover};
  }
`;

const NavItemCount = styled.span`
  margin-left: auto;
  font-size: 0.75rem;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.textSecondary};
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
`;

const StatsSection = styled.div`
  padding: ${props => props.theme.spacing.lg};
  border-top: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.background};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const StatCard = styled.div`
  background: ${props => props.theme.colors.surface};
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  border: 1px solid ${props => props.theme.colors.border};
`;

const StatCardLabel = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textMuted};
  margin-bottom: ${props => props.theme.spacing.xs};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const StatCardValue = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const AddTorrentButton = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.background};
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.xs};
  transition: background-color 0.2s;

  &:hover {
    background: ${props => props.theme.colors.primaryHover};
  }
`;

const formatSpeed = (bytes) => {
  if (bytes === 0) return '0 B/s';
  return `${prettyBytes(bytes)}/s`;
};

const Sidebar = ({ currentView, onViewChange, onAddTorrent, globalStats }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { id: 'all', label: 'All Torrents', icon: Download, count: globalStats.totalTorrents },
    { id: 'downloading', label: 'Downloading', icon: Play, count: globalStats.activeTorrents },
    { id: 'completed', label: 'Completed', icon: CheckCircle, count: 0 },
    { id: 'paused', label: 'Paused', icon: Pause, count: 0 },
    { id: 'seeding', label: 'Seeding', icon: Upload, count: 0 }
  ];

  const handleNavClick = (viewId) => {
    onViewChange(viewId);
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  const handlePageNavigation = (path) => {
    navigate(path);
  };

  return (
    <SidebarContainer>
      <SidebarHeader>
        <AppTitle>
          <Shield size={24} />
          ShadowTorrent
        </AppTitle>
        <AppSubtitle>
          <Zap size={12} />
          Privacy-focused • Lightning-fast
        </AppSubtitle>
      </SidebarHeader>

      <Navigation>
        <NavSection>
          <NavSectionTitle>Library</NavSectionTitle>
          {navigationItems.map(item => (
            <NavItem
              key={item.id}
              active={currentView === item.id && location.pathname === '/'}
              onClick={() => handleNavClick(item.id)}
            >
              <item.icon size={16} />
              {item.label}
              {item.count > 0 && <NavItemCount>{item.count}</NavItemCount>}
            </NavItem>
          ))}
        </NavSection>

        <NavSection>
          <NavSectionTitle>Tools</NavSectionTitle>
          <NavItem
            active={location.pathname === '/statistics'}
            onClick={() => handlePageNavigation('/statistics')}
          >
            <BarChart3 size={16} />
            Statistics
          </NavItem>
          <NavItem
            active={location.pathname === '/settings'}
            onClick={() => handlePageNavigation('/settings')}
          >
            <Settings size={16} />
            Settings
          </NavItem>
        </NavSection>
      </Navigation>

      <StatsSection>
        <StatsGrid>
          <StatCard>
            <StatCardLabel>
              <Download size={12} />
              Download
            </StatCardLabel>
            <StatCardValue>{formatSpeed(globalStats.totalDownloadSpeed)}</StatCardValue>
          </StatCard>
          <StatCard>
            <StatCardLabel>
              <Upload size={12} />
              Upload
            </StatCardLabel>
            <StatCardValue>{formatSpeed(globalStats.totalUploadSpeed)}</StatCardValue>
          </StatCard>
        </StatsGrid>

        <AddTorrentButton onClick={onAddTorrent}>
          <Plus size={16} />
          Add Torrent
        </AddTorrentButton>
      </StatsSection>
    </SidebarContainer>
  );
};

export default Sidebar;
