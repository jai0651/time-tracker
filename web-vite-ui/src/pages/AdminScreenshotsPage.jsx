import React, { useState, useEffect } from 'react';
import { Text, Heading, Container } from '@radix-ui/themes';
import Layout from '../components/Layout.jsx';
import ScreenshotViewer from '../components/screenshots/ScreenshotViewer.jsx';
import ScreenshotFilters from '../components/screenshots/ScreenshotFilters.jsx';
import ScreenshotSummary from '../components/screenshots/ScreenshotSummary.jsx';
import ScreenshotTable from '../components/screenshots/ScreenshotTable.jsx';
import screenshotRepository from '../repository/screenshotRepository.js';
import { listEmployees } from '../repository/employeeRepository.js';

const AdminScreenshotsPage = () => {
  const [screenshots, setScreenshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({
    employeeId: '',
    startDate: '',
    endDate: '',
    hasPermissions: '',
    minFileSize: '',
    sortBy: 'capturedAt',
    sortOrder: 'desc',
    limit: 20,
    offset: 0
  });
  const [analytics, setAnalytics] = useState(null);
  const [dateRange, setDateRange] = useState('thisWeek');

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [filters]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      const employeesData = await listEmployees();
      setEmployees(employeesData || []);
      
      // Set default date range
      const defaultRange = getDateRange(dateRange);
      setFilters(prev => ({
        ...prev,
        startDate: defaultRange.startDate,
        endDate: defaultRange.endDate
      }));
      
    } catch (error) {
      setError('Failed to load initial data');
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [screenshotsData, statsData] = await Promise.all([
        screenshotRepository.getAllScreenshots(filters),
        screenshotRepository.getAllScreenshotStats(filters)
      ]);
      
      setScreenshots(screenshotsData.screenshots || []);
      setAnalytics({
        screenshots: screenshotsData.screenshots || [],
        summary: statsData,
        pagination: screenshotsData.pagination
      });
      
    } catch (error) {
      setError('Failed to load analytics data');
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = (range) => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    
    switch (range) {
      case 'today':
        return {
          startDate: startOfDay.toISOString().split('T')[0],
          endDate: endOfDay.toISOString().split('T')[0]
        };
      case 'yesterday':
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const startOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
        const endOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59);
        return {
          startDate: startOfYesterday.toISOString().split('T')[0],
          endDate: endOfYesterday.toISOString().split('T')[0]
        };
      case 'thisWeek':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        return {
          startDate: startOfWeek.toISOString().split('T')[0],
          endDate: now.toISOString().split('T')[0]
        };
      case 'lastWeek':
        const lastWeek = new Date(now);
        lastWeek.setDate(now.getDate() - 7);
        const startOfLastWeek = new Date(lastWeek);
        startOfLastWeek.setDate(lastWeek.getDate() - lastWeek.getDay());
        const endOfLastWeek = new Date(startOfLastWeek);
        endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
        return {
          startDate: startOfLastWeek.toISOString().split('T')[0],
          endDate: endOfLastWeek.toISOString().split('T')[0]
        };
      case 'thisMonth':
        return {
          startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
          endDate: now.toISOString().split('T')[0]
        };
      case 'lastMonth':
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        return {
          startDate: lastMonth.toISOString().split('T')[0],
          endDate: endOfLastMonth.toISOString().split('T')[0]
        };
      case 'thisYear':
        return {
          startDate: new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0],
          endDate: now.toISOString().split('T')[0]
        };
      default:
        return {
          startDate: '',
          endDate: ''
        };
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      offset: 0
    }));
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    const newRange = getDateRange(range);
    setFilters(prev => ({
      ...prev,
      startDate: newRange.startDate,
      endDate: newRange.endDate,
      offset: 0
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      employeeId: '',
      startDate: '',
      endDate: '',
      hasPermissions: '',
      minFileSize: '',
      sortBy: 'capturedAt',
      sortOrder: 'desc',
      limit: 20,
      offset: 0
    });
  };

  const handlePagination = (direction) => {
    if (direction === 'next' && analytics?.pagination?.hasMore) {
      setFilters(prev => ({
        ...prev,
        offset: prev.offset + prev.limit
      }));
    } else if (direction === 'prev' && filters.offset > 0) {
      setFilters(prev => ({
        ...prev,
        offset: Math.max(0, prev.offset - prev.limit)
      }));
    }
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

  if (loading && !analytics) {
    return (
      <Layout>
        <Container size="4" className="py-8">
          <div className="text-center">
            <Text size="5">Loading screenshot analytics...</Text>
          </div>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container size="4" className="py-8">
        <Heading size="6" className="mb-6">Screenshot Analytics</Heading>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
            <Text color="red">{error}</Text>
          </div>
        )}

        <ScreenshotFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onDateRangeChange={handleDateRangeChange}
          onClearFilters={handleClearFilters}
          dateRange={dateRange}
          employees={employees}
          analytics={analytics}
        />

        <ScreenshotSummary
          summary={analytics?.summary}
          formatFileSize={formatFileSize}
        />

        <ScreenshotTable
          screenshots={analytics?.screenshots}
          analytics={analytics}
          onPagination={handlePagination}
          filters={filters}
          formatFileSize={formatFileSize}
          onScreenshotClick={handleScreenshotClick}
        />

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

export default AdminScreenshotsPage; 