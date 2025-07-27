import api from '../api';

export async function listProjects() {
  const res = await api.get('/project');
  return res.data;
}

export async function getProject(id) {
  const res = await api.get(`/project/${id}`);
  return res.data;
}

export async function createProject(data) {
  const res = await api.post('/project', data);
  return res.data;
}

export async function updateProject(id, data) {
  const res = await api.put(`/project/${id}`, data);
  return res.data;
}

export async function deleteProject(id) {
  const res = await api.delete(`/project/${id}`);
  return res.data;
}

export async function assignEmployees(projectId, employeeIds) {
  const res = await api.put(`/project/${projectId}`, { employees: employeeIds });
  return res.data;
}

export async function removeEmployee(projectId, employeeId) {
  // Get current project employees and remove the specific employee
  const project = await getProject(projectId);
  const currentEmployees = project.employees?.map(emp => emp.id) || [];
  const updatedEmployees = currentEmployees.filter(id => id !== employeeId);
  const res = await api.put(`/project/${projectId}`, { employees: updatedEmployees });
  return res.data;
}

// Additional functions that were in api.js
export async function assignEmployeesToProject(projectId, employeeIds) {
  const res = await api.put(`/project/${projectId}`, { employees: employeeIds });
  return res.data;
}

export async function removeEmployeeFromProject(projectId, employeeId) {
  // Get current project employees and remove the specific employee
  const project = await getProject(projectId);
  const currentEmployees = project.employees?.map(emp => emp.id) || [];
  const updatedEmployees = currentEmployees.filter(id => id !== employeeId);
  const res = await api.put(`/project/${projectId}`, { employees: updatedEmployees });
  return res.data;
} 