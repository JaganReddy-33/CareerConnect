import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Trash2, Users, Briefcase, Layers, Sparkles } from 'lucide-react';
import apiClient from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import AdminSidebar from '../../components/AdminSidebar';
import useTilt from '../../hooks/useTilt';
import { cardHover } from '../../utils/motion';

const metricCards = [
  {
    title: 'Total Users',
    key: 'totalUsers',
    icon: Users,
    accent: 'bg-sky-100 text-sky-700',
  },
  {
    title: 'Job Seekers',
    key: 'jobSeekers',
    icon: Briefcase,
    accent: 'bg-cyan-100 text-cyan-700',
  },
  {
    title: 'Employers',
    key: 'employers',
    icon: Layers,
    accent: 'bg-indigo-100 text-indigo-700',
  },
  {
    title: 'Total Jobs',
    key: 'totalJobs',
    icon: Sparkles,
    accent: 'bg-emerald-100 text-emerald-700',
  },
];

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    fetchPlatformData();
  }, []);

  const fetchPlatformData = async () => {
    try {
      setLoading(true);
      const [platformRes, userRes] = await Promise.all([
        apiClient.get('/admin/stats'),
        apiClient.get('/users/all'),
      ]);

      setDashboard(platformRes.data.data);
      setUsers(userRes.data.users);
    } catch (error) {
      console.error('Admin dashboard error:', error);
      showError('Unable to load admin metrics.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user? This action cannot be undone.')) return;

    try {
      await apiClient.delete(`/users/${userId}`);
      showSuccess('User deleted successfully');
      fetchPlatformData();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to delete user');
    }
  };

  // use shared tilt hook

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="text-sm uppercase tracking-[0.32em] text-sky-600">Admin Console</p>
          <h1 className="mt-4 text-4xl font-bold text-slate-900">Platform Performance</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Production-grade insights for users, jobs, and application flow—all in one central view.
          </p>
        </motion.div>

        <div className="grid grid-cols-12 gap-6 mb-10">
          <aside className="col-span-12 md:col-span-3">
            <AdminSidebar />
          </aside>

          <main className="col-span-12 md:col-span-9">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 mb-6">
              {metricCards.map((card) => {
                const Icon = card.icon;
                const tiltRef = useTilt();
                return (
                  <motion.div
                    key={card.key}
                    ref={tiltRef}
                    whileHover={cardHover}
                    transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm will-change-transform"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
                          {card.title}
                        </p>
                        <motion.p
                          key={card.key}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-4 text-3xl font-semibold text-slate-900"
                        >
                          {dashboard?.[card.key] ?? '—'}
                        </motion.p>
                      </div>
                      <div className={`inline-flex h-12 w-12 items-center justify-center rounded-3xl ${card.accent}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

        <div className="grid gap-6 xl:grid-cols-[2fr_1fr] mb-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Hiring activity</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Applications Trend</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                last 30 days
              </span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboard?.dailyApplications || []} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                <XAxis dataKey="_id" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Job category</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Open Positions</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                by type
              </span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboard?.jobsByType || []} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                <XAxis dataKey="_id" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#0ea5e9" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex flex-col gap-4 border-b border-slate-200 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Recent Users</h3>
              <p className="mt-1 text-sm text-slate-600">Review the most recent members with role-based access control.</p>
            </div>
            <button
              onClick={fetchPlatformData}
              className="inline-flex items-center rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Refresh data
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left uppercase tracking-[0.24em] text-slate-500">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {users.slice(0, 12).map((user) => (
                  <tr key={user._id} className="transition hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{user.name}</td>
                    <td className="px-6 py-4 text-slate-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'employer' ? 'bg-blue-100 text-blue-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteUser(user._id)}
                        className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-2 text-red-700 transition hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" /> Remove
                      </motion.button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
