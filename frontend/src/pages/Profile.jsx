import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Person,
  LocationOn,
  Phone,
  Email,
  Star,
  Edit,
  Save,
} from "@mui/icons-material";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const Profile = () => {
  const { user, token, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location: "",
    phone: "",
    address: "",
    skills: "",
    bio: "",
  });
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
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
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll("[data-animate]");
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        location: user.location || "",
        phone: user.phone || "",
        address: user.address || "",
        skills: user.skills?.join(", ") || "",
        bio: user.bio || "",
      });
      setPreviewImage(
        user.image
          ? `http://localhost:5000${user.image}`
          : "https://via.placeholder.com/200"
      );
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !token) {
      setError("Please log in to update your profile.");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("location", formData.location);
      data.append("phone", formData.phone);
      data.append("address", formData.address);
      data.append("skills", formData.skills);
      data.append("bio", formData.bio);
      if (image) {
        data.append("image", image);
      }

      const response = await axios.put("/api/auth/update", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      updateUser(response.data);
      setIsEditing(false);
      setError("");
      console.log("Profile updated:", response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
      console.error("Update profile error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <p className="text-red-400 text-xl">
          Please log in to view your profile.
        </p>
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
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-center mb-8">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Your Profile
            </span>
          </h2>
          <p className="text-lg text-gray-400 text-center max-w-3xl mx-auto mb-12">
            Manage your personal information and showcase your skills.
          </p>

          {error && <p className="text-red-400 text-center mb-8">{error}</p>}

          <div
            className="bg-gray-800/50 border border-gray-700 rounded-3xl p-8"
            id="profile-details"
            data-animate
          >
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex flex-col items-center md:items-start">
                    <img
                      src={previewImage}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-2 border-yellow-400 mb-4"
                      onError={(e) =>
                        (e.target.src = "https://via.placeholder.com/200")
                      }
                    />
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={handleImageChange}
                      className="text-gray-400 text-sm"
                    />
                  </div>
                  <div className="flex-1 space-y-4">
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
                        placeholder="Email"
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
                        placeholder="Location"
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
                        placeholder="Phone"
                        className="w-full pl-12 pr-4 py-3 bg-gray-900/40 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-all"
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Address"
                        className="w-full pl-12 pr-4 py-3 bg-gray-900/40 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-all"
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        name="skills"
                        value={formData.skills}
                        onChange={handleInputChange}
                        placeholder="Skills (comma-separated)"
                        className="w-full pl-12 pr-4 py-3 bg-gray-900/40 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-all"
                      />
                    </div>
                    <div className="relative">
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        placeholder="Bio"
                        className="w-full pl-4 pr-4 py-3 bg-gray-900/40 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-all"
                        rows="4"
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-8 py-4 rounded-xl font-bold hover:scale-105 transition-all ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <Save className="mr-2 inline-block" />
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </form>
            ) : (
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex flex-col items-center md:items-start">
                  <img
                    src={previewImage}
                    alt={user.name || "Profile"}
                    className="w-32 h-32 rounded-full object-cover border-2 border-yellow-400 mb-4"
                    onError={(e) =>
                      (e.target.src = "https://via.placeholder.com/200")
                    }
                  />
                  <div className="flex items-center text-yellow-400 mb-4">
                    <Star className="mr-1" />
                    <span>
                      {user.averageRating > 0
                        ? user.averageRating.toFixed(1)
                        : "N/A"}{" "}
                      / 5
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-4">About</h3>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-300">
                      <Person className="text-yellow-400 mr-2" />
                      <span>{user.name || "Unknown"}</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Email className="text-yellow-400 mr-2" />
                      <span>{user.email || "No email"}</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <LocationOn className="text-yellow-400 mr-2" />
                      <span>{user.location || "No location"}</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Phone className="text-yellow-400 mr-2" />
                      <span>{user.phone || "No phone"}</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <span>{user.address || "No address"}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {user.skills?.length > 0 ? (
                        user.skills.map((skill, i) => (
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
                    <p className="text-gray-300 mt-4">
                      {user.bio || "No bio available"}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-2 rounded-xl font-bold hover:scale-105 transition-all"
                  >
                    <Edit className="mr-2 inline-block" />
                    Edit Profile
                  </button>
                </div>
              </div>
            )}
          </div>

          <div
            className="bg-gray-800/50 border border-gray-700 rounded-3xl p-8 mt-8"
            id="client-ratings"
            data-animate
          >
            <h3 className="text-xl font-bold text-white mb-6">
              Client Ratings
            </h3>
            {!user.ratings || user.ratings.length === 0 ? (
              <p className="text-gray-400">
                No ratings yet. Complete jobs to earn reviews!
              </p>
            ) : (
              <div className="space-y-6">
                {user.ratings.map((rating) => (
                  <div
                    key={rating._id || rating.client}
                    className="border-b border-gray-700 pb-4"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <Person className="text-yellow-400 mr-2" />
                        <span className="text-gray-300 font-semibold">
                          {rating.client || "Anonymous"}
                        </span>
                      </div>
                      <span className="text-gray-400 text-sm">
                        {rating.timestamp
                          ? new Date(rating.timestamp).toLocaleString()
                          : "Unknown"}
                      </span>
                    </div>
                    <div className="flex items-center text-yellow-400 mb-2">
                      <Star className="mr-1" />
                      <span>{rating.rating} / 5</span>
                    </div>
                    <p className="text-gray-300">
                      {rating.comment || "No comment provided"}
                    </p>
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

export default Profile;
