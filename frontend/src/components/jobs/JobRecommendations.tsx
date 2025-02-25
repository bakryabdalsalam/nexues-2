import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { jobsApi } from '../../services/api';
import { JobCard } from './JobCard';
import { Job } from '../../types';
import { SparklesIcon } from '@heroicons/react/24/outline';

export const JobRecommendations: React.FC = () => {
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['job-recommendations'],
    queryFn: jobsApi.getRecommendations,
    enabled: !!localStorage.getItem('token'), // Only fetch if user is logged in
    staleTime: 1000 * 60 * 5 // Cache for 5 minutes
  });

  const recommendations = response?.data || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <SparklesIcon className="h-6 w-6 text-yellow-500" />
          Recommended for You
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-48"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Failed to load recommendations. Please try again later.</p>
      </div>
    );
  }

  if (!recommendations.length) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <SparklesIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Recommendations Yet</h3>
        <p className="text-gray-600">
          Complete your profile and apply to jobs to get personalized recommendations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <SparklesIcon className="h-6 w-6 text-yellow-500" />
          Recommended for You
        </h2>
        <p className="text-sm text-gray-600">
          Based on your profile and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((job: Job) => (
          <JobCard 
            key={job.id} 
            job={job} 
            isRecommended 
          />
        ))}
      </div>
    </div>
  );
};
