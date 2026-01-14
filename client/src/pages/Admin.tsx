
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Admin = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', isAdmin: false });
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
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/${id}`, {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        });
        fetchUsers();
      } catch (error) {
        console.error('Failed to delete user', error);
      }
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    const userData = {
      email: newUser.email,
      password: newUser.password,
      app_metadata: {
        roles: newUser.isAdmin ? ['admin'] : [],
      },
    };

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/admin`, userData, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      setCreateModalOpen(false);
      setNewUser({ email: '', password: '', isAdmin: false });
      fetchUsers();
    } catch (error) {
      console.error('Failed to create user', error);
    }
  };

  return (
    <div className="container p-4 mx-auto">
      <h2 className="mb-4 text-2xl font-bold">User Management</h2>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2 text-white bg-green-500 rounded"
        >
          Create User
        </button>
      </div>
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

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold">Edit User</h2>
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
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 mr-2 text-white bg-blue-500 rounded"
                >
                  Update
                </button>
                <button
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold">Create User</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label>Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 mt-1 border rounded-md"
                  required
                />
              </div>
              <div>
                <label>Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3 py-2 mt-1 border rounded-md"
                  required
                />
              </div>
              <div>
                <label>
                  <input
                    type="checkbox"
                    checked={newUser.isAdmin}
                    onChange={(e) => setNewUser({ ...newUser, isAdmin: e.target.checked })}
                  />
                  Admin
                </label>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 mr-2 text-white bg-green-500 rounded"
                >
                  Create
                </button>
                <button
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
