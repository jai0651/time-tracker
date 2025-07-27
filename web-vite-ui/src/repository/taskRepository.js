import api from '../api';
import { getProject } from './projectRepository';

export async function listTasks() {
  const res = await api.get('/task');
  return res.data;
}

export async function getTask(id) {
  const res = await api.get(`/task/${id}`);
  return res.data;
}

export async function createTask(data) {
  const res = await api.post('/task', data);
  return res.data;
}

export async function updateTask(id, data) {
  const res = await api.put(`/task/${id}`, data);
  return res.data;
}

export async function getTasksByProjectId(projectId) {
  const res = await api.get(`/task/project/${projectId}`);
  return res.data;
}

export async function deleteTask(id) {
  const res = await api.delete(`/task/${id}`);
  return res.data;
}

export async function assignEmployees(taskId, employeeIds, projectId) {
  const res = await api.put(`/task/${taskId}`, { employees: employeeIds });
  return res.data;
}

export async function removeEmployee(taskId, employeeId) {
  // Get current task employees and remove the specific employee
  const task = await getTask(taskId);
  const currentEmployees = task.employees?.map(emp => emp.id) || [];
  const updatedEmployees = currentEmployees.filter(id => id !== employeeId);
  const res = await api.put(`/task/${taskId}`, { employees: updatedEmployees });
  return res.data;
}

// Additional functions that were in api.js
export async function assignEmployeesToTask(taskId, employeeIds, projectId) {
  const res = await api.put(`/task/${taskId}`, { employees: employeeIds });
  return res.data;
}

export async function removeEmployeeFromTask(taskId, employeeId) {
  // Get current task employees and remove the specific employee
  const task = await getTask(taskId);
  const currentEmployees = task.employees?.map(emp => emp.id) || [];
  const updatedEmployees = currentEmployees.filter(id => id !== employeeId);
  const res = await api.put(`/task/${taskId}`, { employees: updatedEmployees });
  return res.data;
} 