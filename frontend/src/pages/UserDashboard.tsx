import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface UserProfile {
  id: string;
  resume: string;
  skills: string[];
  experience: string;
  education: string;
  bio: string;
  phoneNumber: string;
  address: string;
  linkedIn: string;
  github: string;
  portfolio: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface Application {
  id: string;
  status: string;
  resume: string;
  coverLetter: string;
  createdAt: string;
  job: {
    id: string;
    title: string;
    company: {
      companyName: string;
      location: string;
    };
  };
}

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, applicationsRes] = await Promise.all([
          axios.get('/api/user/profile'),
          axios.get('/api/user/applications'),
        ]);
        setProfile(profileRes.data);
        setApplications(applicationsRes.data);
      } catch (err) {
        setError('Failed to fetch dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* User Profile Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Profile</h1>
          <button
            onClick={() => navigate('/profile/edit')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Edit Profile
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Name: {profile?.user.name}</p>
            <p className="text-gray-600">Email: {profile?.user.email}</p>
            <p className="text-gray-600">Phone: {profile?.phoneNumber}</p>
            <p className="text-gray-600">Location: {profile?.address}</p>
          </div>
          <div>
            <p className="text-gray-600">LinkedIn: {profile?.linkedIn}</p>
            <p className="text-gray-600">GitHub: {profile?.github}</p>
            <p className="text-gray-600">Portfolio: {profile?.portfolio}</p>
          </div>
        </div>
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {profile?.skills.map((skill, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
        {profile?.resume && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Resume</h3>
            <a
              href={profile.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              View Resume
            </a>
          </div>
        )}
      </div>

      {/* Job Applications Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">My Applications</h2>
          <button
            onClick={() => navigate('/jobs')}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Browse Jobs
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applied Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applications.map((application) => (
                <tr key={application.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {application.job.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {application.job.company.companyName}
                    </div>
                    <div className="text-xs text-gray-400">
                      {application.job.company.location}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        application.status === 'ACCEPTED'
                          ? 'bg-green-100 text-green-800'
                          : application.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {application.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(application.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => navigate(`/applications/${application.id}`)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
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

export default UserDashboard; 