import React, { useState, useEffect, useContext } from "react";
import {
  Work,
  Person,
  CheckCircle,
  Phone,
  LocationOn,
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const Dashboard = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [jobs, setJobs] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleMouseMove = (e) =>
      setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !token) {
        setError("Please log in to view your dashboard.");
        navigate("/login");
        return;
      }

      console.log("Fetching data for user ID:", user._id);
      setLoading(true);
      try {
        // Fetch user jobs
        const jobsResponse = await axios.get(
          `/api/jobs/all?postedBy=${user._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("User jobs:", jobsResponse.data);
        setJobs(jobsResponse.data);

        // Fetch received messages
        const messagesResponse = await axios.get("/api/messages/received", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Received messages:", messagesResponse.data);
        setMessages(messagesResponse.data);

        setError("");
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load dashboard data."
        );
        console.error("Fetch data error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, token, navigate]);

  if (!user) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <p className="text-red-400 text-xl">
          Please log in to view your dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen">
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(147, 51, 234, 0.1) 0%, transparent 50%)`,
        }}
      />

      <section className="relative z-10 py-24 px-6 sm:px-4 lg:px-8 xl:px-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-center mb-8">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Your Dashboard
            </span>
          </h2>
          <p className="text-lg text-gray-400 text-center max-w-3xl mx-auto mb-12">
            View your job postings and messages from clients.
          </p>

          {error && <p className="text-red-400 text-center mb-8">{error}</p>}
          {loading && (
            <p className="text-center text-gray-400 mb-8">Loading...</p>
          )}

          {/* Debug info */}
          <div className="text-center mb-4 text-yellow-400 text-sm">
            <p>
              Jobs: {jobs.length} | Messages: {messages.length} | Loading:{" "}
              {loading ? "Yes" : "No"}
            </p>
          </div>

          {/* User's Job Posts */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-white mb-8">
              Your Job Postings
            </h3>
            {jobs.length === 0 && !loading ? (
              <p className="text-center text-gray-400">
                You haven't posted any jobs yet.{" "}
                <Link
                  to="/user/post-job"
                  className="text-yellow-400 hover:underline"
                >
                  Post a job now
                </Link>
                .
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job) => (
                  <Link
                    key={job._id}
                    to={`/user/job-applicants/${job._id}`}
                    state={{ job }}
                    className="group relative bg-gradient-to-br from-yellow-400/10 to-orange-500/10 backdrop-blur-sm rounded-3xl p-6 border border-yellow-400/30 transition-all duration-500 hover:scale-105 cursor-pointer"
                  >
                    <div className="flex flex-col text-left">
                      <h4 className="text-xl font-bold text-white mb-2">
                        {job.title || "Untitled"}
                      </h4>
                      <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                        {job.description || "No description"}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.skills?.length > 0 ? (
                          job.skills.map((skill, i) => (
                            <span
                              key={i}
                              className="bg-gray-800/50 text-gray-300 text-sm px-3 py-1 rounded-full"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500 text-sm">
                            No skills listed
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-gray-300 mb-4">
                        <Work className="text-yellow-400 mr-1" />
                        <span>{job.applicants?.length || 0} Applicants</span>
                      </div>
                      {job.acceptedApplicant?.userId && (
                        <div className="text-green-400 flex items-center">
                          <CheckCircle className="mr-1" />
                          <span>
                            Accepted: {job.acceptedApplicant.name || "Unknown"}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Client Messages */}
          <div>
            <h3 className="text-3xl font-bold text-white mb-8">
              Client Messages
            </h3>
            {messages.length === 0 && !loading ? (
              <p className="text-center text-gray-400">
                No messages received yet. Promote your skills in{" "}
                <Link
                  to="/user/profile"
                  className="text-yellow-400 hover:underline"
                >
                  your profile
                </Link>
                .
              </p>
            ) : (
              <div className="space-y-6">
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    className="bg-gray-800/50 border border-gray-700 rounded-3xl p-6"
                  >
                    <div className="flex flex-col">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center">
                          <Person className="text-yellow-400 mr-2" />
                          <h4 className="text-lg font-semibold text-white">
                            {msg.senderId?.name ||
                              msg.senderId?.username ||
                              "Unknown"}
                          </h4>
                        </div>
                        <span className="text-gray-400 text-sm">
                          {new Date(msg.timestamp).toLocaleString() ||
                            "Unknown"}
                        </span>
                      </div>
                      <div className="text-gray-300 mb-4">
                        <div className="flex items-center mb-2">
                          <Phone className="text-yellow-400 mr-2" />
                          <span>{msg.senderId?.phone || "No phone"}</span>
                        </div>
                        <div className="flex items-center">
                          <LocationOn className="text-yellow-400 mr-2" />
                          <span>{msg.senderId?.address || "No address"}</span>
                        </div>
                      </div>
                      <p className="text-gray-300 mb-4">
                        {msg.content || "No content"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
