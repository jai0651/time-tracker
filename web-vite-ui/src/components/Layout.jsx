import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { Button } from '@radix-ui/themes';

function getUserFromToken() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
}

export default function Layout({ children }) {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');
  const user = getUserFromToken();
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
        <nav className="flex gap-2 items-center">
          {isAuthenticated && user && (
            <>
              {user.email === 'jai@admin' ? (
                <>
                  <Link to="/admin/employee" className="text-gray-600 hover:text-indigo-700 font-medium px-3 py-1">Employee</Link>
                  <Link to="/admin/project" className="text-gray-600 hover:text-indigo-700 font-medium px-3 py-1">Project</Link>
                  <Link to="/admin/task" className="text-gray-600 hover:text-indigo-700 font-medium px-3 py-1">Task</Link>
                  <Link to="/admin/shift" className="text-gray-600 hover:text-indigo-700 font-medium px-3 py-1">Shift</Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard" className="text-gray-600 hover:text-indigo-700 font-medium px-3 py-1">Dashboard</Link>
                </>
              )}
            </>
          )}
          {isAuthenticated && (
            <Button 
              onClick={handleLogout} 
              className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl ml-4"
            >
              Logout
            </Button>
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