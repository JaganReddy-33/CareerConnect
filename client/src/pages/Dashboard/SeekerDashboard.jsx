import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Eye, Phone, Gift, XCircle, TrendingUp } from 'lucide-react';
import io from 'socket.io-client';
import apiClient from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/helpers';
import { Link } from "react-router-dom";

const STATUS_CONFIG = {
  Applied: { bg: 'from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20', border: 'border-blue-300 dark:border-blue-600', badge: 'bg-blue-600 dark:bg-blue-500 text-white', icon: <Clock size={16} />, color: 'blue', gradient: 'from-blue-600 to-blue-700' },
  Reviewed: { bg: 'from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/20', border: 'border-yellow-300 dark:border-yellow-600', badge: 'bg-yellow-600 dark:bg-yellow-500 text-white', icon: <Eye size={16} />, color: 'yellow', gradient: 'from-yellow-600 to-yellow-700' },
  Interview: { bg: 'from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20', border: 'border-purple-300 dark:border-purple-600', badge: 'bg-purple-600 dark:bg-purple-500 text-white', icon: <Phone size={16} />, color: 'purple', gradient: 'from-purple-600 to-purple-700' },
  Offer: { bg: 'from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20', border: 'border-green-300 dark:border-green-600', badge: 'bg-green-600 dark:bg-green-500 text-white', icon: <Gift size={16} />, color: 'green', gradient: 'from-green-600 to-green-700' },
  Rejected: { bg: 'from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20', border: 'border-red-300 dark:border-red-600', badge: 'bg-red-600 dark:bg-red-500 text-white', icon: <XCircle size={16} />, color: 'red', gradient: 'from-red-600 to-red-700' },
};

const SeekerDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const { showError, showSuccess } = useToast();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user?._id) return;

    socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      query: { userId: user._id },
    });

    socketRef.current.on('applicationStatusUpdate', (data) => {
      setApplications((prev) =>
        prev.map((app) => {
          if (app._id === data.applicationId) {
            showSuccess(`Status updated to ${data.status}! 🎉`);
            return { ...app, status: data.status };
          }
          return app;
        })
      );
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user, showSuccess]);

  useEffect(() => {
    fetchApplications();
  }, [activeTab]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = activeTab !== 'all' ? { status: activeTab } : {};
      const response = await apiClient.get('/applications', { params });
      setApplications(response.data.applications);
    } catch (error) {
      console.error('Error fetching applications:', error);
      showError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const statuses = ['all', 'Applied', 'Reviewed', 'Interview', 'Offer', 'Rejected'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Applications</h1>
          <p className="text-gray-600 dark:text-gray-400 text-base flex items-center gap-2">
            <TrendingUp size={18} /> Track your job applications and progress
          </p>
        </motion.div>

        <div className="mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex gap-2 min-w-max">
            {statuses.map((status, idx) => {
              const count = status === 'all' ? applications.length : applications.filter((a) => a.status === status).length;
              const isActive = activeTab === status;

              return (
                <motion.button
                  key={status}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(status)}
                  className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition cursor-pointer border-2 whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? status === 'all' 
                        ? 'bg-blue-600 dark:bg-blue-500 text-white border-blue-600 dark:border-blue-500 ring-2 ring-offset-2 dark:ring-offset-gray-800'
                        : `${STATUS_CONFIG[status].badge} border-opacity-100 ring-2 ring-offset-2 dark:ring-offset-gray-800`
                      : status === 'all'
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600'
                        : `${STATUS_CONFIG[status].bg} ${STATUS_CONFIG[status].border} text-gray-800 dark:text-gray-200`
                  }`}
                >
                  <span className="text-sm">{status === 'all' ? '📊' : STATUS_CONFIG[status].icon}</span>
                  <span className="capitalize">{status === 'all' ? 'All' : status}</span>
                  <span className={`font-bold ${isActive ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}>{count}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full" />
            </motion.div>
          ) : applications.length > 0 ? (
            <AnimatePresence>
              {(activeTab === 'all' ? applications : applications.filter((a) => a.status === activeTab)).map((app, idx) => (
                <motion.div
                  key={app._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.01, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                  className={`bg-gradient-to-r ${STATUS_CONFIG[app.status].bg} border-2 ${STATUS_CONFIG[app.status].border} rounded-lg p-4 shadow-md transition cursor-pointer hover:shadow-lg`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{app.job?.title}</h3>
                      {app.job?.companyProfileId || app.job?.company?.employerId ? (
                        <Link 
                          to={`/company/${app.job?.companyProfileId || app.job?.company?.employerId || app.job?.company?._id}`}
                          className="text-gray-700 hover:text-primary-600 font-semibold text-sm mt-1 inline-block"
                        >
                          🏢 {app.job?.companyName || app.job?.company?.companyName || app.job?.company?.name || 'Company'}
                        </Link>
                      ) : (
                        <p className="text-gray-700 font-semibold text-sm mt-1">🏢 {app.job?.companyName || app.job?.company?.companyName || app.job?.company?.name || 'Company'}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <p className="text-gray-600 text-xs">📍 {app.job?.location?.city || 'Location N/A'}</p>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${app.job?.remote ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'}`}>
                          {app.job?.remote ? '✓ Remote' : '🏢 On-site'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right ml-2">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full font-bold text-xs ${STATUS_CONFIG[app.status].badge}`}
                      >
                        {STATUS_CONFIG[app.status].icon}
                        <span className="hidden sm:inline">{app.status}</span>
                      </motion.div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-2 bg-white bg-opacity-60 rounded-lg mb-2">
                    <div>
                      <p className="text-xs text-gray-600 font-semibold">Applied</p>
                      <p className="text-xs font-bold text-gray-900">{formatDate(app.appliedAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-semibold">Days</p>
                      <p className="text-xs font-bold text-gray-900">
                        {Math.floor((new Date() - new Date(app.appliedAt)) / (1000 * 60 * 60 * 24))}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-semibold">Type</p>
                      <p className="text-xs font-bold text-gray-900">{app.job?.jobType || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-semibold">Salary</p>
                      <p className="text-xs font-bold text-gray-900">
                        {app.job?.salaryRange?.min && app.job?.salaryRange?.max 
                          ? `₹${(app.job?.salaryRange?.min / 100000).toFixed(1)}L` 
                          : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {app.coverLetter && (
                    <div className="p-2 bg-white bg-opacity-70 rounded-lg mb-2 border-l-4 border-blue-500">
                      <p className="text-xs text-gray-600 font-semibold mb-1">Cover Letter</p>
                      <p className="text-xs text-gray-700 line-clamp-1">{app.coverLetter}</p>
                    </div>
                  )}

                  <div className="pt-2 border-t border-white border-opacity-40 flex items-center justify-between">
                    <div className="flex gap-2">
                      {app.status === 'Interview' && (
                        <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-lg">
                          📞
                        </motion.span>
                      )}
                      {app.status === 'Offer' && (
                        <motion.span animate={{ y: [0, -5, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-lg">
                          🎉
                        </motion.span>
                      )}
                    </div>

                    <Link to={`/job/${app.job?._id}`}>
                      <motion.div
                        whileHover={{ x: 5 }}
                        className="text-xs font-semibold text-gray-700 cursor-pointer"
                      >
                        View Details →
                      </motion.div>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-gray-600 dark:text-gray-400 text-base font-semibold">No applications yet</p>
              <p className="text-gray-500 dark:text-gray-500 mt-2 text-sm">Start applying to jobs to see them here</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeekerDashboard;
