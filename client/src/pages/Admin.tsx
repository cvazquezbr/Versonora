import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Header from "@/components/Header";
import { useAuth } from '../contexts/AuthContext';
import { getErrorMessage } from '../lib/utils';
import { API_URL } from '../lib/api-config';
import { Link } from 'wouter';

const Admin = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', isAdmin: false });
  const { token } = useAuth();

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/admin`);
      setUsers(data);
    } catch (error) {
      console.error(getErrorMessage(error, 'Failed to fetch users'));
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  const handleEdit = (user: any) => {
    setEditingUser({
      ...user,
      isAdmin: user.roles?.includes('admin') || false,
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`${API_URL}/api/admin/${id}`);
        fetchUsers();
      } catch (error) {
        console.error(getErrorMessage(error, 'Failed to delete user'));
      }
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const updatedUser = {
      email: editingUser.email,
      roles: editingUser.isAdmin ? ['admin'] : [],
    };

    try {
      await axios.put(
        `${API_URL}/api/admin/${editingUser.id}`,
        updatedUser
      );
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error(getErrorMessage(error, 'Failed to update user'));
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    const userData = {
      email: newUser.email,
      password: newUser.password,
      roles: newUser.isAdmin ? ['admin'] : [],
    };

    try {
      await axios.post(`${API_URL}/api/admin`, userData);
      setCreateModalOpen(false);
      setNewUser({ email: '', password: '', isAdmin: false });
      fetchUsers();
    } catch (error) {
      console.error(getErrorMessage(error, 'Failed to create user'));
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header showNav={false} />
      <div className="container pt-24 p-4 mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
          <Link href="/admin/production-cases">
            <button className="px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700 transition-colors">
              Gerenciar Casos de Produção
            </button>
          </Link>
        </div>
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
                {user.roles?.includes('admin') ? 'Yes' : 'No'}
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

      </div>
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
