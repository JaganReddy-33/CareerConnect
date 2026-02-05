import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, Users, FileText, Video, TrendingUp } from 'lucide-react';
import apiClient from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const StatCard = ({ icon: Icon, label, value, bgColor, iconColor, borderColor }) => (
  <motion.div
    whileHover={{ y: -4, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
    transition={{ duration: 0.2 }}
    className={`bg-gradient-to-br ${bgColor} dark:from-gray-800 dark:to-gray-700 p-4 rounded-lg border-2 ${borderColor} dark:border-gray-600 shadow-md cursor-pointer overflow-hidden relative group`}
  >
    <div className="absolute top-0 right-0 -mr-6 -mt-6 w-16 h-16 bg-white dark:bg-gray-600 opacity-10 rounded-full group-hover:opacity-20 transition" />
    
    <div className="flex items-start justify-between relative z-10">
      <div className="flex-1">
        <p className="text-gray-700 dark:text-gray-300 text-xs font-medium mb-1">{label}</p>
        <motion.p
          key={value}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-gray-900 dark:text-white"
        >
          {value}
        </motion.p>
      </div>
      <div className={`${iconColor} dark:text-gray-300 opacity-80 group-hover:opacity-100 transition`}>
        <Icon size={24} />
      </div>
    </div>
  </motion.div>
);

const EmployerDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const { showError, showSuccess } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const jobsRes = await apiClient.get('/jobs/employer/my-jobs');
      const statsRes = await apiClient.get('/applications/stats');
      
      setJobs(jobsRes.data.jobs);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      showError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;

    try {
      await apiClient.delete(`/jobs/${jobId}`);
      showSuccess('Job deleted successfully');
      fetchData();
    } catch (error) {
      showError('Failed to delete job');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employer Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">Manage your jobs and applicants</p>
          </div>
          <Link
            to="/post-job"
            className="px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition font-semibold text-sm"
          >
            + Post New Job
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
          <StatCard
            icon={Briefcase}
            label="Active Jobs"
            value={jobs.length}
            bgColor="from-blue-50 to-blue-100"
            iconColor="text-blue-600"
            borderColor="border-blue-200"
          />

          <StatCard
            icon={Users}
            label="Total Applications"
            value={stats?.stats?.reduce((sum, s) => sum + s.count, 0) || 0}
            bgColor="from-purple-50 to-purple-100"
            iconColor="text-purple-600"
            borderColor="border-purple-200"
          />

          <StatCard
            icon={FileText}
            label="New Applications"
            value={stats?.stats?.find((s) => s._id === 'Applied')?.count || 0}
            bgColor="from-green-50 to-green-100"
            iconColor="text-green-600"
            borderColor="border-green-200"
          />

          <StatCard
            icon={Video}
            label="Interviews"
            value={stats?.stats?.find((s) => s._id === 'Interview')?.count || 0}
            bgColor="from-orange-50 to-orange-100"
            iconColor="text-orange-600"
            borderColor="border-orange-200"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-6 md:p-8 border-b-2 border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Your Job Listings</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm md:text-base">{jobs.length} active position{jobs.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-primary-600 dark:text-primary-400">{jobs.length}</div>
            </div>
          </div>

          {loading ? (
            <div className="p-8 md:p-12 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="inline-block rounded-full h-10 w-10 border-4 border-gray-300 dark:border-gray-600 border-t-primary-600 dark:border-t-primary-500"
              />
              <p className="text-gray-600 dark:text-gray-400 mt-4">Loading your jobs...</p>
            </div>
          ) : jobs.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {jobs.map((job, index) => (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ backgroundColor: '#f9fafb' }}
                  className="p-4 md:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">{job.title}</h3>
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold rounded-full">Active</span>
                      </div>
                      {job.companyProfileId && job.companyName && (
                        <Link 
                          to={`/company/${job.companyProfileId}`}
                          className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 font-semibold mb-2 inline-block transition"
                        >
                          🏢 {job.companyName}
                        </Link>
                      )}
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        📍 {job.location?.city} • 💼 {job.jobType}
                      </p>
                      <div className="flex gap-4 flex-wrap">
                        <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                          <Users size={14} className="mr-1" />
                          <span className="font-semibold">{job.applicantCount || 0}</span> applicants
                        </div>
                        <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                          <TrendingUp size={14} className="mr-1" />
                          <span className="font-semibold">{job.views || 0}</span> views
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Link
                        to={`/job/${job._id}/applicants`}
                        className="px-3 md:px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition text-xs md:text-sm font-semibold whitespace-nowrap"
                      >
                        👥 View Applicants
                      </Link>
                      <Link
                        to={`/post-job/${job._id}`}
                        className="px-3 md:px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition text-xs md:text-sm font-semibold whitespace-nowrap"
                      >
                        ✏️ Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteJob(job._id)}
                        className="px-3 md:px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition text-xs md:text-sm font-semibold whitespace-nowrap"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-8 md:p-12 text-center">
              <div className="mb-4 text-5xl md:text-6xl">📋</div>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-base md:text-lg">You haven&apos;t posted any jobs yet</p>
              <Link
                to="/post-job"
                className="inline-block px-6 md:px-8 py-2 md:py-3 bg-primary-600 dark:bg-primary-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition font-semibold shadow-md hover:shadow-lg text-sm md:text-base"
              >
                ➕ Post Your First Job
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default EmployerDashboard;
