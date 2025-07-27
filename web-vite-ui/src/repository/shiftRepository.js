import api from '../api';

export async function getShifts(options = {}) {
  const params = new URLSearchParams();
  
  if (options.employeeId) params.append('employeeId', options.employeeId);
  if (options.projectId) params.append('projectId', options.projectId);
  if (options.taskId) params.append('taskId', options.taskId);
  if (options.start) params.append('start', options.start);
  if (options.end) params.append('end', options.end);
  if (options.limit) params.append('limit', options.limit);
  if (options.offset) params.append('offset', options.offset);
  
  const res = await api.get(`/shift?${params.toString()}`);
  return res.data;
}

export async function getShift(id) {
  const res = await api.get(`/shift/${id}`);
  return res.data;
}

export async function createShift(shiftData) {
  console.log('createShift called with data:', shiftData);
  console.log('Making POST request to /shift');
  
  const res = await api.post('/shift', shiftData);
  console.log('API response:', res.data);
  return res.data;
}

export async function endShift(shiftId) {
  const res = await api.patch(`/shift/${shiftId}/end`);
  return res.data;
}

export async function getTodayShifts() {
  const res = await api.get('/shift/today');
  return res.data;
} 