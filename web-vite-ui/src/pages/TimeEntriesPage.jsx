import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { listTimeEntries, createTimeEntry } from '../repository/timeEntryRepository';
import { listProjects } from '../repository/projectRepository';
import { listTasks } from '../repository/taskRepository';
import { listEmployees } from '../repository/employeeRepository';
import { jwtDecode } from 'jwt-decode';
import { Card, Badge, Button, Text, Heading, Flex, Box, Separator, Container, Table } from '@radix-ui/themes';
import { ClockIcon, PersonIcon, FileIcon, CheckCircledIcon, CalendarIcon, MagnifyingGlassIcon, PlusIcon } from '@radix-ui/react-icons';

function getUserFromToken() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
}

export default function TimeEntriesPage() {
  const user = getUserFromToken();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState({ employeeId: '', projectId: '', startDate: '', endDate: '' });
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    startTs: '',
    endTs: '',
    projectId: '',
    taskId: ''
  });

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const params = {};
      if (user.role === 'admin') {
        if (filters.employeeId) params.employeeId = filters.employeeId;
        if (filters.projectId) params.projectId = filters.projectId;
      }
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      const data = await listTimeEntries(params);
      setEntries(data);
    } catch (e) {
      setError('Failed to load time entries');
    }
    setLoading(false);
  };

  const fetchEmployees = async () => {
    try {
      const res = await listEmployees();
      setEmployees(res);
    } catch {
      setEmployees([]);
    }
  };

  const fetchProjects = async () => {
    try {
      const data = await listProjects();
      setProjects(data);
    } catch {
      setProjects([]);
    }
  };

  const fetchTasks = async () => {
    try {
      const data = await listTasks();
      setTasks(data);
    } catch {
      setTasks([]);
    }
  };

  useEffect(() => {
    if (user.role === 'admin') {
      fetchEmployees();
    }
    fetchProjects();
    fetchTasks();
    fetchEntries();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchEntries();
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTimeEntry(form);
      setSuccess('Time entry created successfully!');
      setShowForm(false);
      setForm({
        startTs: '',
        endTs: '',
        projectId: '',
        taskId: ''
      });
      fetchEntries();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to create time entry. Please try again.');
    }
  };

  const formatDuration = (startTs, endTs) => {
    const start = new Date(startTs);
    const end = new Date(endTs);
    const diffMs = end - start;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHours}h ${diffMinutes}m`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Layout>
        <Container size="4" className="py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <Text size="3" className="text-gray-600">Loading time entries...</Text>
            </div>
          </div>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container size="4" className="py-8">
        {/* Header Section */}
        <div className="mb-8">
          <Heading size="8" className="text-gray-900 mb-2">Time Tracking</Heading>
          <Text size="3" className="text-gray-600">Monitor and analyze your team's time entries</Text>
        </div>

        {/* Add Time Entry Button */}
        <div className="mb-8 flex justify-between items-center">
          <div></div>
          <Button 
            onClick={() => setShowForm(true)}
            size="3"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <PlusIcon className="mr-2" />
            Add Time Entry
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-0">
            <Flex align="center" gap="3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <ClockIcon className="text-white" />
              </div>
              <Box>
                <Text size="2" className="text-blue-600 font-medium">Total Entries</Text>
                <Heading size="4" className="text-blue-900">{entries.length}</Heading>
              </Box>
            </Flex>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-0">
            <Flex align="center" gap="3">
              <div className="p-2 bg-green-500 rounded-lg">
                <PersonIcon className="text-white" />
              </div>
              <Box>
                <Text size="2" className="text-green-600 font-medium">Active Users</Text>
                <Heading size="4" className="text-green-900">
                  {new Set(entries.map(entry => entry.employee?.id)).size}
                </Heading>
              </Box>
            </Flex>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-0">
            <Flex align="center" gap="3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <FileIcon className="text-white" />
              </div>
              <Box>
                <Text size="2" className="text-purple-600 font-medium">Active Projects</Text>
                <Heading size="4" className="text-purple-900">
                  {new Set(entries.map(entry => entry.project?.id).filter(Boolean)).size}
                </Heading>
              </Box>
            </Flex>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-0">
            <Flex align="center" gap="3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <CheckCircledIcon className="text-white" />
              </div>
              <Box>
                <Text size="2" className="text-orange-600 font-medium">Active Tasks</Text>
                <Heading size="4" className="text-orange-900">
                  {new Set(entries.map(entry => entry.task?.id).filter(Boolean)).size}
                </Heading>
              </Box>
            </Flex>
          </Card>
        </div>

        {/* Filters Section */}
        {user.role === 'admin' && (
          <Card className="mb-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-0">
            <Flex align="center" gap="2" className="mb-4">
              <MagnifyingGlassIcon className="text-gray-600" />
              <Heading size="4" className="text-gray-900">Filter Entries</Heading>
            </Flex>
            <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Box>
                <Text size="2" weight="bold" className="text-gray-700 mb-2">Employee</Text>
                <select 
                  name="employeeId" 
                  value={filters.employeeId} 
                  onChange={handleFilterChange} 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">All Employees</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name || emp.email}</option>
                  ))}
                </select>
              </Box>
              <Box>
                <Text size="2" weight="bold" className="text-gray-700 mb-2">Project</Text>
                <select 
                  name="projectId" 
                  value={filters.projectId} 
                  onChange={handleFilterChange} 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">All Projects</option>
                  {projects.map(proj => (
                    <option key={proj.id} value={proj.id}>{proj.name}</option>
                  ))}
                </select>
              </Box>
              <Box>
                <Text size="2" weight="bold" className="text-gray-700 mb-2">Start Date</Text>
                <input 
                  type="date" 
                  name="startDate" 
                  value={filters.startDate} 
                  onChange={handleFilterChange} 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </Box>
              <Box>
                <Text size="2" weight="bold" className="text-gray-700 mb-2">End Date</Text>
                <input 
                  type="date" 
                  name="endDate" 
                  value={filters.endDate} 
                  onChange={handleFilterChange} 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </Box>
              <Box className="flex items-end">
                <Button 
                  type="submit" 
                  size="3"
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Apply Filters
                </Button>
              </Box>
            </form>
          </Card>
        )}

        {error && (
          <Card className="mb-6 p-4 bg-red-50 border border-red-200">
            <Text size="2" className="text-red-700">{error}</Text>
          </Card>
        )}

        {success && (
          <Card className="mb-6 p-4 bg-green-50 border border-green-200">
            <Text size="2" className="text-green-700">{success}</Text>
          </Card>
        )}

        {/* Time Entries Table */}
        <Card className="p-6">
          <Heading size="4" className="text-gray-900 mb-4">Time Entries</Heading>
          
          {entries.length > 0 ? (
            <div className="overflow-x-auto">
              <Table.Root>
                <Table.Header>
                  <Table.Row className="bg-gray-50">
                    <Table.ColumnHeaderCell>
                      <Flex align="center" gap="2">
                        <PersonIcon className="text-gray-500" />
                        <Text size="2" weight="bold">Employee</Text>
                      </Flex>
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>
                      <Flex align="center" gap="2">
                        <FileIcon className="text-gray-500" />
                        <Text size="2" weight="bold">Project</Text>
                      </Flex>
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>
                      <Flex align="center" gap="2">
                        <CheckCircledIcon className="text-gray-500" />
                        <Text size="2" weight="bold">Task</Text>
                      </Flex>
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>
                      <Flex align="center" gap="2">
                        <CalendarIcon className="text-gray-500" />
                        <Text size="2" weight="bold">Start Time</Text>
                      </Flex>
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>
                      <Flex align="center" gap="2">
                        <CalendarIcon className="text-gray-500" />
                        <Text size="2" weight="bold">End Time</Text>
                      </Flex>
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>
                      <Flex align="center" gap="2">
                        <ClockIcon className="text-gray-500" />
                        <Text size="2" weight="bold">Duration</Text>
                      </Flex>
                    </Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {entries.map(entry => (
                    <Table.Row key={entry.id} className="hover:bg-gray-50">
                      <Table.Cell>
                        <Flex align="center" gap="2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                            <PersonIcon className="text-white text-xs" />
                          </div>
                          <Text size="2" weight="medium">
                            {entry.employee?.name || entry.employee?.email || '-'}
                          </Text>
                        </Flex>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge variant="soft" color="blue">
                          {entry.project?.name || '-'}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge variant="soft" color="purple">
                          {entry.task?.name || '-'}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Text size="2" className="text-gray-600">
                          {formatDate(entry.startTs)}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text size="2" className="text-gray-600">
                          {formatDate(entry.endTs)}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge variant="soft" color="green">
                          {formatDuration(entry.startTs, entry.endTs)}
                        </Badge>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClockIcon className="text-gray-400" />
              </div>
              <Heading size="4" className="text-gray-900 mb-2">No time entries found</Heading>
              <Text size="2" className="text-gray-600">
                {user.role === 'admin' 
                  ? 'No time entries match your current filters.' 
                  : 'Start tracking your time to see entries here.'
                }
              </Text>
            </div>
          )}
        </Card>

        {/* Add Time Entry Dialog */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <Text size="4" weight="bold">Add Time Entry</Text>
                <button 
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Text size="2" weight="medium" className="text-gray-700 mb-2">Start Time</Text>
                  <input
                    type="datetime-local"
                    name="startTs"
                    value={form.startTs}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <Text size="2" weight="medium" className="text-gray-700 mb-2">End Time</Text>
                  <input
                    type="datetime-local"
                    name="endTs"
                    value={form.endTs}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <Text size="2" weight="medium" className="text-gray-700 mb-2">Project</Text>
                  <select
                    name="projectId"
                    value={form.projectId}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select a project</option>
                    {projects.map(proj => (
                      <option key={proj.id} value={proj.id}>{proj.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Text size="2" weight="medium" className="text-gray-700 mb-2">Task</Text>
                  <select
                    name="taskId"
                    value={form.taskId}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select a task</option>
                    {tasks.map(task => (
                      <option key={task.id} value={task.id}>{task.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 justify-end pt-4">
                  <Button 
                    type="button" 
                    onClick={() => setShowForm(false)}
                    className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Create Entry
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </Container>
    </Layout>
  );
} 