import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationApi } from '../../services/api';
import { useAuthStore } from '../../store/auth.store';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface ApplicationFormProps {
  jobId: string;
}

interface ApplicationFormData {
  coverLetter: string;
  resume: string;
}

export const ApplicationForm: React.FC<ApplicationFormProps> = ({ jobId }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { isAuthenticated, checkAuth } = useAuthStore();
  
  const { 
    register, 
    handleSubmit, 
    reset,
    formState: { errors, isSubmitting } 
  } = useForm<ApplicationFormData>();

  useEffect(() => {
    // Verify authentication when component mounts
    checkAuth();
  }, [checkAuth]);

  const applicationMutation = useMutation({
    mutationFn: async (data: ApplicationFormData) => {
      if (!isAuthenticated) {
        throw new Error('Please log in to submit an application');
      }
      return applicationApi.createApplication(jobId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
      queryClient.invalidateQueries({ queryKey: ['job', jobId] });
      toast.success('Application submitted successfully!');
      reset();
    },
    onError: (error: any) => {
      console.error('Application submission error:', error);
      if (error.response?.status === 401) {
        toast.error('Please log in again to submit your application');
        navigate('/login', { state: { from: `/jobs/${jobId}` } });
        return;
      }
      const message = error.response?.data?.message || error.message || 'Failed to submit application';
      toast.error(message);
    }
  });

  const onSubmit = (data: ApplicationFormData) => {
    applicationMutation.mutate(data);
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Apply for this Position</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700">
            Cover Letter
          </label>
          <div className="mt-1">
            <textarea
              id="coverLetter"
              rows={4}
              {...register('coverLetter', { 
                required: 'Cover letter is required',
                minLength: {
                  value: 100,
                  message: 'Cover letter should be at least 100 characters'
                }
              })}
              className={`shadow-sm block w-full sm:text-sm border-gray-300 rounded-md
                ${errors.coverLetter ? 'border-red-300' : ''}`}
              placeholder="Tell us why you're a great fit for this position..."
            />
            {errors.coverLetter && (
              <p className="mt-1 text-sm text-red-600">{errors.coverLetter.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="resume" className="block text-sm font-medium text-gray-700">
            Resume Link
          </label>
          <div className="mt-1">
            <input
              type="url"
              id="resume"
              {...register('resume', { 
                required: 'Resume link is required',
                pattern: {
                  value: /^https?:\/\/.+/i,
                  message: 'Please enter a valid URL'
                }
              })}
              className={`shadow-sm block w-full sm:text-sm border-gray-300 rounded-md
                ${errors.resume ? 'border-red-300' : ''}`}
              placeholder="https://your-resume-link.com"
            />
            {errors.resume && (
              <p className="mt-1 text-sm text-red-600">{errors.resume.message}</p>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Please provide a link to your resume (Google Drive, Dropbox, etc.)
          </p>
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting || applicationMutation.isPending || !isAuthenticated}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md
              shadow-sm text-sm font-medium text-white bg-indigo-600 
              ${(isSubmitting || applicationMutation.isPending || !isAuthenticated) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'}
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          >
            {(isSubmitting || applicationMutation.isPending) ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : !isAuthenticated ? (
              'Please log in to apply'
            ) : (
              'Submit Application'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
