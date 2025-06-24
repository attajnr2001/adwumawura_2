import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Work, Person, CheckCircle, AttachMoney } from "@mui/icons-material";

const JobApplicants = () => {
  const { state } = useLocation();
  const job = state?.job || {};
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState({});
  const [jobData, setJobData] = useState(job);

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

  const handleAcceptApplicant = (applicantId) => {
    // Placeholder for accepting applicant (future backend integration)
    console.log(`Accepted applicant ${applicantId} for job ${job.id}`);
    setJobData((prevJob) => ({
      ...prevJob,
      applicants: prevJob.applicants.map((applicant) =>
        applicant.id === applicantId
          ? { ...applicant, status: "accepted" }
          : applicant
      ),
      acceptedApplicant: prevJob.applicants.find(
        (applicant) => applicant.id === applicantId
      ),
    }));
  };

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
          <div
            className="bg-gray-800/50 border border-gray-700 rounded-3xl p-8"
            id="job-details"
            data-animate
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              {jobData.title}
            </h2>
            <p className="text-gray-300 mb-6">{jobData.description}</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {jobData.skills?.map((skill, i) => (
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
              <span>{jobData.budget}</span>
            </div>
            <div className="flex items-center text-gray-300 mb-6">
              <Work className="text-yellow-400 mr-1" />
              <span>{jobData.applicants?.length || 0} Applicants</span>
            </div>
          </div>

          <div
            className="bg-gray-800/50 border border-gray-700 rounded-3xl p-8 mt-8"
            id="applicants-list"
            data-animate
          >
            <h3 className="text-xl font-bold text-white mb-6">Applicants</h3>
            {jobData.applicants?.length === 0 ? (
              <p className="text-gray-400">No applicants yet.</p>
            ) : (
              <div className="space-y-4">
                {jobData.applicants.map((applicant) => (
                  <div
                    key={applicant.id}
                    className="flex justify-between items-center border-b border-gray-700 pb-4"
                  >
                    <div>
                      <p className="text-gray-300 font-semibold">
                        {applicant.name}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {applicant.skills.join(", ")}
                      </p>
                    </div>
                    {jobData.acceptedApplicant ? (
                      applicant.status === "accepted" ? (
                        <span className="text-green-400 flex items-center">
                          <CheckCircle className="mr-1" /> Accepted
                        </span>
                      ) : (
                        <span className="text-gray-400">Job Filled</span>
                      )
                    ) : (
                      <button
                        onClick={() => handleAcceptApplicant(applicant.id)}
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-xl font-bold hover:scale-105 transition-all"
                      >
                        Accept
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            {jobData.acceptedApplicant && (
              <div className="mt-6 text-center text-green-400">
                Job assigned to {jobData.acceptedApplicant.name}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default JobApplicants;
