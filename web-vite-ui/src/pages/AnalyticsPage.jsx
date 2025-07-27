import React, { useState, useEffect } from 'react';
import { Text, Heading, Container, Card } from '@radix-ui/themes';
import Layout from '../components/Layout.jsx';
import AnalyticsFilters from '../components/analytics/AnalyticsFilters.jsx';
import AnalyticsSummary from '../components/analytics/AnalyticsSummary.jsx';
import AnalyticsTable from '../components/analytics/AnalyticsTable.jsx';
import analyticsRepository from '../repository/analyticsRepository.js';
import { listProjects } from '../repository/projectRepository.js';
import { listTasks } from '../repository/taskRepository.js';
import { listEmployees } from '../repository/employeeRepository.js';

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    employeeId: '',
    projectId: '',
    taskId: '',
    teamId: '',
    billable: '',
    status: '',
    groupBy: '',
    limit: 50,
    offset: 0,
    sortBy: 'start',
    sortOrder: 'desc'
  });
  
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
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
      
      const [projectsData, tasksData, employeesData] = await Promise.all([
        listProjects(),
        listTasks(),
        listEmployees()
      ]);
      
      setProjects(projectsData || []);
      setTasks(tasksData || []);
      setEmployees(employeesData || []);
      
      const defaultRange = analyticsRepository.getDateRange(dateRange);
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
      
      const data = await analyticsRepository.getTimeTrackingAnalytics(filters);
      setAnalytics(data);
      
    } catch (error) {
      setError('Failed to load analytics data');
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
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
    const newRange = analyticsRepository.getDateRange(range);
    setFilters(prev => ({
      ...prev,
      startDate: newRange.startDate,
      endDate: newRange.endDate,
      offset: 0
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      employeeId: '',
      projectId: '',
      taskId: '',
      teamId: '',
      billable: '',
      status: '',
      groupBy: '',
      limit: 50,
      offset: 0,
      sortBy: 'start',
      sortOrder: 'desc'
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

  const formatDuration = (milliseconds) => {
    return analyticsRepository.formatDuration(milliseconds);
  };

  if (loading && !analytics) {
    return (
      <Layout>
        <Container size="4" className="py-8">
          <div className="text-center">
            <Text size="5">Loading analytics...</Text>
          </div>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container size="4" className="py-8">
        <Heading size="6" className="mb-6">Time Tracking Analytics</Heading>
        
        {error && (
          <Card className="mb-6 p-4 bg-red-50 border-red-200">
            <Text color="red">{error}</Text>
          </Card>
        )}

        <AnalyticsFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onDateRangeChange={handleDateRangeChange}
          onClearFilters={handleClearFilters}
          dateRange={dateRange}
          projects={projects}
          tasks={tasks}
          employees={employees}
          analytics={analytics}
        />

        <AnalyticsSummary
          summary={analytics?.summary}
          formatDuration={formatDuration}
        />

        <AnalyticsTable
          activities={analytics?.activities}
          analytics={analytics}
          onPagination={handlePagination}
          filters={filters}
          formatDuration={formatDuration}
        />
      </Container>
    </Layout>
  );
};

export default AnalyticsPage; 