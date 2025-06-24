import React, { useState, useEffect, useContext, useRef } from "react";
import { Work, Search, AttachMoney, Person } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const PostJob = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [jobForm, setJobForm] = useState({
    title: "",
    description: "",
    skills: "",
    budget: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const observerRef = useRef(null);

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
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({
              ...prev,
              [entry.target.id]: true,
            }));
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.01,
        rootMargin: "100px",
      }
    );
    observerRef.current = observer;

    const elements = document.querySelectorAll("[data-testid]");
    elements.forEach((element) => observer.observe(element));

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/jobs/all");
        setJobs(response.data);
        setFilteredJobs(response.data);
      } catch (err) {
        setError("Failed to load jobs. Please try again.");
        console.error("Fetch jobs error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(lowerQuery) ||
        job.skills.some((skill) => skill.toLowerCase().includes(lowerQuery))
    );
    setFilteredJobs(filtered);
  }, [searchQuery, jobs]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setJobForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !token) {
      setError("Please log in to post a job.");
      navigate("/login");
      return;
    }

    const payload = {
      ...jobForm,
      name: user.name || user.username || "Anonymous", // Ensure name is sent
    };
    console.log("Posting job with payload:", payload); // Debug log

    setLoading(true);
    try {
      const response = await axios.post("/api/jobs/create", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const newJob = response.data.job;
      setJobs((prev) => [newJob, ...prev]);
      setFilteredJobs((prev) => [newJob, ...prev]);
      setJobForm({ title: "", description: "", skills: "", budget: "" });
      setError("");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to post job. Please try again.";
      setError(errorMessage);
      console.error("Post job error:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black text-white min-h-screen overflow-hidden">
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(147, 51, 234, 0.1) 0%, transparent 50%)`,
        }}
      />

      <section className="relative z-10 py-24 px-6 sm:px-8 lg:px-12 xl:px-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-center mb-8">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Post a Job
            </span>
          </h2>
          <p className="text-lg text-gray-400 text-center max-w-3xl mx-auto mb-12">
            Create a job request to connect with skilled artisans or browse
            existing job postings.
          </p>

          {error && <p className="text-red-400 text-center mb-8">{error}</p>}

          {/* Job Posting Form */}
          <div className="max-w-xl mx-auto mb-16">
            <div
              className="bg-gray-800/50 border border-gray-700 rounded-3xl p-8"
              id="job-form"
              data-testid="job-form"
            >
              <h3 className="text-2xl font-bold text-white mb-6">
                Create a Job Request
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <Work className="absolute top-1/2 left-4 transform -translate-y-1/2 text-yellow-400" />
                  <input
                    type="text"
                    name="title"
                    placeholder="Job Title"
                    value={jobForm.title}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 bg-gray-900/40 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-all"
                    required
                  />
                </div>
                <div className="relative">
                  <textarea
                    name="description"
                    placeholder="Job Description"
                    value={jobForm.description}
                    onChange={handleInputChange}
                    className="w-full pl-4 pr-4 py-3 bg-gray-900/40 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-all"
                    rows="4"
                    required
                  />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    name="skills"
                    placeholder="Required Skills (e.g., Woodworking, Painting)"
                    value={jobForm.skills}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 bg-gray-900/40 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-all"
                    required
                  />
                </div>
                <div className="relative">
                  <AttachMoney className="absolute top-1/2 left-4 transform -translate-y-1/2 text-yellow-400" />
                  <input
                    type="text"
                    name="budget"
                    placeholder="Budget Range (e.g., GH₵5,000 - GH₵7,000)"
                    value={jobForm.budget}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-900/40 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-all"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-8 py-4 rounded-xl font-bold hover:scale-105 transition-all"
                  disabled={loading}
                >
                  {loading ? "Posting..." : "Post Job"}
                </button>
              </form>
            </div>
          </div>

          {/* Existing Job Postings */}
          <h3 className="text-3xl font-bold text-center text-white mb-8">
            Browse Job Posts
          </h3>
          <div className="max-w-xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute top-3 left-4 text-yellow-400" />
              <input
                type="text"
                placeholder="Search by job title or skill..."
                className="w-full pl-10 pr-4 py-3 bg-gray-900/40 border border-gray-700 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <p className="text-center text-gray-400 mt-4">Loading jobs...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredJobs.map((job) => (
                <div
                  key={job._id}
                  id={`job-${job._id}`}
                  data-testid={`job-${job._id}`}
                  className="group relative bg-gradient-to-br from-yellow-400/40 to-orange-500/40 backdrop-blur-sm rounded-lg p-8 border border-gray-700/20 transition-all duration-500 hover:scale-105 opacity-100"
                >
                  <div className="flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {job.title}
                    </h3>
                    <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                      {job.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.skills.map((skill, i) => (
                        <span
                          key={i}
                          className="bg-gray-800/50 text-gray-300 text-sm px-3 py-1 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center text-gray-300 mb-2">
                      <AttachMoney className="text-yellow-400 mr-1" />
                      <span>{job.budget}</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Person className="text-yellow-400 mr-1" />
                      <span>Posted by {job.postedBy.name}</span>
                    </div>
                    <Link
                      to={`/user/job/${job._id}`}
                      state={{ job }}
                      className="mt-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-2 rounded-xl font-bold hover:scale-105 transition-all inline-block"
                    >
                      Apply Now
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
          {filteredJobs.length === 0 && !loading && (
            <p className="text-center text-gray-400 mt-12">
              No jobs found. Try adjusting your search.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default PostJob;
