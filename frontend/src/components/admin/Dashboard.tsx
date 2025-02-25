import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { jobsApi } from '../../services/api';
import { BriefcaseIcon, UserGroupIcon, DocumentTextIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

export const AdminDashboard: React.FC = () => {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => jobsApi.getStats()
  });

  const metrics = [
    {
      name: 'Total Jobs',
      value: stats?.totalJobs || 0,
      icon: BriefcaseIcon,
      change: '+4.75%',
      changeType: 'positive'
    },
    {
      name: 'Total Applications',
      value: stats?.totalApplications || 0,
      icon: DocumentTextIcon,
      change: '+54.02%',
      changeType: 'positive'
    },
    {
      name: 'Active Users',
      value: stats?.activeUsers || 0,
      icon: UserGroupIcon,
      change: '+2.59%',
      changeType: 'positive'
    },
    {
      name: 'Companies',
      value: stats?.totalCompanies || 0,
      icon: BuildingOfficeIcon,
      change: '+12.03%',
      changeType: 'positive'
    },
  ];

  return (
    <div className="bg-white shadow-sm rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-sm text-gray-700">
              Overview of your job board's performance and key metrics.
            </p>
          </div>
        </div>

        <dl className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <div
              key={metric.name}
              className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-12 shadow sm:px-6 sm:pt-6"
            >
              <dt>
                <div className="absolute rounded-md bg-indigo-500 p-3">
                  <metric.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <p className="ml-16 truncate text-sm font-medium text-gray-500">{metric.name}</p>
              </dt>
              <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                <p className="text-2xl font-semibold text-gray-900">{metric.value}</p>
                <p
                  className={`ml-2 flex items-baseline text-sm font-semibold ${
                    metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {metric.change}
                </p>
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          <div className="mt-4 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                          Event
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          User
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {(stats?.recentActivity || []).map((activity: any) => (
                        <tr key={activity.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {activity.event}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{activity.user}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{activity.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
