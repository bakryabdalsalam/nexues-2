import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Switch } from '@headlessui/react';

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
  const { register, handleSubmit, watch, setValue } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      remote: false
    }
  });

  const remote = watch('remote');

  return (
    <form onSubmit={handleSubmit(onSearch)} className="bg-white p-6 rounded-lg shadow-sm space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Keyword Search */}
        <div className="col-span-full md:col-span-2">
          <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-1">
            Search Keywords
          </label>
          <input
            id="keyword"
            type="text"
            {...register('keyword')}
            placeholder="Job title, skills, or company"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <select
            id="location"
            {...register('location')}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">All Locations</option>
            <option value="remote">Remote</option>
            <option value="onsite">On-site</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            {...register('category')}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">All Categories</option>
            <option value="development">Development</option>
            <option value="design">Design</option>
            <option value="marketing">Marketing</option>
            <option value="sales">Sales</option>
            <option value="customer_service">Customer Service</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Experience Level */}
        <div>
          <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700 mb-1">
            Experience Level
          </label>
          <select
            id="experienceLevel"
            {...register('experienceLevel')}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">All Levels</option>
            <option value="entry">Entry Level</option>
            <option value="mid">Mid Level</option>
            <option value="senior">Senior Level</option>
            <option value="lead">Lead</option>
            <option value="executive">Executive</option>
          </select>
        </div>

        {/* Employment Type */}
        <div>
          <label htmlFor="employmentType" className="block text-sm font-medium text-gray-700 mb-1">
            Employment Type
          </label>
          <select
            id="employmentType"
            {...register('employmentType')}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">All Types</option>
            <option value="full_time">Full Time</option>
            <option value="part_time">Part Time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
            <option value="temporary">Temporary</option>
          </select>
        </div>

        {/* Salary Range */}
        <div className="col-span-full md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Salary Range (per year)
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                type="number"
                {...register('salary.min', { valueAsNumber: true })}
                placeholder="Min Salary"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <input
                type="number"
                {...register('salary.max', { valueAsNumber: true })}
                placeholder="Max Salary"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Remote Option */}
        <div className="col-span-full">
          <Switch.Group>
            <div className="flex items-center">
              <Switch.Label className="mr-4 text-sm font-medium text-gray-700">
                Remote Only
              </Switch.Label>
              <Switch
                checked={remote}
                onChange={(checked) => setValue('remote', checked)}
                className={`${
                  remote ? 'bg-indigo-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
              >
                <span
                  className={`${
                    remote ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
            </div>
          </Switch.Group>
        </div>
      </div>

      {/* Search Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Search Jobs
        </button>
      </div>
    </form>
  );
};
