import React, { useEffect, useState } from 'react';
import { adminApi } from '../../services/api';
import { User } from '../../types';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await adminApi.getUsers();
        setUsers(response.data);
      } catch (err) {
        setError('Failed to fetch users');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, role: 'USER' | 'ADMIN' | 'COMPANY') => {
    try {
      await adminApi.updateUserRole({ userId, role });
      // Refresh user list
      const response = await adminApi.getUsers();
      setUsers(response.data);
    } catch (err) {
      console.error('Error updating user role:', err);
    }
  };

  const handleStatusUpdate = async (userId: string, isActive: boolean) => {
    try {
      await adminApi.updateUser(userId, { isActive });
      // Refresh user list
      const response = await adminApi.getUsers();
      setUsers(response.data);
    } catch (err) {
      console.error('Error updating user status:', err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Role</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="px-4 py-2">
                    <div className="font-medium">{user.name}</div>
                  </td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">
                    <select
                      value={user.role}
                      onChange={(e) => 
                        handleRoleChange(
                          user.id, 
                          e.target.value as 'USER' | 'ADMIN' | 'COMPANY'
                        )
                      }
                      className="border rounded px-2 py-1"
                    >
                      <option value="USER">User</option>
                      <option value="COMPANY">Company</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        user.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleStatusUpdate(user.id, !user.isActive)}
                      className="text-blue-600 hover:text-blue-800 mr-2"
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;