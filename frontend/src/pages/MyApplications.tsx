import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { applicationApi } from '../services/api';
import { Application, ApiResponse } from '../types';

export const MyApplications: React.FC = () => {
  const { data: response, isLoading, error } = useQuery<ApiResponse<Application[]>>({
    queryKey: ['my-applications'],
    queryFn: () => applicationApi.getUserApplications()
  });

  const applications = response?.data;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !response?.success) {
    return (
      <div className="text-center text-red-600 py-8">
        {response?.message || 'Failed to load applications. Please try again later.'}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Applications</h1>

      {!applications?.length ? (
        <div className="text-center text-gray-500 py-8">
          You haven't applied to any jobs yet.
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <div
              key={application.id}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">{application.job.title}</h2>
                  <p className="text-gray-600">{application.job.company}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium
                  ${application.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                    application.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                    application.status === 'REVIEWING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'}`}
                >
                  {application.status.toLowerCase()}
                </span>
              </div>

              <div className="mt-4 text-sm text-gray-500">
                Applied on {new Date(application.createdAt).toLocaleDateString()}
              </div>

              {/* Add resume and cover letter links */}
              <div className="mt-4 space-y-2">
                {application.resume && (
                  <a
                    href={application.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
                  >
                    View Resume
                  </a>
                )}
                {application.coverLetter && (
                  <div className="text-sm text-gray-700">
                    <p className="font-medium mb-1">Cover Letter:</p>
                    <p className="whitespace-pre-wrap">{application.coverLetter}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 