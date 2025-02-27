import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobsApi } from '../services/api';

interface Job {
  id: string;
  title: string;
  company: {
    companyName: string;
    location: string;
  };
  location: string;
  experienceLevel: string;
  category: string;
  salary: number;
  remote: boolean;
  createdAt: string;
}

interface JobSearchFilters {
  search: string;
  category: string;
  location: string;
  remote: boolean;
  experienceLevel: string;
}

interface JobSearchProps {
  onSearch: (filters: JobSearchFilters) => void;
}

const JobSearch: React.FC<JobSearchProps> = ({ onSearch }) => {
  const [filters, setFilters] = useState<JobSearchFilters>({
    search: '',
    category: '',
    location: '',
    remote: false,
    experienceLevel: '',
  });

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const newFilters = {
      ...filters,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Search
          </label>
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search jobs..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Category Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            <option value="ENGINEERING">Engineering</option>
            <option value="DESIGN">Design</option>
            <option value="PRODUCT">Product</option>
            <option value="MARKETING">Marketing</option>
            <option value="SALES">Sales</option>
            <option value="CUSTOMER_SERVICE">Customer Service</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        {/* Location Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <input
            type="text"
            name="location"
            value={filters.location}
            onChange={handleFilterChange}
            placeholder="Enter location..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Experience Level Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Experience Level
          </label>
          <select
            name="experienceLevel"
            value={filters.experienceLevel}
            onChange={handleFilterChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">All Levels</option>
            <option value="JUNIOR">Junior</option>
            <option value="MID_LEVEL">Mid Level</option>
            <option value="SENIOR">Senior</option>
            <option value="LEAD">Lead</option>
            <option value="EXECUTIVE">Executive</option>
          </select>
        </div>

        {/* Remote Checkbox */}
        <div className="lg:col-span-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              name="remote"
              checked={filters.remote}
              onChange={handleFilterChange}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-600">Remote Only</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default JobSearch;