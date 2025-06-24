import React, { useState, useEffect, useContext } from "react";
import {
  Person,
  LocationOn,
  Phone,
  Star,
  Edit,
  Save,
} from "@mui/icons-material";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const Profile = () => {
  const { user, token } = useContext(AuthContext);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(user || {});
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState(null);

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
      setProfile(user);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSkillsChange = (e) => {
    const skills = e.target.value.split(",").map((skill) => skill.trim());
    setProfile((prev) => ({ ...prev, skills }));
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.set("name", profile.name || "");
      formData.set("location", profile.location || "");
      formData.set("phone", profile.phone || "");
      formData.set("address", profile.address || "");
      formData.set("skills", profile.skills?.join(",") || "");
      formData.set("bio", profile.bio || "");
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await axios.put("/api/auth/update", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setProfile(response.data);
      setImageFile(null); // Reset file input
      setIsEditing(false);
      setError("");
    } catch (err) {
      setError("Failed to save profile. Please try again.");
      console.error("Save profile error:", err);
    }
  };

  if (!user) {
    return <div className="text-white text-center">Loading...</div>;
  }

  return (
    <div className="bg-black text-white min-h-screen overflow-hidden">
      <div
        className="fixed inset-0 z-0"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(147, 51, 234, 0.1) 0%, transparent 50%)`,
        }}
      />

      <section className="relative z-10 py-24 px-6 sm:px-8 lg:px-12 xl:px-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-center mb-8">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Your Profile
            </span>
          </h2>
          <p className="text-lg text-gray-400 text-center max-w-3xl mx-auto mb-12">
            Manage your personal information and showcase your skills to attract
            clients.
          </p>

          {error && <p className="text-red-400 text-center">{error}</p>}

          {/* Profile Information */}
          <div
            className="bg-gray-800/50 border border-gray-700 rounded-3xl p-8 mb-8"
            id="profile-info"
            data-animate
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">
                Personal Information
              </h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-xl font-bold hover:scale-105 transition-all"
              >
                {isEditing ? <Save /> : <Edit />}
              </button>
            </div>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex flex-col items-center md:items-start">
                <img
                  src={
                    profile.image
                      ? `http://localhost:5000${profile.image}`
                      : "https://picsum.photos/seed/user1/200/200"
                  }
                  alt={profile.name}
                  className="w-32 h-32 rounded-full object-cover border-2 border-yellow-400 mb-4"
                />
                {isEditing ? (
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleImageChange}
                    className="w-full pl-4 pr-4 py-2 bg-gray-900/40 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-all"
                  />
                ) : (
                  <h3 className="text-xl font-bold text-white mb-2">
                    {profile.name || "Not set"}
                  </h3>
                )}
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <form onSubmit={handleSave} className="space-y-4">
                    <div>
                      <label className="text-gray-300 text-sm">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={profile.name || ""}
                        onChange={handleInputChange}
                        className="w-full pl-4 pr-4 py-2 bg-gray-900/40 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-gray-300 text-sm">Location</label>
                      <input
                        type="text"
                        name="location"
                        value={profile.location || ""}
                        onChange={handleInputChange}
                        className="w-full pl-4 pr-4 py-2 bg-gray-900/40 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-gray-300 text-sm">Phone</label>
                      <input
                        type="text"
                        name="phone"
                        value={profile.phone || ""}
                        onChange={handleInputChange}
                        className="w-full pl-4 pr-4 py-2 bg-gray-900/40 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-gray-300 text-sm">Address</label>
                      <input
                        type="text"
                        name="address"
                        value={profile.address || ""}
                        onChange={handleInputChange}
                        className="w-full pl-4 pr-4 py-2 bg-gray-900/40 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-gray-300 text-sm">
                        Skills (comma-separated)
                      </label>
                      <input
                        type="text"
                        name="skills"
                        value={profile.skills?.join(", ") || ""}
                        onChange={handleSkillsChange}
                        className="w-full pl-4 pr-4 py-2 bg-gray-900/40 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-gray-300 text-sm">Bio</label>
                      <textarea
                        name="bio"
                        value={profile.bio || ""}
                        onChange={handleInputChange}
                        className="w-full pl-4 pr-4 py-2 bg-gray-900/40 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-all"
                        rows="4"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-8 py-3 rounded-xl font-bold hover:scale-105 transition-all"
                    >
                      Save Changes
                    </button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center text-gray-300">
                      <LocationOn className="text-yellow-400 mr-2" />
                      <span>{profile.location || "Not set"}</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Phone className="text-yellow-400 mr-2" />
                      <span>{profile.phone || "Not set"}</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <LocationOn className="text-yellow-400 mr-2" />
                      <span>{profile.address || "Not set"}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills?.map((skill, i) => (
                        <span
                          key={i}
                          className="bg-gray-800/50 text-gray-300 text-sm px-3 py-1 rounded-full"
                        >
                          {skill}
                        </span>
                      )) || <span>No skills listed</span>}
                    </div>
                    <p className="text-gray-300">
                      {profile.bio || "No bio provided"}
                    </p>
                    <div className="flex items-center text-yellow-400">
                      <Star className="mr-1" />
                      <span>{profile.averageRating || 0} / 5</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Client Ratings */}
          <div
            className="bg-gray-800/50 border border-gray-700 rounded-3xl p-8"
            id="client-ratings"
            data-animate
          >
            <h3 className="text-2xl font-bold text-white mb-6">
              Client Ratings
            </h3>
            {profile.ratings?.length === 0 ? (
              <p className="text-gray-400">
                No ratings yet. Complete jobs to earn reviews!
              </p>
            ) : (
              <div className="space-y-6">
                {profile.ratings?.map((rating) => (
                  <div
                    key={rating._id || rating.id}
                    className="border-b border-gray-700 pb-4"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <Person className="text-yellow-400 mr-2" />
                        <span className="text-gray-300 font-semibold">
                          {rating.client}
                        </span>
                      </div>
                      <span className="text-gray-500 text-sm">
                        {rating.timestamp}
                      </span>
                    </div>
                    <div className="flex items-center text-yellow-400 mb-2">
                      <Star className="mr-1" />
                      <span>{rating.rating} / 5</span>
                    </div>
                    <p className="text-gray-300">{rating.comment}</p>
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
