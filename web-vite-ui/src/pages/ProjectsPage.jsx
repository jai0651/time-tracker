import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { listProjects, createProject, updateProject, deleteProject, assignEmployees, removeEmployee } from '../repository/projectRepository';
import { Card, Badge, Button, Text, Heading, Flex, Box, Separator, Container, Dialog, Checkbox } from '@radix-ui/themes';
import { FileIcon, PlusIcon, Pencil1Icon, TrashIcon, PersonIcon, CheckCircledIcon } from '@radix-ui/react-icons';
import { listEmployees } from '../repository/employeeRepository';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ 
    name: '', 
    description: '', 
    billable: false,
    statuses: [],
    priorities: [],
    teams: []
  });
  const [editingId, setEditingId] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [assigningProject, setAssigningProject] = useState(null);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [assignError, setAssignError] = useState('');

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await listProjects();
      setProjects(data);
    } catch (e) {
      setError('Failed to load projects');
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

  useEffect(() => {
    fetchProjects();
    fetchEmployees();
  }, []);

  // Debug state changes
  useEffect(() => {
    console.log('showForm state changed to:', showForm);
  }, [showForm]);

  useEffect(() => {
    console.log('assigningProject state changed to:', assigningProject);
  }, [assigningProject]);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateProject(editingId, form);
        console.log('Project updated successfully');
        setSuccess('Project updated successfully!');
      } else {
        await createProject(form);
        console.log('Project created successfully');
        setSuccess('Project created successfully!');
      }
      setShowForm(false);
      setForm({ 
        name: '', 
        description: '', 
        billable: false,
        statuses: [],
        priorities: [],
        teams: []
      });
      setEditingId(null);
      setError(''); // Clear any previous errors
      fetchProjects();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving project:', error);
      setError('Failed to save project. Please try again.');
    }
  };

  const handleEditClick = (e, project) => {
    console.log('Edit button clicked for project:', project);
    console.log('Setting showForm to true, editingId to:', project.id);
    setForm({ 
      name: project.name, 
      description: project.description || '',
      billable: project.billable || false,
      statuses: project.statuses || [],
      priorities: project.priorities || [],
      teams: project.teams || []
    });
    setEditingId(project.id);
    setShowForm(true);
    console.log('State should be updated now');
  };

  const handleDeleteClick = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Delete button clicked for project id:', id);
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await deleteProject(id);
      fetchProjects();
    } catch {
      setError('Failed to delete project');
    }
  };

  const handleAssignClick = (e, project) => {
    console.log('Assign button clicked for project:', project);
    console.log('Setting assigningProject to:', project);
    console.log('Current project employees:', project.employees);
    
    // Set the project and initialize selected employees
    setAssigningProject(project);
    const currentEmployeeIds = project.employees?.map(e => e.id) || [];
    setSelectedEmployeeIds(currentEmployeeIds);
    setAssignError('');
    
    console.log('Selected employee IDs:', currentEmployeeIds);
    console.log('Assign state should be updated now');
  };

  const handleEmployeeSelection = (employeeId, isChecked) => {
    console.log('=== EMPLOYEE SELECTION EVENT ===');
    console.log('Employee ID:', employeeId);
    console.log('Is Checked:', isChecked);
    console.log('Current selection before change:', selectedEmployeeIds);
    
    if (isChecked) {
      const newSelection = [...selectedEmployeeIds, employeeId];
      setSelectedEmployeeIds(newSelection);
      console.log('Added employee, new selection:', newSelection);
    } else {
      const newSelection = selectedEmployeeIds.filter(id => id !== employeeId);
      setSelectedEmployeeIds(newSelection);
      console.log('Removed employee, new selection:', newSelection);
    }
    
    console.log('=== END SELECTION EVENT ===');
  };

  const handleAssignSubmit = async () => {
    try {
      console.log('Starting assign submit...');
      console.log('Assigning employees:', selectedEmployeeIds, 'to project:', assigningProject.id);
      console.log('Calling assignEmployees API...');
      
      if (!assigningProject || !assigningProject.id) {
        throw new Error('No project selected for assignment');
      }
      
      const result = await assignEmployees(assigningProject.id, selectedEmployeeIds);
      console.log('API call successful, result:', result);
      
      setSuccess('Team members assigned successfully!');
      setAssigningProject(null);
      setAssignError(''); // Clear any previous errors
      setSelectedEmployeeIds([]); // Clear selected employees
      
      console.log('Refreshing projects...');
      await fetchProjects();
      console.log('Projects refreshed');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error assigning employees:', error);
      console.error('Error details:', error.response?.data || error.message);
      setAssignError(`Failed to assign employees: ${error.message || 'Unknown error'}`);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Container size="4" className="py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <Text size="3" className="text-gray-600">Loading projects...</Text>
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
          <Heading size="8" className="text-gray-900 mb-2">Projects</Heading>
          <Text size="3" className="text-gray-600">Manage your team's projects</Text>
        </div>

        {/* Add Project Button */}
        <div className="mb-8 flex justify-between items-center">
          <div></div>
          <Button 
            onClick={() => { 
              setShowForm(true); 
              setEditingId(null); 
              setForm({ 
                name: '', 
                description: '', 
                billable: false,
                statuses: [],
                priorities: [],
                teams: []
              }); 
            }}
            size="3"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <PlusIcon className="mr-2" />
            Add Project
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <Text size="2" className="text-red-700">{error}</Text>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <Text size="2" className="text-green-700">{success}</Text>
          </div>
        )}

        {/* Projects Grid */}
        <div className="grid gap-4">
          {projects.map(project => (
            <Card key={project.id} className="p-6 border border-gray-200 hover:border-gray-300 transition-colors">
              {/* Project Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Heading size="4" className="text-gray-900 mb-1">{project.name}</Heading>
                  {project.description && (
                    <Text size="2" className="text-gray-600">{project.description}</Text>
                  )}
                  <div className="flex gap-2 mt-2">
                    {project.billable && (
                      <Badge variant="soft" color="green">Billable</Badge>
                    )}
                    {project.statuses && project.statuses.length > 0 && (
                      <Badge variant="soft" color="blue">{project.statuses.length} Statuses</Badge>
                    )}
                    {project.priorities && project.priorities.length > 0 && (
                      <Badge variant="soft" color="purple">{project.priorities.length} Priorities</Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="2"
                    onClick={(e) => handleEditClick(e, project)}
                    className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-3 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Pencil1Icon />
                  </Button>
                  <Button 
                    size="2"
                    onClick={(e) => handleDeleteClick(e, project.id)}
                    className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-3 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <TrashIcon />
                  </Button>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Project Details */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Employees Section */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <PersonIcon className="text-gray-500" />
                    <Text size="2" weight="medium" className="text-gray-700">
                      Team Members ({project.employees?.length || 0})
                    </Text>
                  </div>
                  
                  {project.employees && project.employees.length > 0 ? (
                    <div className="space-y-1">
                      {project.employees.map(emp => (
                        <div key={emp.id} className="text-sm text-gray-600">
                          {emp.name || emp.email}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No team members assigned</div>
                  )}
                  
                  <Button 
                    size="2"
                    onClick={(e) => handleAssignClick(e, project)}
                    className="mt-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Assign Team Members
                  </Button>
                </div>

                {/* Tasks Section */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircledIcon className="text-gray-500" />
                    <Text size="2" weight="medium" className="text-gray-700">
                      Tasks ({project.tasks?.length || 0})
                    </Text>
                  </div>
                  
                  {project.tasks && project.tasks.length > 0 ? (
                    <div className="space-y-1">
                      {project.tasks.map(task => (
                        <div key={task.id} className="text-sm text-gray-600">
                          {task.name}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No tasks created</div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {projects.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileIcon className="text-gray-400" />
            </div>
            <Heading size="4" className="text-gray-900 mb-2">No projects yet</Heading>
            <Text size="2" className="text-gray-600">
              Start by creating your first project.
            </Text>
          </div>
        )}

        {/* Add/Edit Project Dialog */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <Text size="4" weight="bold">{editingId ? 'Edit Project' : 'Add Project'}</Text>
                <button 
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Text size="2" weight="medium" className="text-gray-700 mb-2">Project Name</Text>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter project name"
                    value={form.name}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <Text size="2" weight="medium" className="text-gray-700 mb-2">Description</Text>
                  <textarea
                    name="description"
                    placeholder="Enter project description"
                    value={form.description}
                    onChange={handleFormChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="billable"
                    checked={form.billable}
                    onChange={handleFormChange}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <Text size="2" weight="medium" className="text-gray-700">Billable Project</Text>
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
                    {editingId ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Assign Employees Dialog */}
        {assigningProject && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <Text size="4" weight="bold">Assign Team Members</Text>
                <button 
                  onClick={() => setAssigningProject(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <Text size="2" className="text-gray-600 mb-4">
                Select team members for {assigningProject.name}
              </Text>
              
              {assignError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <Text size="2" className="text-red-700">{assignError}</Text>
                </div>
              )}
              
              {/* Select All / Clear All buttons */}
              <div className="flex gap-2 mb-4">
                <Button 
                  size="2"
                  onClick={() => {
                    const allEmployeeIds = employees.map(emp => emp.id);
                    setSelectedEmployeeIds(allEmployeeIds);
                    console.log('Selected all employees:', allEmployeeIds);
                  }}
                  className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-3 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Select All
                </Button>
                <Button 
                  size="2"
                  onClick={() => {
                    setSelectedEmployeeIds([]);
                    console.log('Cleared all selections');
                  }}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-3 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Clear All
                </Button>
                <Text size="1" className="text-gray-500 ml-auto self-center">
                  {selectedEmployeeIds.length} of {employees.length} selected
                </Text>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                {employees.length > 0 ? (
                  employees.map(emp => (
                    <label 
                      key={emp.id} 
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-100"
                      onClick={() => {
                        const isCurrentlySelected = selectedEmployeeIds.includes(emp.id);
                        handleEmployeeSelection(emp.id, !isCurrentlySelected);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedEmployeeIds.includes(emp.id)}
                        onChange={e => handleEmployeeSelection(emp.id, e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Text size="2" className="flex-1">{emp.name || emp.email}</Text>
                    </label>
                  ))
                ) : (
                  <div className="p-4 text-center">
                    <Text size="2" className="text-gray-500">No employees available</Text>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 justify-end">
                <Button 
                  onClick={() => setAssigningProject(null)}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAssignSubmit} 
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Save Assignment
                </Button>
              </div>
            </div>
          </div>
        )}
      </Container>
    </Layout>
  );
} 