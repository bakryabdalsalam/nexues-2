import React from 'react';
import { useAuthStore } from '../store/auth.store';

export const Profile: React.FC = () => {
  const user = useAuthStore(state => state.user);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <p className="mt-1 text-lg">{user?.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-lg">{user?.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <p className="mt-1 text-lg capitalize">{user?.role}</p>
          </div>
        </div>

        <div className="mt-8">
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            onClick={() => {/* TODO: Implement edit profile */}}
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}; 