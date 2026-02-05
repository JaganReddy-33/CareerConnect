import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import apiClient from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Badge from '../components/Badge';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';

const JobAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/alerts');
      setAlerts(response.data.alerts);
    } catch (error) {
      showError('Failed to load job alerts');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        keywords: data.keywords?.split(',').map(k => k.trim()).filter(k => k),
        jobType: data.jobType?.split(',').map(t => t.trim()).filter(t => t),
        location: data.location,
        minSalary: data.minSalary ? parseInt(data.minSalary) : undefined,
        maxSalary: data.maxSalary ? parseInt(data.maxSalary) : undefined,
        remote: data.remote === 'on',
        frequency: data.frequency,
      };

      if (editingId) {
        await apiClient.put(`/alerts/${editingId}`, payload);
        showSuccess('Job alert updated successfully');
        setEditingId(null);
      } else {
        await apiClient.post('/alerts', payload);
        showSuccess('Job alert created successfully');
      }

      reset();
      setShowForm(false);
      fetchAlerts();
    } catch (error) {
      showError(error.response?.data?.message || editingId ? 'Failed to update alert' : 'Failed to create alert');
    }
  };

  const handleEditAlert = (alert) => {
    setEditingId(alert._id);
    setValue('keywords', alert.keywords?.join(', ') || '');
    setValue('location', alert.location || '');
    setValue('minSalary', alert.minSalary || '');
    setValue('maxSalary', alert.maxSalary || '');
    setValue('jobType', alert.jobType?.join(', ') || '');
    setValue('remote', alert.remote ? 'on' : '');
    setValue('frequency', alert.frequency || 'daily');
    setShowForm(true);
  };

  const handleDeleteAlert = async (alertId) => {
    if (!window.confirm('Delete this alert?')) return;
    try {
      await apiClient.delete(`/alerts/${alertId}`);
      showSuccess('Alert deleted');
      fetchAlerts();
    } catch (error) {
      showError('Failed to delete alert');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <LoadingSkeleton count={3} type="card" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Job Alerts</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Get notified about jobs matching your preferences
            </p>
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              reset();
            }}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
          >
            {showForm ? '✕ Cancel' : '+ New Alert'}
          </motion.button>
        </div>

        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white dark:bg-gray-800 rounded-lg p-8 mb-8 shadow-lg"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {editingId ? '✏️ Edit Alert' : '+ Create New Alert'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Keywords
                </label>
                <input
                  {...register('keywords')}
                  placeholder="e.g., React, Node.js"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <input
                  {...register('location')}
                  placeholder="e.g., New York"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Min Salary
                </label>
                <input
                  {...register('minSalary')}
                  type="number"
                  placeholder="e.g., 50000"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Salary
                </label>
                <input
                  {...register('maxSalary')}
                  type="number"
                  placeholder="e.g., 150000"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Job Types
                </label>
                <input
                  {...register('jobType')}
                  placeholder="e.g., Full-time, Part-time"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Frequency
                </label>
                <select
                  {...register('frequency')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="instant">Instant</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2 mb-6">
              <input
                {...register('remote')}
                type="checkbox"
                id="remote"
                className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-600"
              />
              <label htmlFor="remote" className="text-gray-700 dark:text-gray-300">
                Remote jobs only
              </label>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
            >
              {editingId ? 'Update Alert' : 'Create Alert'}
            </motion.button>
          </motion.form>
        )}

        {alerts.length === 0 ? (
          <EmptyState
            icon="🔔"
            title="No Alerts Yet"
            description="Create job alerts to stay updated with jobs matching your preferences!"
            actionText="Create First Alert"
            action={() => setShowForm(true)}
          />
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <motion.div
                key={alert._id}
                whileHover={{ scale: 1.01 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-100 dark:border-gray-700"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {alert.keywords?.join(', ') || 'All jobs'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {alert.location ? `📍 ${alert.location}` : 'All locations'} • Frequency: {alert.frequency}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={() => handleEditAlert(alert)}
                      className="text-primary-500 hover:text-primary-700 transition"
                      title="Edit alert"
                    >
                      ✏️
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={() => handleDeleteAlert(alert._id)}
                      className="text-error-500 hover:text-error-700 transition"
                      title="Delete alert"
                    >
                      🗑️
                    </motion.button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {alert.keywords?.map((kw, i) => (
                    <Badge key={i} label={kw} variant="primary" size="sm" />
                  ))}
                  {alert.jobType?.map((jt, i) => (
                    <Badge key={i} label={jt} variant="secondary" size="sm" />
                  ))}
                  {alert.remote && <Badge label="Remote" variant="success" size="sm" />}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobAlerts;
