import React from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import RootLayout from "./layouts/RootLayout";
import Dashboard from "./pages/Dashboard";
import FindArtisans from "./pages/FindArtisans";
import PostJob from "./pages/PostJob";
import ArtisanProfile from "./pages/ArtisanProfile";
import JobDetails from "./pages/JobDetails";
import JobApplicants from "./pages/JobApplicants";
import Profile from "./pages/Profile";

const ErrorPage = () => (
  <div className="bg-black text-white min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-red-400 mb-4">
        Something went wrong
      </h1>
      <p className="text-gray-300 mb-6">
        Please try again or return to the home page.
      </p>
      <a
        href="/"
        className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all"
      >
        Go Home
      </a>
    </div>
  </div>
);

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path="" element={<Welcome />} />
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Signup />} />
      <Route path="user" element={<RootLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="find-artisans" element={<FindArtisans />} />
        <Route path="artisan/:id" element={<ArtisanProfile />} />
        <Route
          path="job/:id"
          element={<JobDetails />}
          errorElement={<ErrorPage />}
        />
        <Route path="job-applicants/:id" element={<JobApplicants />} />
        <Route path="post-job" element={<PostJob />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Route>
  )
);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
