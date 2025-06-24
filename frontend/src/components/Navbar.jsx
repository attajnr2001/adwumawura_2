import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Home, Work, Person, Search, ExitToApp } from "@mui/icons-material";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Placeholder for logout logic (e.g., clear auth token)
    navigate("/login");
  };

  return (
    <nav className="bg-gray-900/90 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <NavLink to="/user/dashboard" className="text-2xl font-black">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              ADWUMAWURA
            </span>
          </NavLink>
        </div>

        <div className="flex items-center space-x-6">
          <NavLink
            to="/user/dashboard"
            className={({ isActive }) =>
              `flex items-center space-x-2 text-white hover:text-yellow-400 transition-all ${
                isActive ? "text-yellow-400 font-semibold" : ""
              }`
            }
          >
            <Home className="text-xl" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/user/post-job"
            className={({ isActive }) =>
              `flex items-center space-x-2 text-white hover:text-yellow-400 transition-all ${
                isActive ? "text-yellow-400 font-semibold" : ""
              }`
            }
          >
            <Work className="text-xl" />
            <span>Post Job</span>
          </NavLink>
          <NavLink
            to="/user/find-artisans"
            className={({ isActive }) =>
              `flex items-center space-x-2 text-white hover:text-yellow-400 transition-all ${
                isActive ? "text-yellow-400 font-semibold" : ""
              }`
            }
          >
            <Search className="text-xl" />
            <span>Find Artisans</span>
          </NavLink>
          <NavLink
            to="/user/profile"
            className={({ isActive }) =>
              `flex items-center space-x-2 text-white hover:text-yellow-400 transition-all ${
                isActive ? "text-yellow-400 font-semibold" : ""
              }`
            }
          >
            <Person className="text-xl" />
            <span>Profile</span>
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-white hover:text-red-400 transition-all"
          >
            <ExitToApp className="text-xl" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
