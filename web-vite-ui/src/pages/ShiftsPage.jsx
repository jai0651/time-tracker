import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Button, Text, Heading, Separator, Card, Badge } from '@radix-ui/themes';
import { PlusIcon, ClockIcon, PersonIcon } from '@radix-ui/react-icons';
import { createShift, getShifts, endShift } from '../repository/shiftRepository';
import { getTasksByProjectId } from '../repository/taskRepository';
import { listProjects } from '../repository/projectRepository';
import { listEmployees } from '../repository/employeeRepository';

export default function ShiftsPage() {
  const [shifts, setShifts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    employeeId: '',
    teamId: '',
    projectId: '',
    taskId: '',
    start: '',
    end: '',
    type: 'work'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [shiftsData, projectsData, employeesData] = await Promise.all([
        getShifts(),
        listProjects(),
        listEmployees()
      ]);
      setShifts(shiftsData);
      setProjects(projectsData);
      setEmployees(employeesData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleProjectChange = async (projectId) => {
    setFormData(prev => ({ ...prev, projectId, taskId: '' }));
    if (projectId) {
      try {
        const tasksData = await getTasksByProjectId(projectId);
        setTasks(tasksData);
      } catch (err) {
        console.error('Error loading tasks:', err);
      }
    } else {
      setTasks([]);
    }
  };

  const handleTaskChange = (taskId) => {
    setFormData(prev => ({ ...prev, taskId }));
    if (taskId) {
      const taskEmployees = employees.filter(emp =>
        emp.tasks?.some(task => task.id === taskId)
      );
      setFilteredEmployees(taskEmployees);
    } else {
      setFilteredEmployees([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.teamId || !formData.start) {
      setError('Team ID and Start Date are required');
      return;
    }

    try {
      const shiftData = {
        ...formData,
        start: new Date(formData.start).toISOString(),
        end: formData.end ? new Date(formData.end).toISOString() : null
      };

      await createShift(shiftData);

      setFormData({
        employeeId: '',
        teamId: '',
        projectId: '',
        taskId: '',
        start: '',
        end: '',
        type: 'work'
      });

      setIsCreateDialogOpen(false);
      setSuccess('Shift created successfully!');
      setTimeout(() => setSuccess(''), 3000);
      loadData();
    } catch (err) {
      console.error('Error creating shift:', err);
      setError('Failed to create shift');
    }
  };

  const handleEndShift = async (shiftId) => {
    try {
      await endShift(shiftId);
      setSuccess('Shift ended successfully!');
      setTimeout(() => setSuccess(''), 3000);
      loadData();
    } catch (err) {
      console.error('Error ending shift:', err);
      setError('Failed to end shift');
    }
  };

  const getShiftStatus = (shift) => {
    const now = new Date();
    const start = new Date(shift.start);
    const end = shift.end ? new Date(shift.end) : null;

    // if (end) return { status: 'ended', label: 'Ended', color: 'gray' };
    if (start > now) return { status: 'scheduled', label: 'Scheduled', color: 'blue' };
    return { status: 'active', label: 'Active', color: 'green' };
  };

  const formatDateTime = (dateString) =>
    new Date(dateString).toLocaleString();

  const formatDuration = (start, end) => {
    if (!end) return 'Ongoing';
    const duration = new Date(end) - new Date(start);
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading shifts...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Heading size="6">Shift Management</Heading>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            size="3"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg shadow-lg"
          >
            <PlusIcon className="mr-2" /> Create Shift
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

        <div className="grid gap-4">
          {shifts.map((shift) => {
            const status = getShiftStatus(shift);
            return (
              <Card key={shift.id} className="p-6 border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Heading size="4">{shift.employee?.name || 'Unknown Employee'}</Heading>
                    <Text size="2" className="text-gray-600">
                      {shift.project?.name && `Project: ${shift.project.name}`}
                      {shift.task?.name && ` • Task: ${shift.task.name}`}
                    </Text>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="soft" color={status.color}>{status.label}</Badge>
                    </div>
                  </div>
                  {status.status === 'active' && (
                    <Button
                      size="2"
                      onClick={() => handleEndShift(shift.id)}
                      className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-3 py-2 rounded-lg"
                    >
                      End Shift
                    </Button>
                  )}
                </div>

                <Separator className="my-4" />

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <ClockIcon className="text-gray-500" />
                      <Text size="2" weight="medium">Time Details</Text>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div><strong>Start:</strong> {formatDateTime(shift.start)}</div>
                      <div><strong>End:</strong> {shift.end ? formatDateTime(shift.end) : 'Not set'}</div>
                      <div><strong>Duration:</strong> {formatDuration(shift.start, shift.end)}</div>
                      <div><strong>Team:</strong> {shift.teamId}</div>
                    </div>
                  </div>

                  {shift.activities?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <PersonIcon className="text-gray-500" />
                        <Text size="2" weight="medium">Activities ({shift.activities.length})</Text>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        {shift.activities.map(activity => (
                          <div key={activity.id}>
                            • {activity.description} – {formatDuration(activity.start, activity.end)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Create Shift Dialog */}
        {isCreateDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsCreateDialogOpen(false)} />
            <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
              <div className="flex justify-between items-center mb-4">
                <Heading size="4">Create New Shift</Heading>
                <Button variant="ghost" size="2" onClick={() => setIsCreateDialogOpen(false)}>×</Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Project and Task */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Text size="2" weight="medium">Project</Text>
                    <select
                      value={formData.projectId}
                      onChange={(e) => handleProjectChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select project</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Text size="2" weight="medium">Task</Text>
                    <select
                      value={formData.taskId}
                      onChange={(e) => handleTaskChange(e.target.value)}
                      disabled={!formData.projectId}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select task</option>
                      {tasks.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Employee and Team */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Text size="2" weight="medium">Employee</Text>
                    <select
                      value={formData.employeeId}
                      onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                      disabled={!formData.taskId}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select employee</option>
                      {filteredEmployees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Text size="2" weight="medium">Team ID</Text>
                    <input
                      type="text"
                      value={formData.teamId}
                      onChange={(e) => setFormData(prev => ({ ...prev, teamId: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                {/* Start and End */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Text size="2" weight="medium">Start Date & Time</Text>
                    <input
                      type="datetime-local"
                      value={formData.start}
                      onChange={(e) => setFormData(prev => ({ ...prev, start: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <Text size="2" weight="medium">End Date & Time (Optional)</Text>
                    <input
                      type="datetime-local"
                      value={formData.end}
                      onChange={(e) => setFormData(prev => ({ ...prev, end: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Shift</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}