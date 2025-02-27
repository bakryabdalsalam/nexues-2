import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  experienceLevel: string;
  category: string;
  salary: number;
  remote: boolean;
  status: string;
  applications: Application[];
  createdAt: string;
}

interface Application {
  id: string;
  status: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  resume: string;
  coverLetter: string;
  createdAt: string;
}

interface CompanyProfile {
  id: string;
  companyName: string;
  description: string;
  industry: string;
  size: string;
  website: string;
  location: string;
  logo: string;
}

const CompanyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, jobsRes] = await Promise.all([
          api.get('/api/company/profile'),
          api.get('/api/company/jobs'),
        ]);
        
        if (profileRes.data.success && jobsRes.data.success) {
          setProfile(profileRes.data.data);
          setJobs(jobsRes.data.data);
        } else {
          throw new Error('Failed to fetch data');
        }
      } catch (err) {
        setError('Failed to fetch dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateJob = () => {
    navigate('/company/jobs/create');
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Company Profile Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{profile?.companyName}</h1>
          <button
            onClick={() => navigate('/company/profile/edit')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Edit Profile
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Industry: {profile?.industry}</p>
            <p className="text-gray-600">Size: {profile?.size}</p>
            <p className="text-gray-600">Location: {profile?.location}</p>
          </div>
          <div>
            <p className="text-gray-600">Website: {profile?.website}</p>
            <p className="text-gray-600">Description: {profile?.description}</p>
          </div>
        </div>
      </div>

      {/* Job Listings Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Job Listings</h2>
          <button
            onClick={handleCreateJob}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Create New Job
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applications
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {job.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{job.location}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {job.applications.length}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        job.status === 'OPEN'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => navigate(`/company/jobs/${job.id}`)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      View
                    </button>
                    <button
                      onClick={() => navigate(`/company/jobs/${job.id}/edit`)}
                      className="text-green-600 hover:text-green-900"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard; 