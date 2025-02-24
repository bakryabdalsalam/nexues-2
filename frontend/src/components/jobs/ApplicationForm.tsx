import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsApi } from '../../services/api';

interface ApplicationFormProps {
  jobId: string;
}

interface ApplicationFormData {
  coverLetter: string;
  resume: string;
}

export const ApplicationForm = ({ jobId }: ApplicationFormProps) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ApplicationFormData>();

  const applicationMutation = useMutation({
    mutationFn: (data: ApplicationFormData) => 
      jobsApi.applyForJob(jobId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', jobId] });
      reset();
    },
  });

  return (
    <div className="mt-8">
      <h2 className="text-lg font-medium text-gray-900">Apply for this position</h2>
      <form onSubmit={handleSubmit((data) => applicationMutation.mutate(data))} className="mt-4 space-y-6">
        <div>
          <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700">
            Cover Letter
          </label>
          <textarea
            {...register('coverLetter', { required: 'Cover letter is required' })}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.coverLetter && (
            <p className="mt-1 text-sm text-red-600">{errors.coverLetter.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="resume" className="block text-sm font-medium text-gray-700">
            Resume Link
          </label>
          <input
            {...register('resume', { required: 'Resume link is required' })}
            type="url"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.resume && (
            <p className="mt-1 text-sm text-red-600">{errors.resume.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={applicationMutation.isPending}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {applicationMutation.isPending ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
};
