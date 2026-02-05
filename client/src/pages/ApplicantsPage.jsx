import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MessageSquare, Calendar, X, Send, FileText } from 'lucide-react';
import io from 'socket.io-client';
import apiClient from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils/helpers';

const STATUS_CONFIG = {
  Applied: { bg: 'from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20', border: 'border-blue-300 dark:border-blue-600', badge: 'bg-blue-600 dark:bg-blue-500 text-white', icon: '📝', color: 'blue' },
  Reviewed: { bg: 'from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/20', border: 'border-yellow-300 dark:border-yellow-600', badge: 'bg-yellow-600 dark:bg-yellow-500 text-white', icon: '👀', color: 'yellow' },
  Interview: { bg: 'from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20', border: 'border-purple-300 dark:border-purple-600', badge: 'bg-purple-600 dark:bg-purple-500 text-white', icon: '📞', color: 'purple' },
  Offer: { bg: 'from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20', border: 'border-green-300 dark:border-green-600', badge: 'bg-green-600 dark:bg-green-500 text-white', icon: '🎉', color: 'green' },
  Rejected: { bg: 'from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20', border: 'border-red-300 dark:border-red-600', badge: 'bg-red-600 dark:bg-red-500 text-white', icon: '❌', color: 'red' },
};

const ApplicantsPage = () => {
  const { jobId } = useParams();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [rating, setRating] = useState(0);
  const [interviewDate, setInterviewDate] = useState('');
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
            showSuccess(`Application status updated to ${data.status}!`);
            return { ...app, status: data.status };
          }
          return app;
        })
      );
      // Update selected app if it's the one being updated
      if (selectedApp && selectedApp._id === data.applicationId) {
        setSelectedApp(prev => ({ ...prev, status: data.status }));
      }
    });

    socketRef.current.on('applicationNoteAdded', (data) => {
      setApplications((prev) =>
        prev.map((app) => {
          if (app._id === data.applicationId) {
            return { ...app, notes: data.notes };
          }
          return app;
        })
      );
      // Update selected app if it's the one being updated
      if (selectedApp && selectedApp._id === data.applicationId) {
        setSelectedApp(prev => ({ ...prev, notes: data.notes }));
      }
    });

    socketRef.current.on('newApplication', (data) => {
      if (data.jobId === jobId) {
        showSuccess('New application received!');
        fetchData(); // Refresh to get full applicant details
      }
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [jobId, showError]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const jobRes = await apiClient.get(`/jobs/${jobId}`);
      setJob(jobRes.data.job);

      const appRes = await apiClient.get(`/applications/${jobId}/applicants`);
      setApplications(appRes.data.applications);
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to load applicants');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      await apiClient.put(`/applications/${applicationId}/status`, { status: newStatus });
      showSuccess(`Status updated to ${newStatus}`);
      setApplications((prev) =>
        prev.map((app) =>
          app._id === applicationId ? { ...app, status: newStatus } : app
        )
      );
    } catch (error) {
      showError('Failed to update status');
    }
  };

  const handleAddNote = async (applicationId) => {
    if (!newNote.trim()) {
      showError('Please enter a note');
      return;
    }

    try {
      const response = await apiClient.post(`/applications/${applicationId}/note`, { text: newNote });
      showSuccess('Note added successfully');
      setApplications((prev) =>
        prev.map((app) =>
          app._id === applicationId ? { ...app, notes: response.data.application.notes } : app
        )
      );
      setNewNote('');
    } catch (error) {
      showError('Failed to add note');
    }
  };

  const filteredApps = filter === 'all' ? applications : applications.filter((app) => app.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-12 h-12 border-4 border-blue-400 border-t-blue-600 rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/dashboard" className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6 font-semibold group">
          <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition" /> Back to Dashboard
        </Link>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 mb-8 border-l-4 border-blue-600 dark:border-blue-500">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{job?.title}</h1>
              {job?.companyProfileId || job?.company?.employerId ? (
                <Link 
                  to={`/company/${job?.companyProfileId || job?.company?.employerId || job?.company?._id}`}
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mt-2 inline-block transition"
                >
                  🏢 {job?.companyName || job?.company?.companyName || job?.company?.name || 'Company'}
                </Link>
              ) : (
                <p className="text-gray-600 dark:text-gray-400 mt-2">🏢 {job?.companyName || job?.company?.companyName || job?.company?.name || 'Company'}</p>
              )}
              <div className="flex flex-wrap gap-3 mt-4">
                <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-semibold text-xs md:text-sm">
                  📍 {job?.location?.city || 'Remote'}
                </span>
                <span className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full font-semibold text-xs md:text-sm">
                  👥 {applications.length} Applicant{applications.length !== 1 ? 's' : ''}
                </span>
                <span className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full font-semibold text-xs md:text-sm flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Live Updates
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex gap-2 min-w-max">
            {['all', 'Applied', 'Reviewed', 'Interview', 'Offer', 'Rejected'].map((status) => {
              const count = status === 'all' ? applications.length : applications.filter((a) => a.status === status).length;
              const config = status === 'all' ? { badge: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200', icon: '📊' } : STATUS_CONFIG[status];

              return (
                <motion.button
                  key={status}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilter(status)}
                  className={`px-3 py-2 rounded-lg font-semibold text-xs transition cursor-pointer border-2 whitespace-nowrap flex items-center gap-1.5 ${
                    filter === status
                      ? `${status === 'all' ? 'bg-blue-600 dark:bg-blue-500 text-white' : config.badge} border-opacity-100 ring-2 ring-offset-2 dark:ring-offset-gray-800`
                      : `${status === 'all' ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600' : config.badge + ' ' + config.border} hover:shadow-md`
                  }`}
                >
                  <span className="text-sm">{config.icon}</span>
                  <span className="capitalize">{status === 'all' ? 'All' : status}</span>
                  <span className={`font-bold ${filter === status ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}>{count}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {filteredApps.length > 0 ? (
              filteredApps.map((app, idx) => (
                <motion.div
                  key={app._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.01, boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}
                  className={`bg-gradient-to-r ${STATUS_CONFIG[app.status].bg} dark:from-gray-800 dark:to-gray-700 border-2 ${STATUS_CONFIG[app.status].border} dark:border-gray-600 rounded-lg p-4 md:p-6 shadow-md hover:shadow-lg transition cursor-pointer`}
                  onClick={() => {
                    setSelectedApp(app);
                    setShowDetailModal(true);
                  }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start gap-3">
                      {app.applicant?.profileImage ? (
                        <img
                          src={app.applicant.profileImage}
                          alt={app.applicant?.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-primary-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                          {app.applicant?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white truncate">{app.applicant?.name}</h3>
                        <a href={`mailto:${app.applicant?.email}`} className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 text-xs md:text-sm mt-1 block truncate">📧 {app.applicant?.email}</a>
                        {app.applicant?.phone && <a href={`tel:${app.applicant?.phone}`} className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 text-xs md:text-sm block">📱 {app.applicant?.phone}</a>}
                      </div>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full font-bold text-xs md:text-sm ${STATUS_CONFIG[app.status].badge} dark:bg-opacity-80 flex items-center gap-1.5 flex-shrink-0`}>
                      <span className="text-base md:text-lg">{STATUS_CONFIG[app.status].icon}</span>
                      <span className="hidden sm:inline">{app.status}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-3 md:mb-4">
                    <div className="bg-white dark:bg-gray-800 bg-opacity-60 dark:bg-opacity-80 p-2 md:p-3 rounded-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Applied</p>
                      <p className="text-xs md:text-sm font-bold text-gray-900 dark:text-white">{formatDate(app.appliedAt)}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 bg-opacity-60 dark:bg-opacity-80 p-2 md:p-3 rounded-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Rating</p>
                      <div className="flex gap-0.5 md:gap-1 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={`text-xs md:text-sm ${i < (app.rating || 0) ? '⭐' : '☆'}`}>
                            {i < (app.rating || 0) ? '⭐' : '☆'}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 bg-opacity-60 dark:bg-opacity-80 p-2 md:p-3 rounded-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Interviews</p>
                      <p className="text-xs md:text-sm font-bold text-gray-900 dark:text-white">{app.interviews?.length || 0}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 bg-opacity-60 dark:bg-opacity-80 p-2 md:p-3 rounded-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Notes</p>
                      <p className="text-xs md:text-sm font-bold text-gray-900 dark:text-white">{app.notes?.length || 0}</p>
                    </div>
                  </div>

                  {app.coverLetter && (
                    <div className="bg-white dark:bg-gray-800 bg-opacity-70 dark:bg-opacity-80 p-2 md:p-3 rounded-lg mb-2 md:mb-3">
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-1">Cover Letter</p>
                      <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{app.coverLetter}</p>
                    </div>
                  )}

                  {app.resume && (
                    <div className="bg-white dark:bg-gray-800 bg-opacity-70 dark:bg-opacity-80 p-2 md:p-3 rounded-lg mb-2 md:mb-3">
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-2">📄 Resume</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">{app.resume.fileName}</p>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              const response = await apiClient.get(`/users/${app.applicant?._id}/resume/download`, {
                                responseType: 'blob',
                              });
                              const url = window.URL.createObjectURL(new Blob([response.data]));
                              const link = document.createElement('a');
                              link.href = url;
                              link.setAttribute('download', app.resume.fileName || 'resume.pdf');
                              document.body.appendChild(link);
                              link.click();
                              link.remove();
                              window.URL.revokeObjectURL(url);
                              showSuccess('Resume downloaded successfully');
                            } catch (error) {
                              console.error('Resume download error:', error);
                              showError(error.response?.data?.message || 'Failed to download resume. Please try again.');
                            }
                          }}
                          className="px-2 md:px-3 py-1 bg-primary-600 dark:bg-primary-500 text-white rounded hover:bg-primary-700 dark:hover:bg-primary-600 transition text-xs font-semibold flex items-center gap-1 flex-shrink-0"
                        >
                          <FileText size={12} /> <span className="hidden sm:inline">Download</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-white dark:border-gray-600 border-opacity-40">
                    <select
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        handleStatusUpdate(app._id, e.target.value);
                      }}
                      value={app.status}
                      className="px-2 md:px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg font-semibold text-xs md:text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-900 dark:text-white"
                    >
                      <option value="Applied">📝 Applied</option>
                      <option value="Reviewed">👀 Reviewed</option>
                      <option value="Interview">📞 Interview</option>
                      <option value="Offer">🎉 Offer</option>
                      <option value="Rejected">❌ Rejected</option>
                    </select>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedApp(app);
                        setShowDetailModal(true);
                      }}
                      className="px-3 md:px-4 py-1.5 md:py-2 bg-white dark:bg-gray-800 font-semibold text-xs md:text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-900 dark:text-white"
                    >
                      View Details →
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-gray-800 rounded-xl p-8 md:p-12 text-center shadow-lg">
                <div className="text-5xl md:text-6xl mb-4">📭</div>
                <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg">No applicants found</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Applications will appear here in real-time</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showDetailModal && selectedApp && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-start gap-4">
                  {selectedApp.applicant?.profileImage ? (
                    <img
                      src={selectedApp.applicant.profileImage}
                      alt={selectedApp.applicant?.name}
                      className="w-16 h-16 rounded-full object-cover border-3 border-primary-200 dark:border-primary-800"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                      {selectedApp.applicant?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{selectedApp.applicant?.name}</h2>
                    <a href={`mailto:${selectedApp.applicant?.email}`} className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mt-2 block text-sm md:text-base">📧 {selectedApp.applicant?.email}</a>
                    {selectedApp.applicant?.phone && <a href={`tel:${selectedApp.applicant?.phone}`} className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mt-1 block text-sm md:text-base">📱 {selectedApp.applicant?.phone}</a>}
                    <Link to={`/profile/seeker/${selectedApp.applicant?._id}`} className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mt-2 inline-flex items-center gap-1 text-xs md:text-sm font-medium">
                      View Full Profile →
                    </Link>
                  </div>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="text-2xl text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                  <X />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6 p-3 md:p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
                <div>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Status</p>
                  <span className={`inline-block mt-2 px-2 md:px-3 py-1 rounded-full font-bold text-xs md:text-sm ${STATUS_CONFIG[selectedApp.status].badge} dark:bg-opacity-80`}>
                    {STATUS_CONFIG[selectedApp.status].icon} {selectedApp.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Applied Date</p>
                  <p className="font-bold text-gray-900 dark:text-white mt-1 text-sm md:text-base">{formatDate(selectedApp.appliedAt)}</p>
                </div>
              </div>

              {selectedApp.coverLetter && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border-l-4 border-blue-500 dark:border-blue-400">
                  <p className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">Cover Letter</p>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm">{selectedApp.coverLetter}</p>
                </div>
              )}

              {selectedApp.resume && (
                <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border-l-4 border-orange-500 dark:border-orange-400">
                  <p className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <FileText size={18} className="text-orange-600 dark:text-orange-400" /> Resume
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium truncate flex-1">📄 {selectedApp.resume.fileName}</span>
                    <button
                      onClick={async () => {
                        try {
                          const response = await apiClient.get(`/users/${selectedApp.applicant?._id}/resume/download`, {
                            responseType: 'blob',
                          });
                          const url = window.URL.createObjectURL(new Blob([response.data]));
                          const link = document.createElement('a');
                          link.href = url;
                          link.setAttribute('download', selectedApp.resume.fileName || 'resume.pdf');
                          document.body.appendChild(link);
                          link.click();
                          link.remove();
                          window.URL.revokeObjectURL(url);
                          showSuccess('Resume downloaded successfully');
                        } catch (error) {
                          console.error('Resume download error:', error);
                          showError(error.response?.data?.message || 'Failed to download resume. Please try again.');
                        }
                      }}
                      className="px-3 py-1.5 bg-orange-600 dark:bg-orange-500 text-white rounded hover:bg-orange-700 dark:hover:bg-orange-600 transition text-xs font-semibold flex items-center gap-1"
                    >
                      <FileText size={14} /> Download
                    </button>
                  </div>
                </div>
              )}

              <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border-l-4 border-yellow-500 dark:border-yellow-400">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 block mb-3">Rating</label>
                <div className="flex gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setRating(i + 1)}
                      className="text-2xl md:text-3xl hover:scale-125 transition cursor-pointer"
                    >
                      {i < rating ? '⭐' : '☆'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border-l-4 border-purple-500 dark:border-purple-400">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-3">
                  <Calendar size={18} /> Schedule Interview
                </label>
                <input type="datetime-local" value={interviewDate} onChange={(e) => setInterviewDate(e.target.value)} className="w-full px-3 md:px-4 py-2 border-2 border-purple-300 dark:border-purple-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 dark:bg-gray-700 dark:text-white" />
              </div>

              <div className="mb-6">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-3">
                  <MessageSquare size={18} /> Add Note
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add internal note..."
                    className="flex-1 px-3 md:px-4 py-2 md:py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddNote(selectedApp._id);
                      }
                    }}
                  />
                  <button onClick={() => handleAddNote(selectedApp._id)} className="px-3 md:px-4 py-2 md:py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition font-semibold flex items-center gap-2">
                    <Send size={14} /> <span className="hidden sm:inline">Send</span>
                  </button>
                </div>
              </div>

              {selectedApp.notes && selectedApp.notes.length > 0 && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border-l-4 border-green-500 dark:border-green-400">
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Notes ({selectedApp.notes.length})</p>
                  <div className="space-y-3">
                    {selectedApp.notes.map((note, idx) => (
                      <div key={idx} className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-semibold text-gray-900 dark:text-white text-xs md:text-sm">{note.by?.name}</p>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(note.createdAt)}</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-xs md:text-sm">{note.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 md:gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleStatusUpdate(selectedApp._id, 'Interview')}
                  className="flex-1 px-3 md:px-4 py-2 md:py-3 bg-purple-600 dark:bg-purple-500 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition font-semibold flex items-center justify-center gap-2 text-sm"
                >
                  <Calendar size={16} /> <span className="hidden sm:inline">Schedule</span> Interview
                </button>
                <button
                  onClick={() => handleStatusUpdate(selectedApp._id, 'Offer')}
                  className="flex-1 px-3 md:px-4 py-2 md:py-3 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition font-semibold text-sm"
                >
                  🎉 Send Offer
                </button>
                <button
                  onClick={() => {
                    handleStatusUpdate(selectedApp._id, 'Rejected');
                    setShowDetailModal(false);
                  }}
                  className="flex-1 px-3 md:px-4 py-2 md:py-3 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition font-semibold text-sm"
                >
                  ❌ Reject
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ApplicantsPage;
