import styled from 'styled-components';

export const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden;
`;

export const MainContent = styled.main`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

export const ContentArea = styled.div`
  flex: 1;
  overflow: auto;
  padding: ${props => props.theme.spacing.lg};
`;

export const Header = styled.header`
  background: ${props => props.theme.colors.surface};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 60px;
`;

export const HeaderTitle = styled.h1`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

export const StatsBar = styled.div`
  background: ${props => props.theme.colors.surface};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.lg};
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
`;

export const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

export const StatLabel = styled.span`
  color: ${props => props.theme.colors.textMuted};
`;

export const StatValue = styled.span`
  color: ${props => props.theme.colors.text};
  font-weight: 500;
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: ${props => props.theme.colors.textMuted};
`;

export const EmptyStateIcon = styled.div`
  font-size: 4rem;
  margin-bottom: ${props => props.theme.spacing.lg};
  opacity: 0.5;
`;

export const EmptyStateTitle = styled.h2`
  font-size: 1.25rem;
  margin-bottom: ${props => props.theme.spacing.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

export const EmptyStateText = styled.p`
  font-size: 0.875rem;
  max-width: 300px;
  line-height: 1.5;
`;

export const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

export const LoadingSpinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid ${props => props.theme.colors.border};
  border-top: 3px solid ${props => props.theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
`;

export const LoadingText = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.875rem;
`;
