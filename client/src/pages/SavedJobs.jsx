import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import apiClient from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import JobCardEnhanced from '../components/JobCardEnhanced';

const SavedJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    if (user?.role !== 'jobSeeker') {
      showError('Only job seekers can access saved jobs');
      return;
    }
    fetchSavedJobs();
  }, [page]);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/jobs/saved', { params: { page, limit: 10 } });
      setJobs(response.data.jobs);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      showError('Failed to load saved jobs');
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
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Saved Jobs</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Jobs you've bookmarked for later review
          </p>
        </motion.div>

        {jobs.length === 0 ? (
          <EmptyState
            icon="🔖"
            title="No Saved Jobs Yet"
            description="Start saving jobs to revisit them later. Explore our job listings and save your favorites!"
            actionText="Browse Jobs"
            action={() => window.location.href = '/jobs'}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
              {jobs.map((job) => (
                <JobCardEnhanced
                  key={job._id}
                  job={job}
                  isSaved={true}
                  onSaveToggle={fetchSavedJobs}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <motion.div className="flex justify-center space-x-4 mt-12">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-700 transition"
                >
                  ← Previous
                </button>
                <span className="px-4 py-2 text-gray-600 dark:text-gray-300">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-700 transition"
                >
                  Next →
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SavedJobs;
