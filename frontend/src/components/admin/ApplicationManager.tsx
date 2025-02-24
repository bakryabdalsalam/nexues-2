import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Application, ApplicationStatus } from '../../types';
import { applicationApi } from '../../services/api';
import { toast } from 'react-toastify';

export const ApplicationManager = () => {
  const queryClient = useQueryClient();
  const { data: applications, isLoading } = useQuery({
    queryKey: ['admin-applications'],
    queryFn: applicationApi.getAllApplications
  });

  const updateMutation = useMutation({
    mutationFn: applicationApi.updateApplicationStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-applications'] });
      toast.success('Application status updated');
    }
  });

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    REVIEWING: 'bg-blue-100 text-blue-800',
    ACCEPTED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800'
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="mt-8">
      <h2 className="text-lg font-medium text-gray-900">Application Management</h2>
      <div className="mt-4 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold">Applicant</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold">Job</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold">Status</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {applications?.map((application) => (
                  <tr key={application.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                      {application.user.email}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      {application.job.title}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full ${statusColors[application.status]}`}>
                        {application.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <select
                        value={application.status}
                        onChange={(e) => updateMutation.mutate({
                          id: application.id,
                          status: e.target.value as ApplicationStatus
                        })}
                        className="rounded-md border-gray-300 text-sm"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="REVIEWING">Reviewing</option>
                        <option value="ACCEPTED">Accepted</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
