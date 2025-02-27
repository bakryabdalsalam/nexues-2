import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface UserProfileFormData {
  resume: string;
  skills: string[];
  experience: string;
  education: string;
  bio: string;
  phoneNumber: string;
  address: string;
  linkedIn: string;
  github: string;
  portfolio: string;
}

interface UserProfileFormProps {
  initialData?: UserProfileFormData;
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({ initialData }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<UserProfileFormData>(
    initialData || {
      resume: '',
      skills: [''],
      experience: '',
      education: '',
      bio: '',
      phoneNumber: '',
      address: '',
      linkedIn: '',
      github: '',
      portfolio: '',
    }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSkillChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.map((skill, i) => (i === index ? value : skill)),
    }));
  };

  const addSkill = () => {
    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, ''],
    }));
  };

  const removeSkill = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let resumeUrl = formData.resume;

      // Upload resume if a new file is selected
      if (resumeFile) {
        const formData = new FormData();
        formData.append('resume', resumeFile);
        const uploadRes = await axios.post('/api/upload/resume', formData);
        resumeUrl = uploadRes.data.url;
      }

      await axios.put('/api/user/profile', {
        ...formData,
        resume: resumeUrl,
      });

      navigate('/dashboard');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
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
        <label className="block text-sm font-medium text-gray-700">Bio</label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleInputChange}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Skills</label>
        {formData.skills.map((skill, index) => (
          <div key={index} className="flex gap-2 mt-2">
            <input
              type="text"
              value={skill}
              onChange={(e) => handleSkillChange(index, e.target.value)}
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => removeSkill(index)}
              className="text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addSkill}
          className="mt-2 text-sm text-blue-500 hover:text-blue-700"
        >
          Add Skill
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Experience
        </label>
        <textarea
          name="experience"
          value={formData.experience}
          onChange={handleInputChange}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Education
        </label>
        <textarea
          name="education"
          value={formData.education}
          onChange={handleInputChange}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Address
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            LinkedIn
          </label>
          <input
            type="url"
            name="linkedIn"
            value={formData.linkedIn}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            GitHub
          </label>
          <input
            type="url"
            name="github"
            value={formData.github}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Portfolio
          </label>
          <input
            type="url"
            name="portfolio"
            value={formData.portfolio}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Resume</label>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className="mt-1 block w-full"
        />
        {formData.resume && (
          <div className="mt-2">
            <a
              href={formData.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:text-blue-700"
            >
              View Current Resume
            </a>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
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

export default UserProfileForm; 