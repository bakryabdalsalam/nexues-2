import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Application, ApplicationStatus } from '../../types';
import { applicationApi } from '../../services/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { Dialog } from '@headlessui/react';

export const ApplicationManager = () => {
  const queryClient = useQueryClient();
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: response, isLoading } = useQuery({
    queryKey: ['admin-applications'],
    queryFn: applicationApi.getAllApplications
  });

  const applications = response?.data || [];

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ApplicationStatus }) => {
      try {
        setIsUpdating(true);
        console.log('Starting status update:', { id, status });
        const result = await applicationApi.updateApplicationStatus(id, status);
        console.log('Status update successful:', result);
        return result;
      } catch (error) {
        console.error('Error in mutation:', error);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    onSuccess: (data) => {
      console.log('Mutation succeeded:', data);
      queryClient.invalidateQueries({ queryKey: ['admin-applications'] });
      toast.success('Application status updated successfully');
      if (isDetailsModalOpen && selectedApplication) {
        setIsDetailsModalOpen(false);
        setSelectedApplication(null);
      }
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
      const errorMessage = error?.message || 
                          error?.response?.data?.message || 
                          'Failed to update application status. Please try again.';
      toast.error(errorMessage);
      setIsUpdating(false);
    }
  });

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    REVIEWING: 'bg-blue-100 text-blue-800',
    ACCEPTED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800'
  };

  const statusLabels = {
    PENDING: 'Pending Review',
    REVIEWING: 'Under Review',
    ACCEPTED: 'Accepted',
    REJECTED: 'Rejected'
  };

  const handleStatusChange = async (id: string, newStatus: ApplicationStatus) => {
    try {
      if (!id || !newStatus) {
        toast.error('Invalid application ID or status');
        return;
      }

      if (window.confirm(`Are you sure you want to change the status to ${statusLabels[newStatus]}?`)) {
        console.log('Initiating status change:', { id, newStatus });
        await updateMutation.mutateAsync({ id, status: newStatus });
      }
    } catch (error) {
      console.error('Status change error:', error);
      // Error is handled by mutation's onError
    }
  };

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application);
    setIsDetailsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">Applications</h1>
            <p className="mt-2 text-sm text-gray-700">
              A list of all job applications with their current status.
            </p>
          </div>
        </div>

        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Applicant</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Job Position</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Company</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Applied Date</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {applications.map((application: Application) => (
                    <tr key={application.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                        <div className="font-medium text-gray-900">{application.user?.name}</div>
                        <div className="text-gray-500">{application.user?.email}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                        {application.job?.title}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {application.job?.company}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {format(new Date(application.createdAt), 'MMM dd, yyyy')}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${statusColors[application.status]}`}>
                          {statusLabels[application.status]}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <div className="flex items-center space-x-4">
                          <select
                            value={application.status}
                            onChange={(e) => handleStatusChange(application.id, e.target.value as ApplicationStatus)}
                            disabled={isUpdating}
                            className={`rounded-md border-gray-300 text-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                              isUpdating ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {Object.entries(statusLabels).map(([value, label]) => (
                              <option key={value} value={value}>{label}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleViewDetails(application)}
                            className="text-indigo-600 hover:text-indigo-900"
                            disabled={isUpdating}
                          >
                            View Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Application Details Modal */}
      <Dialog
        open={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
            <Dialog.Title className="text-lg font-medium mb-4">
              Application Details
            </Dialog.Title>

            {selectedApplication && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Applicant Information</h3>
                    <div className="mt-2 space-y-2">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">Name:</span> {selectedApplication.user?.name}
                      </p>
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">Email:</span> {selectedApplication.user?.email}
                      </p>
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">Applied:</span> {format(new Date(selectedApplication.createdAt), 'PPP')}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Job Information</h3>
                    <div className="mt-2 space-y-2">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">Position:</span> {selectedApplication.job?.title}
                      </p>
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">Company:</span> {selectedApplication.job?.company}
                      </p>
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">Location:</span> {selectedApplication.job?.location}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Cover Letter</h3>
                  <div className="mt-2 p-4 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                      {selectedApplication.coverLetter || 'No cover letter provided'}
                    </p>
                  </div>
                </div>

                {selectedApplication.resume && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Resume</h3>
                    <div className="mt-2">
                      <a
                        href={selectedApplication.resume}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-900 text-sm"
                      >
                        View Resume
                      </a>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Application Status</h3>
                  <div className="mt-2">
                    <select
                      value={selectedApplication.status}
                      onChange={(e) => handleStatusChange(selectedApplication.id, e.target.value as ApplicationStatus)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsDetailsModalOpen(false)}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Dialog>
    </div>
  );
};
