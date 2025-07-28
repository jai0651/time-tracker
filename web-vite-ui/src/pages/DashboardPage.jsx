import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api';
import downloadRepository from '../repository/downloadRepository.js';

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
  const [downloadInfo, setDownloadInfo] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    console.log('DashboardPage user:', user);
    if (user && user.userId) {
      setLoading(true);
      
      // Load employee data and download info
      Promise.all([
        api.get(`/employee/${user.userId}`),
        downloadRepository.getDesktopAppInfo().catch(err => {
          console.error('Download info error:', err);
          return null;
        })
      ])
        .then(([employeeRes, downloadRes]) => {
          console.log('Employee API response:', employeeRes.data);
          setEmployee(employeeRes.data);
          setDownloadInfo(downloadRes);
          setLoading(false);
        })
        .catch((err) => {
          console.error('API error:', err);
          setError('Failed to load data');
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

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await downloadRepository.downloadDesktopApp();
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Layout>
      <div className="w-full max-w-xl mx-auto bg-white rounded-2xl shadow-xl p-8 flex flex-col gap-6 items-center">
        <h2 className="text-3xl font-extrabold text-indigo-700 mb-1">Welcome{employee?.email ? `, ${employee.email}` : ''}!</h2>
        
        {/* Desktop App Download Section */}
        <div className="w-full bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
          <h3 className="text-lg font-semibold text-indigo-800 mb-2">📱 Desktop App</h3>
          <p className="text-gray-600 text-sm mb-4">
            Download the desktop app to start tracking your time with automatic screenshots and activity monitoring.
          </p>
          
          {downloadInfo ? (
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Version:</span>
                <span className="font-medium">{downloadInfo.version}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Platform:</span>
                <span className="font-medium">{downloadInfo.platform}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">File Size:</span>
                <span className="font-medium">{downloadInfo.fileSizeFormatted}</span>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500 mb-4">
              Loading download information...
            </div>
          )}
          
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-lg shadow font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloading ? 'Downloading...' : 'Download Desktop App'}
            </button>
            
            <a
              href={downloadRepository.getDesktopAppDownloadUrl()}
              className="px-4 py-3 border border-indigo-300 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition"
              download
            >
              Direct Link
            </a>
          </div>
          
          <div className="mt-3 text-xs text-gray-500">
            ⚡ Features: Automatic screenshots, activity tracking, time monitoring
          </div>
        </div>
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