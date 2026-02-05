import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Badge from './Badge';
import apiClient from '../api/axios';
import { formatSalaryInLakhs } from '../utils/helpers';

const JobCardEnhanced = ({ job, isSaved = false, onSaveToggle }) => {
  const [saved, setSaved] = useState(isSaved);
  const [loading, setLoading] = useState(false);

  const handleSaveJob = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (saved) {
        await apiClient.delete(`/jobs/${job._id}/unsave`);
      } else {
        await apiClient.post(`/jobs/${job._id}/save`);
      }
      setSaved(!saved);
      onSaveToggle?.();
    } catch (error) {
      console.error('Error saving job:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -8, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-xl transition border border-gray-100 dark:border-gray-700"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <Link
            to={`/job/${job._id}`}
            className="text-xl font-bold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition"
          >
            {job.title}
          </Link>
          {job.companyProfileId || job.company?.employerId ? (
            <Link 
              to={`/company/${job.companyProfileId || job.company?.employerId || job.company?._id}`}
              className="text-sm text-gray-500 dark:text-gray-400 mt-1 hover:text-primary-600 dark:hover:text-primary-400 transition inline-block"
            >
              {job.companyName || job.company?.companyName || job.company?.name || 'Company'}
            </Link>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {job.companyName || job.company?.companyName || job.company?.name || 'Company'}
            </p>
          )}
        </div>
        <motion.button
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSaveJob}
          disabled={loading}
          className="ml-4 text-2xl transition"
          title={saved ? 'Unsave job' : 'Save job'}
        >
          {saved ? '❤️' : '🤍'}
        </motion.button>
      </div>

      <p className="text-gray-600 dark:text-gray-300 line-clamp-2 mb-4 text-sm">
        {job.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        <Badge label={job.jobType} variant="primary" size="sm" />
        {job.remote && <Badge label="Remote" variant="success" size="sm" />}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div>
          <p className="text-gray-500 dark:text-gray-400">Location</p>
          <p className="font-semibold text-gray-900 dark:text-white">
            {job.location?.city || 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Salary</p>
          <p className="font-semibold text-primary-600 dark:text-primary-400">
            {job.salaryRange?.min && job.salaryRange?.max
              ? formatSalaryInLakhs(job.salaryRange.min, job.salaryRange.max)
              : 'N/A'}
          </p>
        </div>
      </div>

      <Link
        to={`/job/${job._id}`}
        className="inline-block w-full text-center px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 dark:hover:bg-primary-500 transition"
      >
        View Details →
      </Link>
    </motion.div>
  );
};

export default JobCardEnhanced;
