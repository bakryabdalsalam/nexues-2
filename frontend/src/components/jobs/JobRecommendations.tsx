import { useQuery } from '@tanstack/react-query';
import { jobsApi } from '../../services/api';
import { JobCard } from './JobCard';
import { LoadingSkeleton } from '../common/LoadingSkeleton';

export const JobRecommendations = () => {
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['job-recommendations'],
    queryFn: jobsApi.getRecommendations,
    enabled: !!localStorage.getItem('token') // Only fetch if user is logged in
  });

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Recommended for You</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations?.map(job => (
          <JobCard key={job.id} job={job} isRecommended />
        ))}
      </div>
    </div>
  );
};
