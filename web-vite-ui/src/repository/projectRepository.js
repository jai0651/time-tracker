import api from '../api';

export async function listProjects() {
  const res = await api.get('/projects');
  return res.data;
}

export async function getProject(id) {
  const res = await api.get(`/projects/${id}`);
  return res.data;
}

export async function createProject(data) {
  const res = await api.post('/projects', data);
  return res.data;
}

export async function updateProject(id, data) {
  const res = await api.put(`/projects/${id}`, data);
  return res.data;
}

export async function deleteProject(id) {
  const res = await api.delete(`/projects/${id}`);
  return res.data;
}

export async function assignEmployees(projectId, employeeIds) {
  const res = await api.post(`/projects/${projectId}/employees`, { employeeIds });
  return res.data;
}

export async function removeEmployee(projectId, employeeId) {
  const res = await api.delete(`/projects/${projectId}/employees/${employeeId}`);
  return res.data;
} 