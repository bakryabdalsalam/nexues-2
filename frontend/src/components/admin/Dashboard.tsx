import { useQuery } from '@tanstack/react-query';
import { jobsApi } from '../../services/api';
import { JobTable } from './JobTable';
import { Stats } from './Stats';
import { LoadingSkeleton } from '../common/LoadingSkeleton';

export const AdminDashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-jobs'],
    queryFn: () => jobsApi.getJobs(1, 100)
  });

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
      <Stats />
      <JobTable jobs={data?.data || []} />
    </div>
  );
};
