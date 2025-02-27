import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

interface JobApplicationFormProps {
  onSubmit?: () => void;
}

const JobApplicationForm: React.FC<JobApplicationFormProps> = ({ onSubmit }) => {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    coverLetter: '',
    resume: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await axios.post(`${API_URL}/api/upload/resume`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.url) {
        setFormData(prev => ({
          ...prev,
          resume: response.data.url
        }));
        toast.success('Resume uploaded successfully');
      }
    } catch (error) {
      console.error('Resume upload error:', error);
      toast.error('Failed to upload resume');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobId) {
      toast.error('Job ID is missing');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/applications`, {
        jobId,
        ...formData
      });

      if (response.data) {
        toast.success('Application submitted successfully');
        onSubmit?.();
        navigate('/applications');
      }
    } catch (error) {
      console.error('Application submission error:', error);
      toast.error('Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Please log in to apply for this job.</p>
        <button
          onClick={() => navigate('/login')}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Log In
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
      <div>
        <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700">
          Cover Letter
        </label>
        <textarea
          id="coverLetter"
          name="coverLetter"
          rows={6}
          required
          value={formData.coverLetter}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Tell us why you're a great fit for this position..."
        />
      </div>

      <div>
        <label htmlFor="resume" className="block text-sm font-medium text-gray-700">
          Resume
        </label>
        <input
          type="file"
          id="resume"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className="mt-1 block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
        {formData.resume && (
          <p className="mt-2 text-sm text-gray-500">
            Resume uploaded successfully
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mr-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>
      </div>
    </form>
  );
};

export default JobApplicationForm; 