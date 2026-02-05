import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import apiClient from '../api/axios';
import { useToast } from '../context/ToastContext';
import JobCardEnhanced from '../components/JobCardEnhanced';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';

const RecommendedJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();

  useEffect(() => {
    fetchRecommendedJobs();
  }, []);

  const fetchRecommendedJobs = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/alerts/recommended');
      setJobs(response.data.jobs || []);
    } catch (error) {
      showError('Failed to load recommended jobs');
      console.error('Error fetching recommended jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <LoadingSkeleton count={5} type="card" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
            <Zap className="text-yellow-500" size={36} />
            Recommended for You
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Jobs tailored to your alerts and preferences
          </p>
        </motion.div>

        {jobs.length === 0 ? (
          <EmptyState
            icon="✨"
            title="No Recommendations Yet"
            description="Create job alerts to get personalized job recommendations based on your preferences."
            actionText="Create Job Alert"
            action={() => window.location.href = '/job-alerts'}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
              {jobs.map((job) => (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 100 }}
                >
                  <JobCardEnhanced
                    job={job}
                    isSaved={job.isSaved || false}
                    onSaveToggle={fetchRecommendedJobs}
                  />
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-6 text-center"
            >
              <p className="text-primary-900 dark:text-primary-100 mb-4">
                Want more recommendations? Customize your job alerts!
              </p>
              <Link
                to="/job-alerts"
                className="inline-block px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
              >
                Manage Alerts →
              </Link>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default RecommendedJobs;
