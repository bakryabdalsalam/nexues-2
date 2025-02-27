import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminApi, applicationApi } from '../services/api';

interface DashboardStats {
  totalUsers: number;
  totalCompanies: number;
  totalJobs: number;
  totalApplications: number;
}

interface RecentActivity {
  users: User[];
  jobs: Job[];
  applications: Application[];
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  profile?: {
    id: string;
    skills: string[];
  };
  company?: {
    id: string;
    companyName: string;
  };
}

interface Job {
  id: string;
  title: string;
  company: {
    companyName: string;
  };
  location: string;
  status: string;
  createdAt: string;
}

interface Application {
  id: string;
  status: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  job: {
    title: string;
    company: {
      companyName: string;
    };
  };
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch stats from the admin endpoint
        const response = await adminApi.getStats();
        
        if (response.success && response.data) {
          // Update stats
          setStats({
            totalUsers: response.data.totalUsers,
            totalCompanies: response.data.totalCompanies,
            totalJobs: response.data.totalJobs,
            totalApplications: response.data.totalApplications
          });

          // Update recent activity
          setRecentActivity({
            users: response.data.recentActivity.users || [],
            jobs: response.data.recentActivity.jobs || [],
            applications: response.data.recentActivity.applications || []
          });
        } else {
          throw new Error('Invalid response format from server');
        }
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUserStatusUpdate = async (userId: string, isActive: boolean) => {
    try {
      await adminApi.updateUser(userId, { isActive });
      
      // Refresh data after update
      const usersResponse = await adminApi.getUsers();
      setRecentActivity(prevActivity => ({
        ...prevActivity!,
        users: usersResponse.data.slice(0, 5)
      }));
    } catch (err) {
      console.error('Error updating user status:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">{error}</div>
    );
  }

  // Check if we have valid data
  const hasUsers = recentActivity?.users && recentActivity.users.length > 0;
  const hasJobs = recentActivity?.jobs && recentActivity.jobs.length > 0;
  const hasApplications = recentActivity?.applications && recentActivity.applications.length > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Admin Navigation */}
      <div className="mb-8 bg-white rounded-lg shadow-md p-4">
        <h2 className="text-xl font-bold mb-4">Admin Controls</h2>
        <div className="flex gap-4">
          <Link 
            to="/admin/users" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Manage Users
          </Link>
          <Link 
            to="/admin/jobs" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Manage Jobs
          </Link>
          <Link 
            to="/admin/applications" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Manage Applications
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-600">Total Users</h3>
          <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-600">Total Companies</h3>
          <p className="text-3xl font-bold">{stats?.totalCompanies || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-600">Active Jobs</h3>
          <p className="text-3xl font-bold">{stats?.totalJobs || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-600">Applications</h3>
          <p className="text-3xl font-bold">{stats?.totalApplications || 0}</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Recent Users</h2>
          {hasUsers ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Role</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity?.users.map((user) => (
                    <tr key={user.id} className="border-t">
                      <td className="px-4 py-2">
                        <div className="font-medium">{user.name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{user.email || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100">
                          {user.role || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            user.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() =>
                            handleUserStatusUpdate(user.id, !user.isActive)
                          }
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No recent users found.</p>
          )}
          <div className="mt-4 text-right">
            <Link to="/admin/users" className="text-blue-600 hover:text-blue-800">
              View all users →
            </Link>
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Recent Jobs</h2>
          {hasJobs ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">Title</th>
                    <th className="px-4 py-2 text-left">Company</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity?.jobs.map((job) => (
                    <tr key={job.id} className="border-t">
                      <td className="px-4 py-2">
                        <div className="font-medium">{job.title || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{job.location || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-2">
                        {job.company?.companyName || 'N/A'}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            job.status === 'OPEN'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {job.status || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => navigate(`/jobs/${job.id}`)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No recent jobs found.</p>
          )}
          <div className="mt-4 text-right">
            <Link to="/admin/jobs" className="text-blue-600 hover:text-blue-800">
              View all jobs →
            </Link>
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-lg shadow-md p-6 col-span-1 lg:col-span-2">
          <h2 className="text-xl font-bold mb-4">Recent Applications</h2>
          {hasApplications ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">Applicant</th>
                    <th className="px-4 py-2 text-left">Job</th>
                    <th className="px-4 py-2 text-left">Company</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity?.applications.map((application) => (
                    <tr key={application.id} className="border-t">
                      <td className="px-4 py-2">
                        <div className="font-medium">
                          {application.user?.name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {application.user?.email || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-2">{application.job?.title || 'N/A'}</td>
                      <td className="px-4 py-2">
                        {application.job?.company?.companyName || 'N/A'}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            application.status === 'ACCEPTED'
                              ? 'bg-green-100 text-green-800'
                              : application.status === 'REJECTED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {application.status || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {application.createdAt 
                          ? new Date(application.createdAt).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() =>
                            navigate(`/admin/applications/${application.id}`)
                          }
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No recent applications found.</p>
          )}
          <div className="mt-4 text-right">
            <Link to="/admin/applications" className="text-blue-600 hover:text-blue-800">
              View all applications →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;