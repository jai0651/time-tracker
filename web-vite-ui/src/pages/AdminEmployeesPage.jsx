import React, { useEffect, useState } from 'react';
import api from '../api';
import Layout from '../components/Layout';
import { Card, Badge, Button, Text, Heading, Flex, Box, Separator, Container } from '@radix-ui/themes';
import { PersonIcon, EnvelopeClosedIcon, CheckCircledIcon, ClockIcon } from '@radix-ui/react-icons';

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees');
      setEmployees(res.data);
    } catch (err) {
      setError('Failed to load employees. Make sure you are logged in as admin and backend supports GET /employees.');
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/employees', { email });
      setSuccess('Employee added and activation email sent');
      setEmail('');
      fetchEmployees();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add employee');
    }
  };

  return (
    <Layout>
      <Container size="4" className="py-8">
        {/* Header Section */}
        <div className="mb-8">
          <Heading size="8" className="text-gray-900 mb-2">Team Management</Heading>
          <Text size="3" className="text-gray-600">Manage your team members and their project assignments</Text>
        </div>

        {/* Add Employee Form */}
        <Card className="mb-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-0">
          <Heading size="4" className="mb-4 text-gray-900">Add New Employee</Heading>
          <form onSubmit={handleAdd} className="flex gap-3">
            <div className="flex-1 relative">
              <EnvelopeClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="Enter employee email"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              size="3"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Add Employee
            </Button>
          </form>
          
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <Text size="2" className="text-red-700">{error}</Text>
            </div>
          )}
          {success && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <Text size="2" className="text-green-700">{success}</Text>
            </div>
          )}
        </Card>

        {/* Employee Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-0">
            <Flex align="center" gap="3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <PersonIcon className="text-white" />
              </div>
              <Box>
                <Text size="2" className="text-blue-600 font-medium">Total Employees</Text>
                <Heading size="4" className="text-blue-900">{employees.length}</Heading>
              </Box>
            </Flex>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-0">
            <Flex align="center" gap="3">
              <div className="p-2 bg-green-500 rounded-lg">
                <CheckCircledIcon className="text-white" />
              </div>
              <Box>
                <Text size="2" className="text-green-600 font-medium">Active</Text>
                <Heading size="4" className="text-green-900">
                  {employees.filter(emp => emp.status === 'active').length}
                </Heading>
              </Box>
            </Flex>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 border-0">
            <Flex align="center" gap="3">
              <div className="p-2 bg-yellow-500 rounded-lg">
                <ClockIcon className="text-white" />
              </div>
              <Box>
                <Text size="2" className="text-yellow-600 font-medium">Pending</Text>
                <Heading size="4" className="text-yellow-900">
                  {employees.filter(emp => emp.status === 'pending').length}
                </Heading>
              </Box>
            </Flex>
          </Card>
        </div>

        {/* Employees Grid */}
        <div className="grid gap-6">
          {employees.map(emp => (
            <Card key={emp.id} className="p-6 hover:shadow-lg transition-all duration-200 border border-gray-100">
              {/* Employee Header */}
              <Flex justify="between" align="start" className="mb-4">
                <Flex align="center" gap="3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <PersonIcon className="text-white" />
                  </div>
                  <Box>
                    <Heading size="4" className="text-gray-900 mb-1">
                      {emp.name || 'Unnamed Employee'}
                    </Heading>
                    <Flex align="center" gap="2">
                      <EnvelopeClosedIcon className="text-gray-400" />
                      <Text size="2" className="text-gray-500">{emp.email}</Text>
                    </Flex>
                  </Box>
                </Flex>
                <Badge 
                  size="2"
                  color={emp.status === 'active' ? 'green' : 'yellow'} 
                  variant="soft"
                  className="px-3 py-1"
                >
                  {emp.status === 'active' ? 'Active' : 'Pending Activation'}
                </Badge>
              </Flex>

              <Separator className="my-4" />
              
              {/* Projects and Tasks */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Projects Section */}
                <Box>
                  <Flex align="center" gap="2" className="mb-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <Text size="2" weight="bold" className="text-gray-700 uppercase tracking-wide">
                      Projects ({emp.projects?.length || 0})
                    </Text>
                  </Flex>
                  
                  {emp.projects && emp.projects.length > 0 ? (
                    <div className="space-y-2">
                      {emp.projects.map(project => (
                        <div key={project.id} className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <Text size="2" weight="medium" className="text-blue-900 mb-1">
                            {project.name}
                          </Text>
                          {project.description && (
                            <Text size="1" className="text-blue-700 line-clamp-2">
                              {project.description}
                            </Text>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <Text size="2" className="text-gray-500 text-center">No projects assigned</Text>
                    </div>
                  )}
                </Box>
                
                {/* Tasks Section */}
                <Box>
                  <Flex align="center" gap="2" className="mb-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <Text size="2" weight="bold" className="text-gray-700 uppercase tracking-wide">
                      Tasks ({emp.tasks?.length || 0})
                    </Text>
                  </Flex>
                  
                  {emp.tasks && emp.tasks.length > 0 ? (
                    <div className="space-y-2">
                      {emp.tasks.map(task => (
                        <div key={task.id} className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                          <Text size="2" weight="medium" className="text-purple-900 mb-1">
                            {task.name}
                          </Text>
                          <Text size="1" className="text-purple-700">
                            Project: {task.project?.name}
                          </Text>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <Text size="2" className="text-gray-500 text-center">No tasks assigned</Text>
                    </div>
                  )}
                </Box>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {employees.length === 0 && (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <PersonIcon className="text-gray-400" />
            </div>
            <Heading size="4" className="text-gray-900 mb-2">No employees yet</Heading>
            <Text size="2" className="text-gray-600 mb-4">
              Start building your team by adding the first employee above.
            </Text>
          </Card>
        )}
      </Container>
    </Layout>
  );
} 