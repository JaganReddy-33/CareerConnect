import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Filters from '../components/Filters';
import JobCard from '../components/JobCard';
import apiClient from '../api/axios';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchJobs();
  }, [search, filters, page, showError]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        search,
      };

      if (filters.jobType?.length > 0) {
        params.jobType = filters.jobType[0];
      }
      if (filters.remote) {
        params.remote = 'true';
      }
      if (filters.minSalary) {
        params.minSalary = filters.minSalary;
      }
      if (filters.maxSalary) {
        params.maxSalary = filters.maxSalary;
      }

      const response = await apiClient.get('/jobs', { params });
      setJobs(response.data.jobs);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      showError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJob = async (jobId, isSaved) => {
    try {
      if (isSaved) {
        await apiClient.post('/users/unsave-job', { jobId });
        showSuccess('Job unsaved');
      } else {
        await apiClient.post('/users/save-job', { jobId });
        showSuccess('Job saved successfully');
      }
    } catch (error) {
      showError(isSaved ? 'Failed to unsave job' : 'Failed to save job');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    try {
      await apiClient.delete(`/jobs/${jobId}`);
      showSuccess('Job deleted successfully');
      fetchJobs();
    } catch (error) {
      showError('Failed to delete job');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          <AnimatePresence>
            {showFilters && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowFilters(false)}
                  className="md:hidden fixed inset-0 bg-black/50 z-30"
                />
                <motion.div
                  initial={{ opacity: 0, y: 600 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 600 }}
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                  className="md:hidden fixed bottom-0 left-0 right-0 w-full bg-white dark:bg-gray-800 rounded-t-2xl z-40 shadow-xl max-h-[85vh] overflow-y-auto"
                >
                  <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between rounded-t-2xl">
                    <div className="flex-1">
                      <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto"></div>
                    </div>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  <div className="p-4">
                    <Filters 
                      onFilter={(newFilters) => {
                        setFilters(newFilters);
                        setPage(1);
                        setShowFilters(false);
                      }}
                      onSearch={setSearch}
                    />
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <div className="hidden md:block md:col-span-1">
            <Filters 
              onFilter={(newFilters) => {
                setFilters(newFilters);
                setPage(1);
              }}
              onSearch={setSearch}
            />
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <div className="md:hidden mb-4">
              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-2 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition font-medium text-xs w-full justify-center"
              >
                <Menu size={18} /> Filter
              </button>
            </div>
            {loading ? (
              <div className="text-center py-12 sm:py-16 md:py-20">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="inline-block rounded-full h-12 w-12 border-4 border-gray-200 border-t-primary-600"
                />
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading jobs...</p>
              </div>
            ) : jobs.length > 0 ? (
              <>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Showing {jobs.length} jobs on page {page} of {totalPages}
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6"
                >
                  {jobs.map((job, index) => (
                    <motion.div
                      key={job._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <JobCard
                        job={job}
                        onSave={handleSaveJob}
                        user={user}
                        onEdit={(jobId) => window.location.href = `/post-job/${jobId}`}
                        onDelete={handleDeleteJob}
                      />
                    </motion.div>
                  ))}
                </motion.div>

                {totalPages > 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mt-8 sm:mt-10 md:mt-12 py-6 sm:py-8"
                  >
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
                    >
                      <ChevronLeft size={18} /> Previous
                    </button>

                    <div className="flex flex-wrap gap-1 sm:gap-2 justify-center">
                      {totalPages <= 5 ? (
                        Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                          <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`px-2 sm:px-3 py-2 rounded-lg transition text-sm sm:text-base ${
                              page === p
                                ? 'bg-primary-600 text-white'
                                : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            {p}
                          </button>
                        ))
                      ) : (
                        <>
                          <button
                            onClick={() => setPage(1)}
                            className={`px-2 sm:px-3 py-2 rounded-lg transition text-sm sm:text-base ${
                              page === 1
                                ? 'bg-primary-600 text-white'
                                : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            1
                          </button>
                          {page > 3 && <span className="px-2 py-2 text-gray-500">...</span>}
                          {page !== 1 && page !== totalPages && (
                            <button
                              onClick={() => setPage(page)}
                              className="px-2 sm:px-3 py-2 bg-primary-600 text-white rounded-lg text-sm sm:text-base"
                            >
                              {page}
                            </button>
                          )}
                          {page < totalPages - 2 && <span className="px-2 py-2 text-gray-500">...</span>}
                          <button
                            onClick={() => setPage(totalPages)}
                            className={`px-2 sm:px-3 py-2 rounded-lg transition text-sm sm:text-base ${
                              page === totalPages
                                ? 'bg-primary-600 text-white'
                                : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
                    >
                      Next <ChevronRight size={18} />
                    </button>
                  </motion.div>
                )}
              </>
            ) : (
              <div className="text-center py-12 sm:py-16 md:py-20">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-gray-600 dark:text-gray-400 text-lg">No jobs found.</p>
                <p className="text-gray-500 dark:text-gray-500 mt-2">Try adjusting your search or filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Jobs;
