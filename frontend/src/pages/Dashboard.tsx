import React from 'react';
import { useAuthStore } from '../store/auth.store';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const user = useAuthStore(state => state.user);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Welcome, {user?.name || 'User'}!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          to="/applications"
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">My Applications</h2>
          <p className="text-gray-600">View and manage your job applications</p>
        </Link>

        <Link
          to="/jobs"
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">Browse Jobs</h2>
          <p className="text-gray-600">Explore available job opportunities</p>
        </Link>

        <Link
          to="/profile"
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">My Profile</h2>
          <p className="text-gray-600">Update your profile and preferences</p>
        </Link>
      </div>
    </div>
  );
}; 