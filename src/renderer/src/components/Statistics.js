import React, { useMemo } from 'react';
import styled from 'styled-components';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Download, Upload, HardDrive, Clock, TrendingUp, Activity } from 'lucide-react';
import prettyBytes from 'pretty-bytes';
import { Header, HeaderTitle, ContentArea } from '../styles/AppStyles';

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.lg};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  border: 1px solid ${props => props.theme.colors.border};
  padding: ${props => props.theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.color || props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.background};
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
`;

const StatSubvalue = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textMuted};
  margin-top: ${props => props.theme.spacing.xs};
`;

const ChartSection = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  border: 1px solid ${props => props.theme.colors.border};
  padding: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const ChartTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const ChartContainer = styled.div`
  height: 300px;
  width: 100%;
`;

const TorrentTable = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  border: 1px solid ${props => props.theme.colors.border};
  overflow: hidden;
`;

const TableHeader = styled.div`
  background: ${props => props.theme.colors.background};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const TableRow = styled.div`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: ${props => props.theme.spacing.md};
  align-items: center;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  font-size: 0.875rem;

  &:last-child {
    border-bottom: none;
  }

  &:nth-child(even) {
    background: ${props => props.theme.colors.background};
  }
`;

const TorrentName = styled.div`
  color: ${props => props.theme.colors.text};
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TableCell = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  text-align: ${props => props.align || 'left'};
`;

const ProgressBar = styled.div`
  height: 4px;
  background: ${props => props.theme.colors.background};
  border-radius: 2px;
  overflow: hidden;
  margin-top: ${props => props.theme.spacing.xs};
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${props => props.theme.colors.success};
  width: ${props => props.progress * 100}%;
  transition: width 0.3s ease;
`;

const formatSpeed = (bytes) => {
  if (bytes === 0) return '0 B/s';
  return `${prettyBytes(bytes)}/s`;
};

const formatRatio = (ratio) => {
  if (!ratio || ratio === Infinity) return '∞';
  return ratio.toFixed(2);
};

const Statistics = ({ torrents, globalStats }) => {
  const chartData = useMemo(() => {
    // Generate mock historical data for demonstration
    const data = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      data.push({
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        download: Math.random() * globalStats.totalDownloadSpeed,
        upload: Math.random() * globalStats.totalUploadSpeed,
      });
    }
    
    return data;
  }, [globalStats]);

  const statusData = useMemo(() => {
    const statusCounts = torrents.reduce((acc, torrent) => {
      if (torrent.done) {
        acc.completed += 1;
      } else if (torrent.paused) {
        acc.paused += 1;
      } else if (torrent.downloadSpeed > 0) {
        acc.downloading += 1;
      } else {
        acc.seeding += 1;
      }
      return acc;
    }, { downloading: 0, completed: 0, paused: 0, seeding: 0 });

    return [
      { name: 'Downloading', value: statusCounts.downloading, color: '#74b9ff' },
      { name: 'Completed', value: statusCounts.completed, color: '#00b894' },
      { name: 'Seeding', value: statusCounts.seeding, color: '#00d4aa' },
      { name: 'Paused', value: statusCounts.paused, color: '#fdcb6e' },
    ].filter(item => item.value > 0);
  }, [torrents]);

  const topTorrents = useMemo(() => {
    return [...torrents]
      .sort((a, b) => (b.downloadSpeed + b.uploadSpeed) - (a.downloadSpeed + a.uploadSpeed))
      .slice(0, 10);
  }, [torrents]);

  const totalSize = useMemo(() => {
    return torrents.reduce((total, torrent) => total + (torrent.length || 0), 0);
  }, [torrents]);

  const averageRatio = useMemo(() => {
    if (torrents.length === 0) return 0;
    const totalRatio = torrents.reduce((sum, torrent) => sum + (torrent.ratio || 0), 0);
    return totalRatio / torrents.length;
  }, [torrents]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: '#2a2a2a',
          border: '1px solid #444',
          borderRadius: '8px',
          padding: '12px',
          color: '#fff'
        }}>
          <p>{`Time: ${label}`}</p>
          <p style={{ color: '#74b9ff' }}>
            {`Download: ${formatSpeed(payload[0]?.value || 0)}`}
          </p>
          <p style={{ color: '#00d4aa' }}>
            {`Upload: ${formatSpeed(payload[1]?.value || 0)}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Header>
        <HeaderTitle>Statistics</HeaderTitle>
      </Header>
      <ContentArea>
        <StatsContainer>
          <StatCard>
            <StatIcon color="#74b9ff">
              <Download size={24} />
            </StatIcon>
            <StatContent>
              <StatLabel>Current Download Speed</StatLabel>
              <StatValue>{formatSpeed(globalStats.totalDownloadSpeed)}</StatValue>
              <StatSubvalue>
                Total Downloaded: {prettyBytes(globalStats.totalDownloaded)}
              </StatSubvalue>
            </StatContent>
          </StatCard>

          <StatCard>
            <StatIcon color="#00d4aa">
              <Upload size={24} />
            </StatIcon>
            <StatContent>
              <StatLabel>Current Upload Speed</StatLabel>
              <StatValue>{formatSpeed(globalStats.totalUploadSpeed)}</StatValue>
              <StatSubvalue>
                Total Uploaded: {prettyBytes(globalStats.totalUploaded)}
              </StatSubvalue>
            </StatContent>
          </StatCard>

          <StatCard>
            <StatIcon color="#fdcb6e">
              <HardDrive size={24} />
            </StatIcon>
            <StatContent>
              <StatLabel>Total Library Size</StatLabel>
              <StatValue>{prettyBytes(totalSize)}</StatValue>
              <StatSubvalue>
                {globalStats.totalTorrents} torrents
              </StatSubvalue>
            </StatContent>
          </StatCard>

          <StatCard>
            <StatIcon color="#e17055">
              <TrendingUp size={24} />
            </StatIcon>
            <StatContent>
              <StatLabel>Average Ratio</StatLabel>
              <StatValue>{formatRatio(averageRatio)}</StatValue>
              <StatSubvalue>
                {globalStats.activeTorrents} active
              </StatSubvalue>
            </StatContent>
          </StatCard>
        </StatsContainer>

        <ChartSection>
          <ChartTitle>
            <Activity size={20} />
            Speed History (24 Hours)
          </ChartTitle>
          <ChartContainer>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis 
                  dataKey="time" 
                  stroke="#b2b2b2"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#b2b2b2"
                  fontSize={12}
                  tickFormatter={(value) => prettyBytes(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="download" 
                  stroke="#74b9ff" 
                  strokeWidth={2}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="upload" 
                  stroke="#00d4aa" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartSection>

        {statusData.length > 0 && (
          <StatsContainer>
            <ChartSection>
              <ChartTitle>Torrent Status Distribution</ChartTitle>
              <ChartContainer>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </ChartSection>

            <ChartSection>
              <ChartTitle>Activity Overview</ChartTitle>
              <ChartContainer>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#b2b2b2"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#b2b2b2"
                      fontSize={12}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#2a2a2a',
                        border: '1px solid #444',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Bar dataKey="value" fill="#74b9ff" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </ChartSection>
          </StatsContainer>
        )}

        {topTorrents.length > 0 && (
          <TorrentTable>
            <TableHeader>
              <Clock size={16} />
              Most Active Torrents
            </TableHeader>
            {topTorrents.map(torrent => (
              <TableRow key={torrent.infoHash}>
                <TorrentName title={torrent.name}>
                  {torrent.name}
                  <ProgressBar>
                    <ProgressFill progress={torrent.progress} />
                  </ProgressBar>
                </TorrentName>
                <TableCell align="right">
                  {formatSpeed(torrent.downloadSpeed)}
                </TableCell>
                <TableCell align="right">
                  {formatSpeed(torrent.uploadSpeed)}
                </TableCell>
                <TableCell align="right">
                  {formatRatio(torrent.ratio)}
                </TableCell>
                <TableCell align="right">
                  {torrent.numPeers} peers
                </TableCell>
              </TableRow>
            ))}
          </TorrentTable>
        )}
      </ContentArea>
    </>
  );
};

export default Statistics;
