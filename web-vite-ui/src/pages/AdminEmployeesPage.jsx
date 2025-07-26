import React, { useEffect, useState } from 'react';
import api from '../api';
import Layout from '../components/Layout';

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchEmployees = async () => {
    try {
      // Try GET /employees (backend must support this for admin)
      const res = await api.get('/employees');
      setEmployees(res.data);
    } catch (err) {
      setError('Failed to load employees. Make sure you are logged in as admin and backend supports GET /employees.');
    }
  };

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/employees', { email });
      setSuccess('Employee added and activation email sent');
      setEmail('');
      fetchEmployees();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add employee');
    }
  };

  return (
    <Layout>
      <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 flex flex-col gap-8">
        <div>
          <h2 className="text-3xl font-extrabold text-indigo-700 mb-1">Employees</h2>
          <p className="text-gray-500 text-sm">Manage your team and onboard new employees.</p>
        </div>
        <form onSubmit={handleAdd} className="flex gap-2 mb-2">
          <input
            type="email"
            placeholder="Employee Email"
            className="border border-gray-300 p-3 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition">Add</button>
        </form>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {success && <div className="text-green-600 mb-2">{success}</div>}
        <ul className="divide-y">
          {employees.map(emp => (
            <li key={emp.id} className="py-3 flex items-center justify-between">
              <span className="font-medium text-gray-700">{emp.email}</span>
              <span className={`text-xs px-2 py-1 rounded ${emp.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{emp.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
} 