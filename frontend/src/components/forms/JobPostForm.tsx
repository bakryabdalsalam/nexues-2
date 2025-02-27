import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface JobFormData {
  title: string;
  description: string;
  location: string;
  experienceLevel: string;
  category: string;
  salary: number;
  remote: boolean;
  requirements: string[];
  benefits: string[];
}

interface JobPostFormProps {
  initialData?: JobFormData;
  isEditing?: boolean;
  jobId?: string;
}

const JobPostForm: React.FC<JobPostFormProps> = ({
  initialData,
  isEditing = false,
  jobId,
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<JobFormData>(
    initialData || {
      title: '',
      description: '',
      location: '',
      experienceLevel: '',
      category: '',
      salary: 0,
      remote: false,
      requirements: [''],
      benefits: [''],
    }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleArrayInputChange = (
    index: number,
    value: string,
    field: 'requirements' | 'benefits'
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const addArrayItem = (field: 'requirements' | 'benefits') => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const removeArrayItem = (index: number, field: 'requirements' | 'benefits') => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEditing && jobId) {
        await axios.put(`/api/company/jobs/${jobId}`, formData);
      } else {
        await axios.post('/api/company/jobs', formData);
      }
      navigate('/company/jobs');
    } catch (err) {
      console.error('Error submitting job:', err);
      setError('Failed to submit job posting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          required
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Experience Level
          </label>
          <select
            name="experienceLevel"
            value={formData.experienceLevel}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select Level</option>
            <option value="Entry">Entry Level</option>
            <option value="Mid">Mid Level</option>
            <option value="Senior">Senior Level</option>
            <option value="Lead">Lead</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Salary
          </label>
          <input
            type="number"
            name="salary"
            value={formData.salary}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="remote"
          checked={formData.remote}
          onChange={handleCheckboxChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label className="ml-2 block text-sm text-gray-700">Remote Position</label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Requirements
        </label>
        {formData.requirements.map((req, index) => (
          <div key={index} className="flex gap-2 mt-2">
            <input
              type="text"
              value={req}
              onChange={(e) =>
                handleArrayInputChange(index, e.target.value, 'requirements')
              }
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => removeArrayItem(index, 'requirements')}
              className="text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem('requirements')}
          className="mt-2 text-sm text-blue-500 hover:text-blue-700"
        >
          Add Requirement
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Benefits
        </label>
        {formData.benefits.map((benefit, index) => (
          <div key={index} className="flex gap-2 mt-2">
            <input
              type="text"
              value={benefit}
              onChange={(e) =>
                handleArrayInputChange(index, e.target.value, 'benefits')
              }
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => removeArrayItem(index, 'benefits')}
              className="text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem('benefits')}
          className="mt-2 text-sm text-blue-500 hover:text-blue-700"
        >
          Add Benefit
        </button>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => navigate('/company/jobs')}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {loading ? 'Saving...' : isEditing ? 'Update Job' : 'Create Job'}
        </button>
      </div>
    </form>
  );
};

export default JobPostForm; 