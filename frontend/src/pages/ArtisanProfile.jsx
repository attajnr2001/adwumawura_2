import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Star, StarBorder, LocationOn, Send } from "@mui/icons-material";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const ArtisanProfile = () => {
  const { state } = useLocation();
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const artisan = state?.artisan || {};
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState({});
  const [message, setMessage] = useState("");
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [averageRating, setAverageRating] = useState(
    artisan.averageRating || 0
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      { threshold: 0.01, rootMargin: "100px" }
    );

    const elements = document.querySelectorAll("[data-animate]");
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    console.log("Artisan image path:", artisan.image); // Debug log
  }, [artisan.image]);

  const handleSubmitMessage = async (e) => {
    e.preventDefault();
    if (!user || !token) {
      setError("Please log in to send a message.");
      navigate("/login");
      return;
    }
    if (!message.trim()) {
      setError("Message cannot be empty.");
      return;
    }
    if (!artisan._id) {
      setError("Invalid recipient ID.");
      return;
    }

    setLoading(true);
    try {
      const payload = { recipientId: artisan._id, content: message };
      console.log("Sending message payload:", payload);
      await axios.post("/api/messages/send", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("");
      setError("");
      console.log("Message sent to", artisan.name);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to send message.";
      setError(errorMessage);
      console.error("Send message error:", {
        message: errorMessage,
        status: err.response?.status,
        data: err.response?.data,
        stack: err.stack,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (!user || !token) {
      setError("Please log in to submit a rating.");
      navigate("/login");
      return;
    }
    if (userRating === 0) {
      setError("Please select a rating.");
      return;
    }
    if (!user.name && !user.username) {
      setError("User profile incomplete. Please set a name.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        rating: userRating,
        client: user.name || user.username,
        comment: comment.trim() || undefined,
      };
      console.log("Submitting rating payload:", payload);

      const response = await axios.post(
        `/api/users/rate/${artisan._id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAverageRating(response.data.averageRating);
      setUserRating(0);
      setComment("");
      setError("");
      console.log("Rating submitted for", artisan.name, ":", payload);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit rating.");
      console.error("Submit rating error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!artisan._id) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <p className="text-red-400 text-xl">Artisan not found.</p>
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
            id="artisan-profile"
            data-animate
          >
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex flex-col items-center md:items-start">
                <img
                  src={
                    artisan.image
                      ? `https://adwumawura-api.onrender.com${artisan.image}`
                      : "https://via.placeholder.com/200"
                  }
                  alt={artisan.name || "Artisan"}
                  className="w-32 h-32 rounded-full object-cover border-2 border-yellow-400 mb-4"
                  onError={(e) => {
                    console.error(
                      `Failed to load image for ${artisan.name}: ${artisan.image}`
                    );
                    e.target.src = "https://via.placeholder.com/200";
                  }}
                />
                <h2 className="text-3xl font-bold text-white mb-2">
                  {artisan.name || "Unknown"}
                </h2>
                <div className="flex items-center text-gray-300 mb-2">
                  <LocationOn className="text-yellow-400 mr-1" />
                  <span>{artisan.location || "Unknown Location"}</span>
                </div>
                <div className="flex items-center text-yellow-400 mb-4">
                  <Star className="mr-1" />
                  <span>
                    {averageRating > 0 ? averageRating.toFixed(1) : "N/A"} / 5
                  </span>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                  {artisan.skills?.length > 0 ? (
                    artisan.skills.map((skill, i) => (
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
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-4">About</h3>
                <p className="text-gray-300 mb-6">
                  {artisan.bio || "No bio available"}
                </p>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-bold text-white mb-4">
                Rate {artisan.name || "Artisan"}
              </h3>
              <form onSubmit={handleSubmitRating} className="space-y-4">
                <div className="flex justify-center md:justify-start space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="focus:outline-none"
                      disabled={loading}
                    >
                      {star <= (hoverRating || userRating) ? (
                        <Star className="text-yellow-400 text-2xl" />
                      ) : (
                        <StarBorder className="text-gray-400 text-2xl" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <textarea
                    placeholder="Add a comment (optional)"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full pl-4 pr-4 py-3 bg-gray-900/40 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-all"
                    rows="4"
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={userRating === 0 || loading}
                  className={`w-full md:w-auto bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-2 rounded-xl font-bold hover:scale-105 transition-all ${
                    userRating === 0 || loading
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {loading ? "Submitting..." : "Submit Rating"}
                </button>
              </form>
            </div>
          </div>

          <div
            className="bg-gray-800/50 border border-gray-700 rounded-3xl p-8 mt-8"
            id="contact-form"
            data-animate
          >
            <h3 className="text-xl font-bold text-white mb-6">
              Send a Message to {artisan.name || "Artisan"}
            </h3>
            <form onSubmit={handleSubmitMessage} className="space-y-6">
              <div className="relative">
                <textarea
                  placeholder="Type your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full pl-4 pr-4 py-3 bg-gray-900/40 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-all"
                  rows="6"
                  required
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-8 py-4 rounded-xl font-bold hover:scale-105 transition-all ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Sending..." : "Send Message"}{" "}
                <Send className="ml-2 inline-block" />
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ArtisanProfile;
