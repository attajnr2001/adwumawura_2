import React, { useState, useEffect, useContext } from "react";
import { Email, Lock, ArrowForward } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState({});
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    const handleMouseMove = (e) =>
      setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible((prev) => ({
            ...prev,
            [entry.target.id]: entry.isIntersecting,
          }));
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll("[data-animate]");
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          username,
          password,
        }
      );
      const { user, token } = response.data;
      login(user, token); // Store user and token in context
      setError("");
      navigate("/user/dashboard"); // Navigate to dashboard after login
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
      console.error("Login error:", err);
    }
  };

  return (
    <div className="bg-black text-white min-h-screen overflow-hidden flex items-center justify-center">
      <div
        className="fixed inset-0 z-0"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(147, 51, 234, 0.1) 0%, transparent 50%)`,
        }}
      />

      <div
        className="relative z-10 max-w-md w-full mx-auto p-8 bg-gray-800/50 border border-gray-700 rounded-3xl space-y-8"
        id="login-form"
        data-animate
      >
        <h2 className="text-4xl font-black text-center">
          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Welcome Back
          </span>
        </h2>
        <p className="text-gray-300 text-center">
          Log in to connect with artisans or showcase your craft.
        </p>

        {error && <p className="text-red-400 text-center">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <Email className="absolute top-1/2 left-4 transform -translate-y-1/2 text-yellow-400" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-900/40 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-all"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute top-1/2 left-4 transform -translate-y-1/2 text-yellow-400" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-900/40 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-all"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-8 py-4 rounded-xl font-bold hover:scale-105 transition-all"
          >
            Log In <ArrowForward className="ml-2 inline-block" />
          </button>
        </form>

        <div className="text-center text-gray-400">
          <p>
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-yellow-400 hover:text-yellow-300 font-semibold"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
