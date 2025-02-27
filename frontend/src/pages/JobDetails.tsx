import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  experienceLevel: string;
  category: string;
  salary: number;
  remote: boolean;
  requirements: string[];
  benefits: string[];
  createdAt: string;
  company: {
    companyName: string;
    description: string;
    location: string;
    logo: string;
    website: string;
    industry: string;
    size: string;
  };
}

interface SimilarJob {
  id: string;
  title: string;
  company: {
    companyName: string;
    location: string;
    logo: string;
  };
  location: string;
  experienceLevel: string;
  category: string;
  salary: number;
  remote: boolean;
  createdAt: string;
}

const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [similarJobs, setSimilarJobs] = useState<SimilarJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobRes, similarJobsRes] = await Promise.all([
          axios.get(`/api/jobs/${id}`),
          axios.get(`/api/jobs/${id}/similar`),
        ]);
        setJob(jobRes.data);
        setSimilarJobs(similarJobsRes.data);
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError('Failed to fetch job details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleApply = () => {
    if (!user) {
      navigate('/login', { state: { from: `/jobs/${id}` } });
      return;
    }
    navigate(`/jobs/${id}/apply`);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!job) return <div>Job not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                <div className="mt-2">
                  <p className="text-lg text-gray-600">{job.company.companyName}</p>
                  <p className="text-gray-500">{job.location}</p>
                </div>
              </div>
              {job.company.logo && (
                <img
                  src={job.company.logo}
                  alt={`${job.company.companyName} logo`}
                  className="w-20 h-20 object-contain"
                />
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {job.category}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                {job.experienceLevel}
              </span>
              {job.remote && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Remote
                </span>
              )}
              {job.salary && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  ${job.salary.toLocaleString()} / year
                </span>
              )}
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900">Description</h2>
              <div className="mt-4 prose max-w-none">
                {job.description.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {job.requirements.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900">Requirements</h2>
                <ul className="mt-4 list-disc list-inside space-y-2">
                  {job.requirements.map((requirement, index) => (
                    <li key={index} className="text-gray-600">
                      {requirement}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {job.benefits.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900">Benefits</h2>
                <ul className="mt-4 list-disc list-inside space-y-2">
                  {job.benefits.map((benefit, index) => (
                    <li key={index} className="text-gray-600">
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <button
              onClick={handleApply}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Apply Now
            </button>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900">About the company</h3>
              <p className="mt-2 text-gray-600">{job.company.description}</p>
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Industry:</span> {job.company.industry}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Company size:</span> {job.company.size}
                </p>
                {job.company.website && (
                  <p className="text-sm">
                    <a
                      href={job.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Visit website
                    </a>
                  </p>
                )}
              </div>
            </div>
          </div>

          {similarJobs.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Similar Jobs</h3>
              <div className="space-y-4">
                {similarJobs.map((similarJob) => (
                  <div
                    key={similarJob.id}
                    className="cursor-pointer hover:bg-gray-50 p-3 rounded-md"
                    onClick={() => navigate(`/jobs/${similarJob.id}`)}
                  >
                    <h4 className="font-medium text-gray-900">{similarJob.title}</h4>
                    <p className="text-sm text-gray-500">
                      {similarJob.company.companyName} • {similarJob.location}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {similarJob.category}
                      </span>
                      {similarJob.remote && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Remote
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetails; 