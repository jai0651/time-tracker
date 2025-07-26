import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api';

function getUserFromToken() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return null;
  }
}

export default function DashboardPage() {
  const user = getUserFromToken();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('DashboardPage user:', user);
    if (user && user.userId) {
      setLoading(true);
      api.get(`/employees/${user.userId}`)
        .then(res => {
          console.log('Employee API response:', res.data);
          setEmployee(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Employee API error:', err);
          setError('Failed to load employee data');
          setLoading(false);
        });
    } else {
      setLoading(false);
      setError('No user ID found in token.');
    }
  }, []); // Remove user from dependency array

  if (!user) {
    return (
      <Layout>
        <div className="text-center text-red-500">You must be logged in to view this page.</div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="text-center text-gray-500">Loading...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center text-red-500">{error}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full max-w-xl mx-auto bg-white rounded-2xl shadow-xl p-8 flex flex-col gap-6 items-center">
        <h2 className="text-3xl font-extrabold text-indigo-700 mb-1">Welcome{employee?.email ? `, ${employee.email}` : ''}!</h2>
        <p className="text-gray-500 text-sm mb-4">Download the desktop app to start tracking your time.</p>
        <a
          href="/download/desktop-app"
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg shadow font-semibold hover:bg-indigo-700 transition"
          download
        >
          Download Desktop App
        </a>
        {/* Projects Section */}
        <div className="w-full mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Your Projects</h3>
          {employee.projects && employee.projects.length > 0 ? (
            <ul className="space-y-2">
              {employee.projects.map(project => (
                <li key={project.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="font-medium text-gray-900">{project.name}</div>
                  {project.description && <div className="text-sm text-gray-500">{project.description}</div>}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500 text-sm">You are not assigned to any projects.</div>
          )}
        </div>
        {/* Tasks Section */}
        <div className="w-full mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Your Tasks</h3>
          {employee.tasks && employee.tasks.length > 0 ? (
            <ul className="space-y-2">
              {employee.tasks.map(task => (
                <li key={task.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="font-medium text-gray-900">{task.name}</div>
                  {task.project && <div className="text-sm text-gray-500">Project: {task.project.name}</div>}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500 text-sm">You are not assigned to any tasks.</div>
          )}
        </div>
      </div>
    </Layout>
  );
} 