import React from 'react';
import Layout from '../components/Layout';

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
  if (!user) {
    return (
      <Layout>
        <div className="text-center text-red-500">You must be logged in to view this page.</div>
      </Layout>
    );
  }
  return (
    <Layout>
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 flex flex-col gap-6 items-center">
        <h2 className="text-3xl font-extrabold text-indigo-700 mb-1">Welcome{user.email ? `, ${user.email}` : ''}!</h2>
        <p className="text-gray-500 text-sm mb-4">Download the desktop app to start tracking your time.</p>
        <a
          href="/download/desktop-app"
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg shadow font-semibold hover:bg-indigo-700 transition"
          download
        >
          Download Desktop App
        </a>
      </div>
    </Layout>
  );
} 