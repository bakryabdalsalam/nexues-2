import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface CompanyProfileFormData {
  companyName: string;
  description: string;
  industry: string;
  size: string;
  website: string;
  location: string;
  logo: string;
}

interface CompanyProfileFormProps {
  initialData?: CompanyProfileFormData;
}

const CompanyProfileForm: React.FC<CompanyProfileFormProps> = ({
  initialData,
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CompanyProfileFormData>(
    initialData || {
      companyName: '',
      description: '',
      industry: '',
      size: '',
      website: '',
      location: '',
      logo: '',
    }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let logoUrl = formData.logo;

      // Upload logo if a new file is selected
      if (logoFile) {
        const formData = new FormData();
        formData.append('logo', logoFile);
        const uploadRes = await axios.post('/api/upload/logo', formData);
        logoUrl = uploadRes.data.url;
      }

      await axios.put('/api/company/profile', {
        ...formData,
        logo: logoUrl,
      });

      navigate('/company');
    } catch (err) {
      console.error('Error updating company profile:', err);
      setError('Failed to update company profile');
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
        <label className="block text-sm font-medium text-gray-700">
          Company Name
        </label>
        <input
          type="text"
          name="companyName"
          value={formData.companyName}
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
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Industry
          </label>
          <input
            type="text"
            name="industry"
            value={formData.industry}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Company Size
          </label>
          <select
            name="size"
            value={formData.size}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select Size</option>
            <option value="1-10">1-10 employees</option>
            <option value="11-50">11-50 employees</option>
            <option value="51-200">51-200 employees</option>
            <option value="201-500">201-500 employees</option>
            <option value="501-1000">501-1000 employees</option>
            <option value="1000+">1000+ employees</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Website
          </label>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Company Logo
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mt-1 block w-full"
        />
        {formData.logo && (
          <div className="mt-2">
            <img
              src={formData.logo}
              alt="Company Logo"
              className="h-20 w-20 object-contain"
            />
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => navigate('/company')}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </form>
  );
};

export default CompanyProfileForm; 