import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import { jwtDecode } from "jwt-decode";
import { Button as RadixButton } from '@radix-ui/themes';
import { Label } from '@radix-ui/react-label';

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      const token = res.data.token;
      localStorage.setItem("token", token);
      // Decode JWT to get user info
      const decodedToken = jwtDecode(token);
      if (decodedToken.email === "jai@admin") {
        navigate("/admin/employee");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(
        err.response?.data?.error || "Login failed. Please check your credentials."
      );
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-100 to-blue-200 overflow-hidden">
      {/* Decorative blurred background shapes */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 opacity-30 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300 opacity-30 rounded-full blur-3xl -z-10 animate-pulse delay-1000" />
      <main className="z-10 flex flex-col items-center justify-center w-full max-w-md px-6 py-12 bg-white/80 rounded-3xl shadow-2xl backdrop-blur-md border border-white/40">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4 drop-shadow-lg">Sign In</h2>
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <div>
            <Label className="block mb-1 font-medium" htmlFor="email">Email</Label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <Label className="block mb-1 font-medium" htmlFor="password">Password</Label>
            <input
              type="password"
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <RadixButton
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg shadow-lg text-lg font-semibold hover:scale-105 transition-transform duration-200"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </RadixButton>
        </form>
        <div className="mt-6 text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 hover:underline font-semibold">Sign Up</Link>
        </div>
        <div className="mt-10 text-gray-400 text-xs">© {new Date().getFullYear()} Time Tracker AI SaaS. All rights reserved.</div>
      </main>
    </div>
  );
};

export default LoginPage; 