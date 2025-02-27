import React, { useEffect, useState } from 'react';
import { adminApi, applicationApi } from '../../services/api';
import { Application, ApplicationStatus } from '../../types';

const AdminApplications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const response = await applicationApi.getAllApplications();
        setApplications(response.data);
      } catch (err) {
        setError('Failed to fetch applications');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const handleStatusUpdate = async (applicationId: string, status: ApplicationStatus) => {
    try {
      await applicationApi.updateApplicationStatus(applicationId, status);
      // Update the application in the list
      setApplications((prevApplications) =>
        prevApplications.map((app) =>
          app.id === applicationId ? { ...app, status } : app
        )
      );
    } catch (err) {
      console.error('Error updating application status:', err);
    }
  };

  const getStatusBadgeClass = (status: ApplicationStatus) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'REVIEWING':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Application Management</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Applicant</th>
                <th className="px-4 py-2 text-left">Job</th>
                <th className="px-4 py-2 text-left">Company</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Applied On</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((application) => (
                <tr key={application.id} className="border-t">
                  <td className="px-4 py-2">
                    <div className="font-medium">{application.user.name}</div>
                    <div className="text-sm text-gray-500">{application.user.email}</div>
                  </td>
                  <td className="px-4 py-2">{application.job.title}</td>
                  <td className="px-4 py-2">{application.job.company}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(application.status)}`}
                    >
                      {application.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {new Date(application.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    <select
                      value={application.status}
                      onChange={(e) =>
                        handleStatusUpdate(
                          application.id,
                          e.target.value as ApplicationStatus
                        )
                      }
                      className="border rounded px-2 py-1 mr-2"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="REVIEWING">Reviewing</option>
                      <option value="ACCEPTED">Accepted</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                    <button
                      onClick={() => window.open(application.resume || '#', '_blank')}
                      disabled={!application.resume}
                      className={`text-blue-600 hover:text-blue-800 ${
                        !application.resume ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      View Resume
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

export default AdminApplications;