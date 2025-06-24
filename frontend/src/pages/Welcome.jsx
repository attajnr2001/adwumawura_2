import React, { useState, useEffect } from "react";
import {
  Handyman,
  Work,
  Star,
  ArrowForward,
  AutoAwesome,
  Build,
  Palette,
  Speed,
} from "@mui/icons-material";
import { Link } from "react-router-dom";

const Welcome = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState({});

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

  const FeatureCard = ({
    icon: Icon,
    title,
    description,
    color,
    bgColor,
    borderColor,
  }) => (
    <div
      className={`group relative bg-gradient-to-br ${bgColor} backdrop-blur-sm rounded-3xl p-10 border ${borderColor} transition-all duration-500 hover:scale-105`}
    >
      <div className="relative z-10 text-center">
        <div className="flex justify-center mb-6">
          <div
            className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${color} flex items-center justify-center`}
          >
            <Icon className="text-black text-3xl" />
          </div>
        </div>
        <h3 className="text-2xl font-bold mb-4 text-white">{title}</h3>
        <p className="text-gray-300 text-base leading-relaxed">{description}</p>
      </div>
    </div>
  );

  return (
    <div className="bg-black text-white min-h-screen overflow-hidden">
      <div
        className="fixed inset-0 z-0"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(147, 51, 234, 0.1) 0%, transparent 50%)`,
        }}
      />

      {/* Hero Section */}
      <header className="relative z-10 py-24 px-6 sm:px-8 lg:px-12 xl:px-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10 text-center lg:text-left">
            <div className="inline-flex items-center space-x-3 bg-yellow-500/10 border border-yellow-400/30 px-6 py-3 rounded-full mx-auto lg:mx-0">
              <AutoAwesome className="text-yellow-400" />
              <span className="text-yellow-300 font-medium">
                Where Craftsmanship Meets Innovation
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight tracking-tight">
              <span className="bg-gradient-to-r from-white via-yellow-200 to-yellow-400 bg-clip-text text-transparent">
                ADWUMA
              </span>
              <br />
              <span className="text-4xl sm:text-5xl lg:text-6xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                WURA
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Connect with{" "}
              <span className="text-yellow-400 font-semibold">
                master craftspeople
              </span>{" "}
              or showcase your artistic vision in a marketplace that celebrates
              true skill.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start pt-4">
              <button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-8 py-4 rounded-xl font-bold hover:scale-105 transition-all">
                <Handyman className="mr-2" /> Showcase Skills
              </button>
              <Link to="/login">
                <button className="cursor-pointer border-2 border-purple-400 px-8 py-4 rounded-xl text-white hover:bg-purple-400/10 transition-all">
                  <Work className="mr-2" /> Hire Artisan
                </button>
              </Link>
            </div>
            <div className="flex gap-10 justify-center lg:justify-start pt-10">
              {[
                "500+ Master Artisans",
                "2.5K+ Projects Done",
                "98% Satisfaction",
              ].map((text, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-3xl font-bold text-yellow-400">
                    {text.split(" ")[0]}
                  </div>
                  <div className="text-sm text-gray-400">
                    {text.split(" ").slice(1).join(" ")}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 bg-gray-800/50 border border-gray-700 rounded-3xl space-y-8">
            {[
              {
                icon: Build,
                title: "Woodworking",
                desc: "Custom furniture & detailed craftsmanship",
              },
              {
                icon: Palette,
                title: "Art & Design",
                desc: "Unique pieces & creative solutions",
              },
              {
                icon: Handyman,
                title: "Metalwork",
                desc: "Precision engineering & artistic metal",
              },
              {
                icon: Speed,
                title: "Fast Delivery",
                desc: "Quality work delivered on time",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex gap-4 items-start bg-gray-900/40 p-4 rounded-xl"
              >
                <item.icon className="text-yellow-400 text-3xl" />
                <div>
                  <h3 className="text-lg font-bold mb-1">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-24 px-6 sm:px-8 lg:px-12 xl:px-16">
        <div className="max-w-7xl mx-auto text-center space-y-8 mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black">
            <span className="bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent">
              Why Choose
            </span>
            <br />
            ADWUMAWUAR?
          </h2>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
            We're not just another marketplace - we're a community where
            exceptional craftsmanship meets cutting-edge technology.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <FeatureCard
            icon={Star}
            title="Elite Artisans"
            description="Only the top 5% of craftspeople make it through our rigorous selection process."
            color="from-yellow-400 to-orange-500"
            bgColor="from-yellow-400/10 to-orange-500/10"
            borderColor="border-yellow-400/30"
          />
          <FeatureCard
            icon={AutoAwesome}
            title="Find your best Artisan"
            description="Connect you with the perfect artisan for your project."
            color="from-purple-400 to-pink-500"
            bgColor="from-purple-400/10 to-pink-500/10"
            borderColor="border-purple-400/30"
          />
          <FeatureCard
            icon={Speed}
            title="Lightning Fast"
            description="Get matched with artisans in under 60 seconds."
            color="from-blue-400 to-cyan-500"
            bgColor="from-blue-400/10 to-cyan-500/10"
            borderColor="border-blue-400/30"
          />
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 px-6 sm:px-8 lg:px-12 xl:px-16 text-center relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black">
            <span className="bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
              Ready to Create
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Something Amazing?
            </span>
          </h2>
          <p className="text-lg text-gray-300 leading-relaxed">
            Join thousands of artisans and clients who've already discovered the
            future of craftsmanship.
          </p>
          <button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-10 py-5 rounded-full font-bold hover:scale-110 transition-transform">
            Launch Your Journey <ArrowForward className="ml-2 inline-block" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default Welcome;
