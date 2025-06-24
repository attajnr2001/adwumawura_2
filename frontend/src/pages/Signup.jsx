import React, { useState, useEffect, useContext } from "react";
import { Person, Email, Lock, Image, ArrowForward, LocationOn, Phone } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const Signup = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState({});
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    location: "",
    phone: "",
    address: "",
    skills: "",
    bio: "",
  });
  const [profilePic, setProfilePic] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image must be less than 5MB");
        return;
      }

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        setError("Only JPEG and PNG images are allowed");
        return;
      }

      setProfilePic(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = new FormData();
      data.append("username", formData.username);
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("password", formData.password);
      if (formData.location) data.append("location", formData.location);
      if (formData.phone) data.append("phone", formData.phone);
      if (formData.address) data.append("address", formData.address);
      if (formData.skills) data.append("skills", formData.skills);
      if (formData.bio) data.append("bio", formData.bio);
      if (profilePic) data.append("image", profilePic);

      console.log("Sending signup data:");
      for (let [key, value] of data.entries()) {
        console.log(`${key}: ${value}`);
      }

      const response = await axios.post("/api/auth/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Signup response:", response.data);

      // Log in the user
      const { user, token } = response.data;
      login(user, token);

      // Navigate to dashboard
      navigate("/user/dashboard");
    } catch (err) {
      console.error("Signup error:", err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 400) {
        setError("Invalid input. Please check your details.");
      } else {
        setError("Failed to register. Please try again.");
      }
    } finally {
      setLoading(false);
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
        id="signup-form"
        data-animate
      >
        <h2 className="text-4xl font-black text-center">
          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Join Artisan Hub
          </span>
        </h2>
        <p className="text-gray-300 text-center">
          Create an account to showcase your craft or connect with artisans.
        </p>

        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-xl p-4">
            <p className="text-red-400 text-center">{error}</p>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-6">
          <div className="relative">
            <Person className="absolute top-1/2 left-4 transform -translate-y-1/2 text-yellow-400" />
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Username"
              className="w-full pl-12 pr-4 py-3 bg-gray-900/40 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-all"
              required
            />
          </div>
          <div className="relative">
            <Person className="absolute top-1/2 left-4 transform -translate-y-1/2 text-yellow-400" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Full Name"
              className="w-full pl-12 pr-4 py-3 bg-gray-900/40 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-all"
              required
            />
          </div>
          <div className="relative">
            <Email className="absolute top-1/2 left-4 transform -translate-y-1/2 text-yellow-400" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email Address"
              className="w-full pl-12 pr-4 py-3 bg-gray-900/40 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-all"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute top-1/2 left-4 transform -translate-y-1/2 text-yellow-400" />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Password"
              className="w-full pl-12 pr-4 py-3 bg-gray-900/40 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-all"
              required
            />
          </div>
          <div className="relative">
            <LocationOn className="absolute top-1/2 left-4 transform -translate-y-1/2 text-yellow-400" />
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Location (optional)"
              className="w-full pl-12 pr-4 py-3 bg-gray-900/40 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-all"
            />
          </div>
          <div className="relative">
            <Phone className="absolute top-1/2 left-4 transform -translate-y-1/2 text-yellow-400" />
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Phone (optional)"
              className="w-full pl-12 pr-4 py-3 bg-gray-900/40 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-all"
            />
          </div>
          <div className="relative">
            <LocationOn className="absolute top-1/2 left-4 transform -translate-y-1/2 text-yellow-400" />
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Address (optional)"
              className="w-full pl-12 pr-4 py-3 bg-gray-900/40 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-all"
            />
          </div>
          <div className="relative">
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleInputChange}
              placeholder="Skills (optional, comma-separated)"
              className="w-full pl-12 pr-4 py-3 bg-gray-900/40 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-all"
            />
          </div>
          <div className="relative">
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Bio (optional)"
              className="w-full pl-12 pr-4 py-3 bg-gray-900/40 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-all resize-none"
              rows="4"
            />
          </div>
          <div className="relative">
            <Image className="absolute top-1/2 left-4 transform -translate-y-1/2 text-yellow-400" />
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleImageChange}
              className="w-full pl-12 pr-4 py-3 bg-gray-900/40 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-all cursor-pointer"
            />
            {previewUrl && (
              <div className="mt-4 flex justify-center">
                <img
                  src={previewUrl}
                  alt="Profile Preview"
                  className="w-24 h-24 rounded-full object-cover border border-yellow-300"
                />
              </div>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-8 py-4 rounded-xl font-bold hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Signing Up..." : "Sign Up"} <ArrowForward className="ml-2 inline-block" />
          </button>
        </form>

        <div className="text-center text-gray-400">
          <p>
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-yellow-400 hover:text-yellow-300 font-semibold"
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;