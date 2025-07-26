import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api";

const ActivatePage = () => {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ token: "", name: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("token"); // "token" or "password"
  const [employeeEmail, setEmployeeEmail] = useState("");
  const navigate = useNavigate();

  // Auto-extract token from URL params on component mount
  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setForm(prev => ({ ...prev, token: tokenFromUrl }));
      handleTokenSubmit(tokenFromUrl);
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTokenSubmit = async (token = form.token) => {
    setError("");
    setSuccess("");
    setLoading(true);
    
    try {
      const response = await api.post("/auth/validate-token", { token });
      setEmployeeEmail(response.data.email);
      setStep("password");
      setSuccess("Token validated! Please complete your profile.");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid activation token.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Validate name
    if (!form.name.trim()) {
      setError("Name is required.");
      setLoading(false);
      return;
    }

    // Validate passwords match
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    // Validate password strength
    if (form.password.length < 4) {
      setError("Password must be at least 4 characters long.");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/auth/activate", {
        token: form.token,
        name: form.name.trim(),
        password: form.password
      });
      
      setSuccess("Account activated successfully! Logging you in...");
      
      // Store the token and redirect
      localStorage.setItem("token", response.data.token);
      
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Activation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === "token") {
      await handleTokenSubmit();
    } else {
      await handlePasswordSubmit(e);
    }
  };

  if (step === "password") {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-100 to-blue-200 overflow-hidden">
        {/* Decorative blurred background shapes */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 opacity-30 rounded-full blur-3xl -z-10 animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300 opacity-30 rounded-full blur-3xl -z-10 animate-pulse delay-1000" />
        <main className="z-10 flex flex-col items-center justify-center w-full max-w-md px-6 py-12 bg-white/80 rounded-3xl shadow-2xl backdrop-blur-md border border-white/40">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4 drop-shadow-lg">Complete Profile</h2>
          <p className="text-gray-600 mb-6 text-center">Set your name and password to activate your account</p>
          
          <form onSubmit={handleSubmit} className="w-full space-y-5">
            <div>
              <label className="block mb-1 font-medium text-gray-700" htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={employeeEmail}
                readOnly
                className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>
            
            <div>
              <label className="block mb-1 font-medium text-gray-700" htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <label className="block mb-1 font-medium text-gray-700" htmlFor="password">New Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your new password"
              />
            </div>
            
            <div>
              <label className="block mb-1 font-medium text-gray-700" htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Confirm your new password"
              />
            </div>
            
            {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}
            {success && <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg">{success}</div>}
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg shadow-lg text-lg font-semibold hover:scale-105 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Activating..." : "Activate Account"}
            </button>
          </form>
          
          <div className="mt-6 text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline font-semibold">Sign In</Link>
          </div>
          
          <div className="mt-10 text-gray-400 text-xs">© {new Date().getFullYear()} Time Tracker AI SaaS. All rights reserved.</div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-100 to-blue-200 overflow-hidden">
      {/* Decorative blurred background shapes */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 opacity-30 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300 opacity-30 rounded-full blur-3xl -z-10 animate-pulse delay-1000" />
      <main className="z-10 flex flex-col items-center justify-center w-full max-w-md px-6 py-12 bg-white/80 rounded-3xl shadow-2xl backdrop-blur-md border border-white/40">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4 drop-shadow-lg">Activate Account</h2>
        <p className="text-gray-600 mb-6 text-center">Enter your activation token to get started</p>
        
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <div>
            <label className="block mb-1 font-medium text-gray-700" htmlFor="token">Activation Token</label>
            <input
              type="text"
              id="token"
              name="token"
              value={form.token}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your activation token"
            />
          </div>
          
          {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}
          {success && <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg">{success}</div>}
          
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg shadow-lg text-lg font-semibold hover:scale-105 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Validating..." : "Continue"}
          </button>
        </form>
        
        <div className="mt-6 text-sm text-gray-600">
          Already activated?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-semibold">Sign In</Link>
        </div>
        
        <div className="mt-10 text-gray-400 text-xs">© {new Date().getFullYear()} Time Tracker AI SaaS. All rights reserved.</div>
      </main>
    </div>
  );
};

export default ActivatePage; 