import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../../services/api';

export const Stats = () => {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: analyticsApi.getStats
  });

  const metrics = [
    { name: 'Total Jobs', value: stats?.totalJobs || 0 },
    { name: 'Active Applications', value: stats?.activeApplications || 0 },
    { name: 'Total Users', value: stats?.totalUsers || 0 },
    { name: 'Hired This Month', value: stats?.hiredThisMonth || 0 }
  ];

  return (
    <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <div key={metric.name} className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow">
          <dt className="truncate text-sm font-medium text-gray-500">{metric.name}</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {metric.value}
          </dd>
        </div>
      ))}
    </div>
  );
};
