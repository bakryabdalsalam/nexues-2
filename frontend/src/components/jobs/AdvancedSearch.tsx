import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const searchSchema = z.object({
  keyword: z.string().optional(),
  location: z.string().optional(),
  category: z.string().optional(),
  experienceLevel: z.string().optional(),
  salary: z.object({
    min: z.number().optional(),
    max: z.number().optional()
  }).optional(),
  employmentType: z.string().optional(),
  remote: z.boolean().optional()
});

type SearchFormData = z.infer<typeof searchSchema>;

interface Props {
  onSearch: (filters: SearchFormData) => void;
}

export const AdvancedSearch = ({ onSearch }: Props) => {
  const { register, handleSubmit } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema)
  });

  return (
    <form onSubmit={handleSubmit(onSearch)} className="bg-white p-6 rounded-lg shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <input
            {...register('keyword')}
            placeholder="Keywords..."
            className="w-full rounded-md border-gray-300"
          />
        </div>
        <div>
          <select {...register('category')} className="w-full rounded-md border-gray-300">
            <option value="">All Categories</option>
            <option value="development">Development</option>
            <option value="design">Design</option>
            <option value="marketing">Marketing</option>
          </select>
        </div>
        <div>
          <select {...register('location')} className="w-full rounded-md border-gray-300">
            <option value="">All Locations</option>
            <option value="remote">Remote</option>
            <option value="onsite">On-site</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>
        <div>
          <select {...register('experienceLevel')} className="w-full rounded-md border-gray-300">
            <option value="">All Levels</option>
            <option value="entry">Entry Level</option>
            <option value="mid">Mid Level</option>
            <option value="senior">Senior Level</option>
          </select>
        </div>
        <div>
          <div className="flex gap-2">
            <input
              {...register('salary.min', { valueAsNumber: true })}
              type="number"
              placeholder="Min Salary"
              className="w-full rounded-md border-gray-300"
            />
            <input
              {...register('salary.max', { valueAsNumber: true })}
              type="number"
              placeholder="Max Salary"
              className="w-full rounded-md border-gray-300"
            />
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Search Jobs
        </button>
      </div>
    </form>
  );
};
