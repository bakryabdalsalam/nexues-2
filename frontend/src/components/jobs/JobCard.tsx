import React from 'react';
import { Link } from 'react-router-dom';
import { Job } from '../../types';
import { SparklesIcon } from '@heroicons/react/24/outline';

interface JobCardProps {
  job: Job;
  isRecommended?: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({ job, isRecommended }) => {
  return (
    <Link
      to={`/jobs/${job.id}`}
      className="block bg-white shadow-sm hover:shadow-md transition-shadow rounded-lg overflow-hidden border border-gray-200"
    >
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {job.title}
              {isRecommended && (
                <SparklesIcon className="inline-block h-5 w-5 ml-2 text-yellow-500" aria-hidden="true" />
              )}
            </h3>
            <p className="text-sm text-gray-600 mb-2">{job.company}</p>
          </div>
          {job.salary && (
            <span className="text-sm font-medium text-gray-900">
              ${job.salary.toLocaleString()}/yr
            </span>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {job.location}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {job.experienceLevel}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            {job.category}
          </span>
        </div>

        <p className="mt-4 text-sm text-gray-600 line-clamp-2">
          {job.description}
        </p>

        {isRecommended && (
          <div className="mt-4 text-sm text-indigo-600 font-medium">
            Recommended based on your profile
          </div>
        )}
      </div>
    </Link>
  );
};
