import React from "react";
import { Link, useNavigate } from "react-router-dom";

function getUserFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch {
    return null;
  }
}

const HomePage = () => {
  const user = getUserFromToken();
  const navigate = useNavigate();

  let dashboardButton = null;
  if (user) {
    if (user.email && user.email.startsWith("admin@")) {
      dashboardButton = (
        <button
          className="bg-gradient-to-r from-purple-600 to-blue-500 text-white px-6 py-3 rounded-lg shadow-lg text-lg font-semibold hover:scale-105 transition-transform duration-200 mr-2"
          onClick={() => navigate("/admin/employees")}
        >
          Admin Employees
        </button>
      );
    } else {
      dashboardButton = (
        <button
          className="bg-gradient-to-r from-purple-600 to-blue-500 text-white px-6 py-3 rounded-lg shadow-lg text-lg font-semibold hover:scale-105 transition-transform duration-200 mr-2"
          onClick={() => navigate("/dashboard")}
        >
          Dashboard
        </button>
      );
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-100 to-blue-200 overflow-hidden">
      {/* Decorative blurred background shapes */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 opacity-30 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300 opacity-30 rounded-full blur-3xl -z-10 animate-pulse delay-1000" />
      <main className="z-10 flex flex-col items-center justify-center w-full max-w-2xl px-6 py-16 bg-white/80 rounded-3xl shadow-2xl backdrop-blur-md border border-white/40">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4 tracking-tight drop-shadow-lg">
          AI-Powered Time Tracker
        </h1>
        <p className="text-lg text-gray-700 mb-8 max-w-xl text-center">
          Effortlessly track your team's productivity with smart, AI-driven insights. Modern, secure, and built for remote teams and enterprises.
        </p>
        {!user && (
          <div className="flex space-x-6 mb-6">
            <Link to="/login">
              <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg shadow-lg text-lg font-semibold hover:scale-105 transition-transform duration-200">
                Login
              </button>
            </Link>
            <Link to="/signup">
              <button className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-8 py-3 rounded-lg shadow-lg text-lg font-semibold hover:scale-105 transition-transform duration-200">
                Sign Up
              </button>
            </Link>
          </div>
        )}
        {dashboardButton}
        <div className="mt-10 text-gray-400 text-xs">© {new Date().getFullYear()} Time Tracker AI SaaS. All rights reserved.</div>
      </main>
    </div>
  );
};

export default HomePage; 