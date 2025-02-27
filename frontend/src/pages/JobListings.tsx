import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jobsApi } from '../services/api';
import { Job } from '../types';
import JobSearch from '../components/JobSearch';

interface JobFilters {
  search?: string;
  category?: string;
  location?: string;
  remote?: boolean;
  experienceLevel?: string;
}

const JobListings: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<JobFilters>({});
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchJobs = async (page = 1, searchFilters = {}) => {
    try {
      setLoading(true);
      setError('');
      const response = await jobsApi.getJobs(page, searchFilters);
      
      if (response.success && response.data) {
        setJobs(response.data.jobs || []);
        setTotalPages(response.data.pagination?.totalPages || 0);
      } else {
        throw new Error(response.message || 'Failed to fetch jobs');
      }
    } catch (err: any) {
      console.error('Error fetching jobs:', err);
      setError(err.message || 'Failed to load jobs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(currentPage, filters);
  }, [currentPage, filters]);

  const handleSearch = (searchFilters: JobFilters) => {
    setFilters(searchFilters);
    setCurrentPage(1); // Reset to first page when new search is performed
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Find Your Next Opportunity</h1>
        <p className="mt-2 text-lg text-gray-600">
          Browse through our curated list of job opportunities
        </p>
      </div>

      <JobSearch onSearch={handleSearch} />

      {error ? (
        <div className="mt-8 bg-red-50 text-red-600 p-4 rounded-md">
          {error}
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No jobs found matching your criteria.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 mt-8">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <Link
                      to={`/jobs/${job.id}`}
                      className="text-xl font-semibold text-blue-600 hover:text-blue-800"
                    >
                      {job.title}
                    </Link>
                    <p className="text-gray-600 mt-1">
                      {job.company?.name || job.company?.companyName || 'Company Name Not Available'}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    {job.employmentType}
                  </span>
                </div>

                <div className="mt-4 text-gray-600">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {job.location}
                    </span>
                    {job.salary && (
                      <span className="flex items-center">
                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        ${job.salary.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 text-sm bg-gray-100 rounded">
                      {job.experienceLevel}
                    </span>
                    <span className="px-2 py-1 text-sm bg-gray-100 rounded">
                      {job.category}
                    </span>
                    {job.remote && (
                      <span className="px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded">
                        Remote
                      </span>
                    )}
                  </div>
                  <Link
                    to={`/jobs/${job.id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default JobListings;