import React, { useState, useEffect } from "react";
import { Person, Email, Lock, Image, ArrowForward } from "@mui/icons-material";
import { Link } from "react-router-dom";

const Signup = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState({});
  const [profilePic, setProfilePic] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setPreviewUrl(URL.createObjectURL(file));
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

        <div className="space-y-6">
          <div className="relative">
            <Person className="absolute top-1/2 left-4 transform -translate-y-1/2 text-yellow-400" />
            <input
              type="text"
              placeholder="Username"
              className="w-full pl-12 pr-4 py-3 bg-gray-900/40 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-all"
            />
          </div>
          <div className="relative">
            <Email className="absolute top-1/2 left-4 transform -translate-y-1/2 text-yellow-400" />
            <input
              type="email"
              placeholder="Email Address"
              className="w-full pl-12 pr-4 py-3 bg-gray-900/40 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-all"
            />
          </div>
          <div className="relative">
            <Lock className="absolute top-1/2 left-4 transform -translate-y-1/2 text-yellow-400" />
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-12 pr-4 py-3 bg-gray-900/40 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-all"
            />
          </div>
          <div className="relative">
            <Image className="absolute top-1/2 left-4 transform -translate-y-1/2 text-yellow-400" />
            <input
              type="file"
              accept="w-full pl-12 pr-4 py-3 bg-gray-900/40 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-all cursor-pointer"
              onChange={handleImageChange}
            />
            {previewUrl && (
              <div className="mt-4 flex justify-center">
                <img
                  src={previewUrl}
                  alt="Profile Preview"
                  className="w-24 h-16 rounded-full object-cover border border-yellow-300"
                />
              </div>
            )}
          </div>
          <button className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-8 py-4 rounded-xl font-bold hover:scale-105 transition-all">
            Sign Up <ArrowForward className="ml-2 inline-block" />
          </button>
        </div>

        <div className="text-center text-gray-400">
          <p>
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-yellow-400 hover:underline textyellow-300"
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
