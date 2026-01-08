import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Admin = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const { session } = useAuth();

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  useEffect(() => {
    if (session) {
      fetchUsers();
    }
  }, [session]);

  const handleEdit = (user: any) => {
    setEditingUser({
      ...user,
      isAdmin: (user.app_metadata?.roles as string[])?.includes('admin') || false,
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/${id}`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user', error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const updatedUser = {
      email: editingUser.email,
      app_metadata: {
        ...editingUser.app_metadata,
        roles: editingUser.isAdmin ? ['admin'] : [],
      },
    };

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/${editingUser.id}`,
        updatedUser,
        {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        }
      );
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Failed to update user', error);
    }
  };

  if (editingUser) {
    return (
      <div className="container p-4 mx-auto">
        <h2 className="mb-4 text-2xl font-bold">Edit User</h2>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label>Email</label>
            <input
              type="email"
              value={editingUser.email}
              onChange={(e) =>
                setEditingUser({ ...editingUser, email: e.target.value })
              }
              className="w-full px-3 py-2 mt-1 border rounded-md"
            />
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                checked={editingUser.isAdmin}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, isAdmin: e.target.checked })
                }
              />
              Admin
            </label>
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-500 rounded"
          >
            Update
          </button>
          <button
            onClick={() => setEditingUser(null)}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded"
          >
            Cancel
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="container p-4 mx-auto">
      <h2 className="mb-4 text-2xl font-bold">User Management</h2>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Admin</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-4 py-2 border">{user.email}</td>
              <td className="px-4 py-2 border">
                {(user.app_metadata?.roles as string[])?.includes('admin') ? 'Yes' : 'No'}
              </td>
              <td className="px-4 py-2 border">
                <button
                  onClick={() => handleEdit(user)}
                  className="px-2 py-1 mr-2 text-white bg-blue-500 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(user.id)}
                  className="px-2 py-1 text-white bg-red-500 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Admin;
