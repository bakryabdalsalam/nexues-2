import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { jobsApi } from '../services/api';
import { ApplicationForm } from '../components/jobs/ApplicationForm';
import { useAuthStore } from '../store/auth.store';

export const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const navigate = useNavigate();

  // Add effect to check auth state on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Add debugging logs
  console.log('Auth State:', { user, isAuthenticated });

  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobsApi.getJob(id!),
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-8">
        Failed to load job details. Please try again later.
      </div>
    );
  }

  if (!job?.data) {
    return (
      <div className="text-center text-gray-600 py-8">
        Job not found
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h1 className="text-2xl font-bold text-gray-900">{job.data.title}</h1>
          <p className="mt-1 text-sm text-gray-500">{job.data.company}</p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Location</dt>
              <dd className="mt-1 text-sm text-gray-900">{job.data.location}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Experience Level</dt>
              <dd className="mt-1 text-sm text-gray-900">{job.data.experienceLevel}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Category</dt>
              <dd className="mt-1 text-sm text-gray-900">{job.data.category}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Salary</dt>
              <dd className="mt-1 text-sm text-gray-900">
                ${job.data.salary?.toLocaleString()} per year
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                {job.data.description}
              </dd>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        {isAuthenticated && user ? (
          <ApplicationForm jobId={job.data.id} />
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Want to Apply?</h2>
            <p className="text-gray-600 mb-4">Please log in to submit your application.</p>
            <button
              onClick={() => navigate('/login', { state: { from: `/jobs/${job.data.id}` } })}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Log in to Apply
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
