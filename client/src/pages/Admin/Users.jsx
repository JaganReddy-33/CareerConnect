import React, { useEffect, useState } from 'react';
import apiClient from '../../api/axios';
import { motion } from 'framer-motion';
import { useToast } from '../../context/ToastContext';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/users/all');
      setUsers(res.data.users || []);
    } catch (err) {
      showError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete user?')) return;
    try {
      await apiClient.delete(`/users/${id}`);
      showSuccess('User removed');
      fetchUsers();
    } catch (err) {
      showError('Could not delete user');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Users</h2>
        <p className="text-sm text-slate-500">Manage platform users</p>
      </div>

      {loading ? (
        <div className="py-12 text-center">Loading...</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left bg-slate-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-t">
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">{u.role}</td>
                  <td className="px-4 py-3">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <motion.button whileHover={{ scale: 1.05 }} onClick={() => handleDelete(u._id)} className="px-3 py-1 rounded-lg bg-red-50 text-red-700">Remove</motion.button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
