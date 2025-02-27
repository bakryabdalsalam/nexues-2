import React, { useEffect, useState } from 'react';
import { adminApi } from '../../services/api';
import { Job } from '../../types';

const AdminJobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await adminApi.getJobs();
        setJobs(response.data);
      } catch (err) {
        setError('Failed to fetch jobs');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleDeleteJob = async (jobId: string) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await adminApi.deleteJob(jobId);
        // Remove job from list
        setJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobId));
      } catch (err) {
        console.error('Error deleting job:', err);
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Job Management</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Title</th>
                <th className="px-4 py-2 text-left">Company</th>
                <th className="px-4 py-2 text-left">Location</th>
                <th className="px-4 py-2 text-left">Applications</th>
                <th className="px-4 py-2 text-left">Created At</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className="border-t">
                  <td className="px-4 py-2">
                    <div className="font-medium">{job.title}</div>
                  </td>
                  <td className="px-4 py-2">{job.company}</td>
                  <td className="px-4 py-2">{job.location}</td>
                  <td className="px-4 py-2">{job._count?.applications || 0}</td>
                  <td className="px-4 py-2">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => window.location.href = `/jobs/${job.id}`}
                      className="text-blue-600 hover:text-blue-800 mr-2"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
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

export default AdminJobs;