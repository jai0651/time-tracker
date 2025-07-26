import api from '../api';

export async function listTasks() {
  const res = await api.get('/tasks');
  return res.data;
}

export async function getTask(id) {
  const res = await api.get(`/tasks/${id}`);
  return res.data;
}

export async function createTask(data) {
  const res = await api.post('/tasks', data);
  return res.data;
}

export async function updateTask(id, data) {
  const res = await api.put(`/tasks/${id}`, data);
  return res.data;
}

export async function deleteTask(id) {
  const res = await api.delete(`/tasks/${id}`);
  return res.data;
}

export async function assignEmployees(taskId, employeeIds, projectId) {
  const res = await api.post(`/tasks/${taskId}/employees`, { employeeIds, projectId });
  return res.data;
}

export async function removeEmployee(taskId, employeeId) {
  const res = await api.delete(`/tasks/${taskId}/employees/${employeeId}`);
  return res.data;
} 