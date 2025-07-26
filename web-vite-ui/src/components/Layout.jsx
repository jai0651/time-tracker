import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    navigate('/login');
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex flex-col">
      <header className="bg-white shadow-md py-4 px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-extrabold text-indigo-700 tracking-tight">insightful<span className="text-blue-500">.io</span></span>
        </Link>
        <nav className="flex gap-4 items-center">
          <Link to="/login" className="text-gray-600 hover:text-indigo-700 font-medium">Login</Link>
          <Link to="/dashboard" className="text-gray-600 hover:text-indigo-700 font-medium">Dashboard</Link>
          {isAuthenticated && (
            <button onClick={handleLogout} className="ml-4 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded transition">Logout</button>
          )}
        </nav>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        {children}
      </main>
      <footer className="text-center text-gray-400 py-4 text-xs">© {new Date().getFullYear()} insightfull.io clone</footer>
    </div>
  );
} 