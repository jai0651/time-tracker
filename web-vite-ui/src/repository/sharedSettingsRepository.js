import api from '../api';

export async function getSharedSettings() {
  const res = await api.get('/shared-settings');
  return res.data;
}

export async function createSharedSettings(data) {
  const res = await api.post('/shared-settings', data);
  return res.data;
}

export async function updateSharedSettings(id, data) {
  const res = await api.put(`/shared-settings/${id}`, data);
  return res.data;
} 