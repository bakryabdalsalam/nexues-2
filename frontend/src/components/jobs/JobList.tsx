import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { jobsApi } from '../../services/api';
import { JobCard } from './JobCard';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { AdvancedSearch } from './AdvancedSearch';
import { Job, PaginatedResponse } from '../../types';
import { z } from 'zod';

// Define the search schema (same as in AdvancedSearch)
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

export const JobList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<SearchFormData>({});
  
  const { data, isLoading, isError } = useQuery<PaginatedResponse<Job[]>>({
    queryKey: ['jobs', page, filters],
    queryFn: () => jobsApi.getJobs(page, filters),
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  const handleSearch = (searchFilters: SearchFormData) => {
    setFilters(searchFilters);
    setPage(1); // Reset to first page when new search is performed
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <AdvancedSearch onSearch={handleSearch} />
        <div className="flex justify-center items-center min-h-[200px]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-8">
        <AdvancedSearch onSearch={handleSearch} />
        <div className="text-center text-red-500 py-10">
          <p>Failed to load jobs.</p>
          <p className="text-sm">Please try again later.</p>
        </div>
      </div>
    );
  }

  const jobs = data.data;
  const totalPages = data.pagination.pages;

  return (
    <div className="space-y-8">
      <AdvancedSearch onSearch={handleSearch} />
      
      <div className="space-y-6">
        {jobs.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            No jobs found matching your criteria. Try adjusting your filters.
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 mr-2 bg-gray-200 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= totalPages}
                  className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
