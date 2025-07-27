import api from '../api';

export async function listEmployees() {
  const res = await api.get('/employee');
  return res.data;
}

export async function getEmployee(id) {
  const res = await api.get(`/employee/${id}`);
  return res.data;
}

export async function createEmployee(data) {
  const res = await api.post('/employee', data);
  return res.data;
}

export async function updateEmployee(id, data) {
  const res = await api.put(`/employee/${id}`, data);
  return res.data;
}

export async function deleteEmployee(id) {
  const res = await api.delete(`/employee/${id}`);
  return res.data;
}

export async function deactivateEmployee(id) {
  const res = await api.patch(`/employee/${id}/deactivate`);
  return res.data;
} 