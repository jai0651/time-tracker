import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminEmployeesPage from './pages/AdminEmployeesPage';
import ActivatePage from './pages/ActivatePage';
import DashboardPage from './pages/DashboardPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import ProjectsPage from './pages/ProjectsPage';
import TasksPage from './pages/TasksPage';
import TimeEntriesPage from './pages/TimeEntriesPage';
import { jwtDecode } from 'jwt-decode';

function getUserFromToken() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  const user = jwtDecode(token);
  return user;
}

function RequireAuth({ children }) {
  const user = getUserFromToken();
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children ? children : <Outlet />;
}

function RequireAdmin({ children }) {
  const user = getUserFromToken();
  const location = useLocation();
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children ? children : <Outlet />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/activate" element={<ActivatePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/" element={<HomePage />} />
        <Route element={<RequireAdmin />}>
          <Route path="/admin/employees" element={<AdminEmployeesPage />} />
          <Route path="/admin/projects" element={<ProjectsPage />} />
          <Route path="/admin/tasks" element={<TasksPage />} />
        </Route>
        <Route element={<RequireAuth />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/time-entries" element={<TimeEntriesPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
