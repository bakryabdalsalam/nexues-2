import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { jobsApi } from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useAuthStore } from '../store/auth.store';
import { toast } from 'react-toastify';

export const JobDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobsApi.getJob(id!),
    enabled: !!id,
    onError: (error: Error) => {
      toast.error(`Failed to load job details: ${error.message}`);
      navigate('/jobs');
    }
  });

  if (isLoading) return <LoadingSpinner />;
  if (!job?.data) return null;

  return (
    <div className="max-w-3xl mx-auto bg-white shadow rounded-lg p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{job.data.title}</h1>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-gray-500">Company</p>
          <p className="font-medium">{job.data.company}</p>
        </div>
        <div>
          <p className="text-gray-500">Location</p>
          <p className="font-medium">{job.data.location}</p>
        </div>
        <div>
          <p className="text-gray-500">Experience Level</p>
          <p className="font-medium">{job.data.experienceLevel}</p>
        </div>
        <div>
          <p className="text-gray-500">Category</p>
          <p className="font-medium">{job.data.category}</p>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Description</h2>
        <p className="text-gray-700 whitespace-pre-wrap">{job.data.description}</p>
      </div>

      {job.data.salary && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Salary</h2>
          <p className="text-gray-700">${job.data.salary.toLocaleString()} per year</p>
        </div>
      )}

      {user ? (
        <button 
          onClick={() => toast.info('Application feature coming soon!')}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700">
          Apply Now
        </button>
      ) : (
        <button 
          onClick={() => navigate('/login')}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700">
          Login to Apply
        </button>
      )}
    </div>
  );
};
