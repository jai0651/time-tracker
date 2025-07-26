import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { listTasks, createTask, updateTask, deleteTask, assignEmployees, removeEmployee } from '../repository/taskRepository';
import { listEmployees } from '../api';
import { listProjects } from '../repository/projectRepository';
import { Card, Badge, Button, Text, Heading, Flex, Box, Separator, Container, Dialog, Checkbox, Select } from '@radix-ui/themes';
import { CheckCircledIcon, PlusIcon, Pencil1Icon, TrashIcon, PersonIcon, FileIcon } from '@radix-ui/react-icons';
import api from '../api';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', projectId: '' });
  const [editingId, setEditingId] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [assigningTask, setAssigningTask] = useState(null);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [assignError, setAssignError] = useState('');
  const [projects, setProjects] = useState([]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await listTasks();
      setTasks(data);
    } catch (e) {
      setError('Failed to load tasks');
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

  useEffect(() => {
    fetchTasks();
    fetchEmployees();
    fetchProjects();
  }, []);

  // Debug state changes
  useEffect(() => {
    console.log('showForm state changed to:', showForm);
  }, [showForm]);

  useEffect(() => {
    console.log('assigningTask state changed to:', assigningTask);
  }, [assigningTask]);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateTask(editingId, form);
        console.log('Task updated successfully');
        setSuccess('Task updated successfully!');
      } else {
        await createTask(form);
        console.log('Task created successfully');
        setSuccess('Task created successfully!');
      }
      setShowForm(false);
      setForm({ name: '', projectId: '' });
      setEditingId(null);
      setError(''); // Clear any previous errors
      fetchTasks();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving task:', error);
      setError('Failed to save task. Please try again.');
    }
  };

  const handleEditClick = (e, task) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Edit button clicked for task:', task);
    console.log('Setting showForm to true, editingId to:', task.id);
    setForm({ name: task.name, projectId: task.projectId });
    setEditingId(task.id);
    setShowForm(true);
    console.log('State should be updated now');
  };

  const handleDeleteClick = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Delete button clicked for task id:', id);
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTask(id);
      fetchTasks();
    } catch {
      setError('Failed to delete task');
    }
  };

  const handleAssignClick = async (e, task) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Assign button clicked for task:', task);
    console.log('Setting assigningTask to:', task);
    try {
      // Fetch the project with employees to ensure we have the latest data
      const projectRes = await api.get(`/projects/${task.projectId}`);
      const projectWithEmployees = projectRes.data;
      
      setAssigningTask(task);
      const currentEmployeeIds = task.employees?.map(e => e.id) || [];
      setSelectedEmployeeIds(currentEmployeeIds);
      setAssignError('');
      
      console.log('Selected employee IDs:', currentEmployeeIds);
      console.log('Project employees:', projectWithEmployees.employees);
      console.log('Assign state should be updated now');
    } catch (error) {
      console.error('Error fetching project data:', error);
      setAssignError('Failed to load project data');
    }
  };

  const handleEmployeeSelection = (employeeId, isChecked) => {
    console.log('=== TASK EMPLOYEE SELECTION EVENT ===');
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
    
    console.log('=== END TASK SELECTION EVENT ===');
  };

  const handleAssignSubmit = async () => {
    try {
      console.log('Starting assign submit...');
      console.log('Assigning employees:', selectedEmployeeIds, 'to task:', assigningTask.id);
      console.log('Calling assignEmployees API...');
      
      if (!assigningTask || !assigningTask.id) {
        throw new Error('No task selected for assignment');
      }
      
      const result = await assignEmployees(assigningTask.id, selectedEmployeeIds, assigningTask.projectId);
      console.log('API call successful, result:', result);
      
      setSuccess('Team members assigned successfully!');
      setAssigningTask(null);
      setAssignError(''); // Clear any previous errors
      setSelectedEmployeeIds([]); // Clear selected employees
      
      console.log('Refreshing tasks...');
      await fetchTasks();
      console.log('Tasks refreshed');
      
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
              <Text size="3" className="text-gray-600">Loading tasks...</Text>
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
          <Heading size="8" className="text-gray-900 mb-2">Tasks</Heading>
          <Text size="3" className="text-gray-600">Manage your project tasks</Text>
        </div>

        {/* Add Task Button */}
        <div className="mb-8 flex justify-between items-center">
          <div></div>
          <Button 
            onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: '', projectId: '' }); }}
            size="3"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <PlusIcon className="mr-2" />
            Add Task
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

        {/* Tasks Grid */}
        <div className="grid gap-4">
          {tasks.map(task => (
            <Card key={task.id} className="p-6 border border-gray-200 hover:border-gray-300 transition-colors">
              {/* Task Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Heading size="4" className="text-gray-900 mb-1">{task.name}</Heading>
                  <Text size="2" className="text-gray-600">
                    Project: {task.project?.name || 'Unknown Project'}
                  </Text>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="2"
                    onClick={(e) => handleEditClick(e, task)}
                    className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-3 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Pencil1Icon />
                  </Button>
                  <Button 
                    size="2"
                    onClick={(e) => handleDeleteClick(e, task.id)}
                    className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-3 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <TrashIcon />
                  </Button>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Task Details */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Project Details */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FileIcon className="text-gray-500" />
                    <Text size="2" weight="medium" className="text-gray-700">
                      Project Details
                    </Text>
                  </div>
                  <div className="text-sm text-gray-600">
                    {task.project?.name || 'Unknown Project'}
                  </div>
                </div>

                {/* Team Members */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <PersonIcon className="text-gray-500" />
                    <Text size="2" weight="medium" className="text-gray-700">
                      Team Members ({task.employees?.length || 0})
                    </Text>
                  </div>
                  
                  {task.employees && task.employees.length > 0 ? (
                    <div className="space-y-1">
                      {task.employees.map(emp => (
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
                    onClick={(e) => handleAssignClick(e, task)}
                    className="mt-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Assign Team Members
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {tasks.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircledIcon className="text-gray-400" />
            </div>
            <Heading size="4" className="text-gray-900 mb-2">No tasks yet</Heading>
            <Text size="2" className="text-gray-600">
              Start by creating your first task.
            </Text>
          </div>
        )}

        {/* Add/Edit Task Dialog */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <Text size="4" weight="bold">{editingId ? 'Edit Task' : 'Add Task'}</Text>
                <button 
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Text size="2" weight="medium" className="text-gray-700 mb-2">Task Name</Text>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter task name"
                    value={form.name}
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
        {assigningTask && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <Text size="4" weight="bold">Assign Team Members</Text>
                <button 
                  onClick={() => setAssigningTask(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <Text size="2" className="text-gray-600 mb-4">
                Select team members for {assigningTask.name} (only project members shown)
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
                    const projectEmployees = projects.find(p => p.id === assigningTask.projectId)?.employees || [];
                    const availableEmployeeIds = employees
                      .filter(emp => projectEmployees.some(projectEmp => projectEmp.id === emp.id))
                      .map(emp => emp.id);
                    setSelectedEmployeeIds(availableEmployeeIds);
                    console.log('Selected all available employees:', availableEmployeeIds);
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
                  {selectedEmployeeIds.length} selected
                </Text>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                {(() => {
                  // Get project employees for this task
                  const projectEmployees = projects.find(p => p.id === assigningTask.projectId)?.employees || [];
                  const availableEmployees = employees.filter(emp => 
                    projectEmployees.some(projectEmp => projectEmp.id === emp.id)
                  );
                  
                  return availableEmployees.length > 0 ? (
                    availableEmployees.map(emp => (
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
                      <Text size="2" className="text-gray-500">
                        No team members available. Please assign employees to the project first.
                      </Text>
                    </div>
                  );
                })()}
              </div>
              
              <div className="flex gap-3 justify-end">
                <Button 
                  onClick={() => setAssigningTask(null)}
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