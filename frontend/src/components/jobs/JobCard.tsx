import { Link } from 'react-router-dom';
import { Job } from '../../types';
import { memo } from 'react';

interface JobCardProps {
  job: Job;
}

export const JobCard = memo(({ job }: JobCardProps) => {
  if (!job) {
    return null;
  }

  return (
    <Link to={`/jobs/${job.id}`} className="block" aria-label={`View job: ${job.title} at ${job.company}`}>
      <article className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{job.title || 'Untitled Position'}</h3>
            <p className="mt-1 text-gray-500">{job.company || 'Company not specified'}</p>
          </div>
          {job.experienceLevel && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
              {job.experienceLevel}
            </span>
          )}
        </div>
        <div className="mt-4">
          {job.location && (
            <div className="flex items-center text-sm text-gray-500">
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {job.location}
            </div>
          )}
          {job.salary && (
            <p className="mt-2 text-sm text-gray-500">
              ${job.salary.toLocaleString()} per year
            </p>
          )}
        </div>
      </article>
    </Link>
  );
});

JobCard.displayName = 'JobCard';
