import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const ActivatePage = () => {
  const [form, setForm] = useState({ token: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      setTimeout(() => {
        setSuccess("Activation successful! You can now log in.");
        setLoading(false);
        setTimeout(() => navigate("/login"), 1200);
      }, 1000);
    } catch (err) {
      setError("Activation failed. Please check your token.");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-100 to-blue-200 overflow-hidden">
      {/* Decorative blurred background shapes */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 opacity-30 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300 opacity-30 rounded-full blur-3xl -z-10 animate-pulse delay-1000" />
      <main className="z-10 flex flex-col items-center justify-center w-full max-w-md px-6 py-12 bg-white/80 rounded-3xl shadow-2xl backdrop-blur-md border border-white/40">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4 drop-shadow-lg">Activate Account</h2>
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <div>
            <label className="block mb-1 font-medium" htmlFor="token">Activation Token</label>
            <input
              type="text"
              id="token"
              name="token"
              value={form.token}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg shadow-lg text-lg font-semibold hover:scale-105 transition-transform duration-200"
            disabled={loading}
          >
            {loading ? "Activating..." : "Activate"}
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