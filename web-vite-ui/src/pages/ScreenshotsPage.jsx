import React, { useState, useEffect } from 'react';
import { Text, Heading, Container, Card, Button, Badge, Flex, Box } from '@radix-ui/themes';
import Layout from '../components/Layout.jsx';
import ScreenshotViewer from '../components/screenshots/ScreenshotViewer.jsx';
import screenshotRepository from '../repository/screenshotRepository.js';

const ScreenshotsPage = () => {
  const [screenshots, setScreenshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    hasPermissions: '',
    limit: 20,
    offset: 0
  });
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadScreenshots();
    loadStats();
  }, [filters]);

  const loadScreenshots = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await screenshotRepository.getMyScreenshots(filters);
      setScreenshots(data.screenshots || []);
      
    } catch (error) {
      setError('Failed to load screenshots');
      console.error('Error loading screenshots:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await screenshotRepository.getScreenshotStats(filters);
      setStats(data);
    } catch (error) {
      console.error('Error loading screenshot stats:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      offset: 0
    }));
  };

  const handleScreenshotClick = (screenshot) => {
    setSelectedScreenshot(screenshot);
  };

  const handleCloseViewer = () => {
    setSelectedScreenshot(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Layout>
      <Container size="4">
        <Heading size="6" mb="4">Screenshots</Heading>
        
        {/* Stats */}
        {stats && (
          <Card mb="4">
            <Flex gap="4" wrap="wrap">
              <Box>
                <Text size="2" color="gray">Total Screenshots</Text>
                <Text size="4" weight="bold">{stats.totalScreenshots}</Text>
              </Box>
              <Box>
                <Text size="2" color="gray">With Permissions</Text>
                <Text size="4" weight="bold" color="green">{stats.screenshotsWithPermissions}</Text>
              </Box>
              <Box>
                <Text size="2" color="gray">Without Permissions</Text>
                <Text size="4" weight="bold" color="red">{stats.screenshotsWithoutPermissions}</Text>
              </Box>
              <Box>
                <Text size="2" color="gray">Permission Rate</Text>
                <Text size="4" weight="bold">{stats.permissionRate.toFixed(1)}%</Text>
              </Box>
              <Box>
                <Text size="2" color="gray">Total Size</Text>
                <Text size="4" weight="bold">{formatFileSize(stats.totalFileSize)}</Text>
              </Box>
            </Flex>
          </Card>
        )}

        {/* Filters */}
        <Card mb="4">
          <Flex gap="3" align="center" wrap="wrap">
            <Box>
              <Text size="2" weight="bold">Start Date:</Text>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                style={{ marginLeft: '8px' }}
              />
            </Box>
            <Box>
              <Text size="2" weight="bold">End Date:</Text>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                style={{ marginLeft: '8px' }}
              />
            </Box>
            <Box>
              <Text size="2" weight="bold">Permissions:</Text>
              <select
                value={filters.hasPermissions}
                onChange={(e) => handleFilterChange('hasPermissions', e.target.value)}
                style={{ marginLeft: '8px' }}
              >
                <option value="">All</option>
                <option value="true">With Permissions</option>
                <option value="false">Without Permissions</option>
              </select>
            </Box>
            <Button onClick={loadScreenshots} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </Flex>
        </Card>

        {/* Screenshots Grid */}
        {error && (
          <Card mb="4" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
            <Text color="red">{error}</Text>
          </Card>
        )}

        {loading ? (
          <Card>
            <Text>Loading screenshots...</Text>
          </Card>
        ) : screenshots.length === 0 ? (
          <Card>
            <Text>No screenshots found</Text>
          </Card>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '16px' 
          }}>
            {screenshots.map((screenshot) => (
              <Card key={screenshot.id} style={{ cursor: 'pointer' }} onClick={() => handleScreenshotClick(screenshot)}>
                <div style={{ position: 'relative' }}>
                  <img
                    src={screenshot.imageUrl}
                    alt="Screenshot"
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2Qjc1N0QiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPgo=';
                    }}
                  />
                  <Badge 
                    color={screenshot.hasPermissions ? "green" : "red"}
                    style={{ position: 'absolute', top: '8px', right: '8px' }}
                  >
                    {screenshot.hasPermissions ? '✅' : '❌'}
                  </Badge>
                </div>
                <Box mt="2">
                  <Text size="2" weight="bold">{screenshot.fileName}</Text>
                  <Text size="1" color="gray">
                    {formatDate(screenshot.capturedAt)} • {formatFileSize(screenshot.fileSize)}
                  </Text>
                  {screenshot.permissionError && (
                    <Text size="1" color="red">{screenshot.permissionError}</Text>
                  )}
                </Box>
              </Card>
            ))}
          </div>
        )}

        {/* Screenshot Viewer Modal */}
        {selectedScreenshot && (
          <ScreenshotViewer
            screenshot={selectedScreenshot}
            onClose={handleCloseViewer}
          />
        )}
      </Container>
    </Layout>
  );
};

export default ScreenshotsPage; 