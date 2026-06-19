import React, { useEffect, useState } from 'react';
import apiClient from '../../api/axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '../../context/ToastContext';

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/jobs');
      setJobs(res.data.jobs || []);
    } catch (err) {
      showError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete job?')) return;
    try {
      await apiClient.delete(`/jobs/${id}`);
      showSuccess('Job removed');
      fetchJobs();
    } catch (err) {
      showError('Could not delete job');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Jobs</h2>
          <p className="text-sm text-slate-500">Manage all job postings</p>
        </div>
        <Link to="/post-job" className="px-4 py-2 bg-primary-600 text-white rounded-lg">Post Job</Link>
      </div>

      {loading ? (
        <div className="py-12 text-center">Loading...</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left bg-slate-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Applicants</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j._id} className="border-t">
                  <td className="px-4 py-3">{j.title}</td>
                  <td className="px-4 py-3">{j.companyName}</td>
                  <td className="px-4 py-3">{j.location?.city}</td>
                  <td className="px-4 py-3">{j.applicantCount || 0}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Link to={`/post-job/${j._id}`} className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700">Edit</Link>
                    <motion.button whileHover={{ scale: 1.05 }} onClick={() => handleDelete(j._id)} className="px-3 py-1 rounded-lg bg-red-50 text-red-700">Delete</motion.button>
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

export default AdminJobs;
