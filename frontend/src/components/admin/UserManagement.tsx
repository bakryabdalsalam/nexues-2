import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/api';
import { useState } from 'react';
import { toast } from 'react-toastify';

export const UserManagement = () => {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();
  
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users', search],
    queryFn: () => adminApi.getUsers({ search })
  });

  const updateRoleMutation = useMutation({
    mutationFn: adminApi.updateUserRole,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      toast.success('User role updated');
    }
  });

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">User Management</h2>
        <input
          type="search"
          placeholder="Search users..."
          className="rounded-md border-gray-300 shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300">
          <thead>
            <tr>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Name</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Role</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users?.map(user => (
              <tr key={user.id}>
                <td className="px-3 py-4 text-sm text-gray-900">{user.name}</td>
                <td className="px-3 py-4 text-sm text-gray-500">{user.email}</td>
                <td className="px-3 py-4 text-sm text-gray-500">
                  <select
                    value={user.role}
                    onChange={(e) => updateRoleMutation.mutate({
                      userId: user.id,
                      role: e.target.value as 'USER' | 'ADMIN'
                    })}
                    className="rounded-md border-gray-300 text-sm"
                  >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </td>
                <td className="px-3 py-4 text-sm text-gray-500">
                  <button
                    onClick={() => {/* implement user details view */}}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
