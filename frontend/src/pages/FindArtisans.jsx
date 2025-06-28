import React, { useState, useEffect } from "react";
import { Search, Star, LocationOn } from "@mui/icons-material";
import { Link } from "react-router-dom";
import axios from "../api/axios";

const FindArtisans = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [artisans, setArtisans] = useState([]);
  const [filteredArtisans, setFilteredArtisans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleMouseMove = (e) =>
      setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const fetchArtisans = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/users/artisans");
        console.log("Artisans data:", response.data);
        setArtisans(response.data);
        setFilteredArtisans(response.data);
        setError("");
      } catch (err) {
        setError("Failed to load artisans. Please try again.");
        console.error("Fetch artisans error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchArtisans();
  }, []);

  useEffect(() => {
    const lowerQuery = searchQuery.toLowerCase();
    setFilteredArtisans(
      artisans.filter(
        (artisan) =>
          artisan.name?.toLowerCase().includes(lowerQuery) ||
          artisan.skills?.some((skill) =>
            skill.toLowerCase().includes(lowerQuery)
          )
      )
    );
  }, [searchQuery, artisans]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      const lowerQuery = searchQuery.toLowerCase();
      setFilteredArtisans(
        artisans.filter(
          (artisan) =>
            artisan.name?.toLowerCase().includes(lowerQuery) ||
            artisan.skills?.some((skill) =>
              skill.toLowerCase().includes(lowerQuery)
            )
        )
      );
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
              Find Artisans
            </span>
          </h2>
          <p className="text-lg text-gray-400 text-center max-w-3xl mx-auto mb-12">
            Discover skilled artisans ready to bring your projects to life.
            Search by name or skill to find the perfect match. Press Enter to
            filter results.
          </p>

          {error && <p className="text-red-400 text-center mb-8">{error}</p>}

          <div className="max-w-xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute top-1/2 left-4 transform -translate-y-1/2 text-yellow-400" />
              <input
                type="text"
                placeholder="Search by name or skill..."
                className="w-full pl-12 pr-4 py-3 bg-gray-900/40 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
          </div>

          {loading ? (
            <p className="text-center text-gray-400 mt-4">
              Loading artisans...
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArtisans.map((artisan) => {
                console.log(`Artisan ${artisan.name} image:`, artisan.image); // Debug log
                return (
                  <div
                    key={artisan._id}
                    className="group relative bg-gradient-to-br from-yellow-400/10 to-orange-500/10 backdrop-blur-sm rounded-3xl p-6 border border-yellow-400/30 transition-all duration-500 hover:scale-105 opacity-100"
                  >
                    <div className="flex flex-col items-center text-center">
                      <img
                        src={
                          artisan.image
                            ? `http://localhost:5000${artisan.image}`
                            : "https://via.placeholder.com/200"
                        }
                        alt={artisan.name || "Artisan"}
                        className="w-24 h-24 rounded-full object-cover border-2 border-yellow-400 mb-4"
                        onError={(e) => {
                          console.error(
                            `Failed to load image for ${artisan.name}: ${artisan.image}`
                          );
                          e.target.src = "https://via.placeholder.com/200";
                        }}
                      />
                      <h3 className="text-xl font-bold text-white mb-2">
                        {artisan.name || "Unknown"}
                      </h3>
                      <div className="flex items-center text-gray-400 mb-2">
                        <LocationOn className="text-yellow-400 mr-1" />
                        <span>{artisan.location || "Unknown Location"}</span>
                      </div>
                      <div className="flex flex-wrap justify-center gap-2 mb-4">
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
                      <div className="flex items-center text-yellow-400 mb-4">
                        <Star className="mr-1" />
                        <span>
                          {artisan.averageRating > 0
                            ? artisan.averageRating.toFixed(1)
                            : "N/A"}{" "}
                          / 5
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                        {artisan.bio || "No bio available"}
                      </p>
                      <Link
                        to={`/user/artisan/${artisan._id}`}
                        state={{ artisan }}
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-2 rounded-xl font-bold hover:scale-105 transition-all"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {!loading && filteredArtisans.length === 0 && (
            <p className="text-center text-gray-400 mt-12">
              No artisans found. Try adjusting your search.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default FindArtisans;
