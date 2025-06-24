import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Work, AttachMoney, Person, Group } from "@mui/icons-material";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const JobDetails = () => {
  const { user, token } = useContext(AuthContext);
  const { state } = useLocation();
  const navigate = useNavigate();
  const job = state?.job || {};
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState({});
  const [hasApplied, setHasApplied] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleApply = async () => {
    if (!user || !token) {
      setError("Please log in to apply.");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `/api/jobs/apply/${job._id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setHasApplied(true);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to apply. Please try again."
      );
      console.error("Apply error:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  if (!job._id) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <p className="text-red-400 text-xl">Job not found.</p>
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen overflow-hidden">
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(147, 51, 234, 0.1) 0%, transparent 50%)`,
        }}
      />

      <section className="relative z-10 py-24 px-6 sm:px-8 lg:px-12 xl:px-16">
        <div className="max-w-4xl mx-auto">
          {error && <p className="text-red-400 text-center mb-8">{error}</p>}
          <div
            className="bg-gray-800/50 border border-gray-700 rounded-3xl p-8"
            id="job-details"
            data-animate
          >
            <h2 className="text-3xl font-bold text-white mb-4">{job.title}</h2>
            <p className="text-gray-300 mb-6">{job.description}</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {job.skills?.map((skill, i) => (
                <span
                  key={i}
                  className="bg-gray-800/50 text-gray-300 text-sm px-3 py-1 rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
            <div className="flex items-center text-gray-300 mb-4">
              <AttachMoney className="text-yellow-400 mr-1" />
              <span>{job.budget}</span>
            </div>
            <div className="flex items-center text-gray-300 mb-4">
              <Person className="text-yellow-400 mr-1" />
              <span>Posted by {job.postedBy?.name || "Anonymous"}</span>
            </div>
            <div className="flex items-center text-gray-300 mb-6">
              <Group className="text-yellow-400 mr-1" />
              <span>{job.applicants?.length || 0} Applicants</span>
            </div>
            <button
              onClick={handleApply}
              disabled={hasApplied || loading}
              className={`w-full md:w-auto bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-8 py-3 rounded-xl font-bold hover:scale-105 transition-all ${
                hasApplied || loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Applying..." : hasApplied ? "Applied" : "Apply Now"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default JobDetails;
