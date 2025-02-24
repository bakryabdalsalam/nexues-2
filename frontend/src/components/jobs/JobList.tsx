import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { jobsApi } from '../../services/api';
import { JobCard } from './JobCard';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { toast } from 'react-toastify';

export const JobList = () => {
  const [page, setPage] = useState(1);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['jobs', page],
    queryFn: () => jobsApi.getJobs(page),
    onError: (error: Error) => {
      toast.error(`Failed to load jobs: ${error.message}`);
    }
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return null; // Toast will show the error

  return (
    <div className="space-y-6">
      {data?.data?.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          No jobs found. Check back later!
        </div>
      ) : (
        data?.data.map((job) => (
          <JobCard key={job.id} job={job} />
        ))
      )}
    </div>
  );
};
