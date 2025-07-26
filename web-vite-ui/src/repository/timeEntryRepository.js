import api from '../api';

export async function listTimeEntries(params = {}) {
  const res = await api.get('/time-entries', { params });
  return res.data;
}

export async function getTimeEntry(id) {
  const res = await api.get(`/time-entries/${id}`);
  return res.data;
} 