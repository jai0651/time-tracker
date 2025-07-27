import api from '../api';

export async function getTeamSuggestions() {
  const res = await api.get('/teams/suggestions');
  return res.data;
} 