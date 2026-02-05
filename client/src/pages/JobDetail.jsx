import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiClient from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatDate, formatSalaryInLakhs } from '../utils/helpers';

const JobDetail = () => {
  const { jobId } = useParams();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await apiClient.get(`/jobs/${jobId}`);
        setJob(response.data.job);
        setHasApplied(response.data.hasApplied || false);
      } catch (error) {
        console.error('Error fetching job:', error);
        showError('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId, showError]);

  const handleApply = async () => {
    if (!user) {
      showError('Please login to apply');
      return;
    }

    if (user.role !== 'jobSeeker') {
      showError('Only job seekers can apply');
      return;
    }

    if (!coverLetter.trim()) {
      showError('Please write a cover letter');
      return;
    }

    try {
      setApplying(true);
      const formData = new FormData();
      formData.append('coverLetter', coverLetter);
      if (resumeFile) {
        formData.append('resume', resumeFile);
      }

      await apiClient.post(`/applications/${jobId}/apply`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      showSuccess('Application submitted successfully!');
      setShowApplyModal(false);
      setCoverLetter('');
      setResumeFile(null);
      setHasApplied(true);
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Job not found</p>
          <Link to="/jobs" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/jobs" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mb-6 inline-flex items-center">
          <span className="mr-2">←</span> Back to Jobs
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{job.title}</h1>
              {job.companyProfileId || job.company?.employerId ? (
                <Link 
                  to={`/company/${job.companyProfileId || job.company?.employerId || job.company?._id}`} 
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mt-2 inline-block transition"
                >
                  <p className="hover:underline font-semibold text-lg">
                    {job.companyName || job.company?.companyName || job.company?.name || 'Company'}
                  </p>
                </Link>
              ) : (
                <p className="text-gray-600 dark:text-gray-400 mt-2 font-semibold text-lg">
                  {job.companyName || job.company?.companyName || job.company?.name || 'Company'}
                </p>
              )}
            </div>
            <button
              onClick={() => setShowApplyModal(true)}
              disabled={user?.role === 'employer' || user?.role === 'admin' || hasApplied}
              className="px-6 py-3 bg-primary-600 dark:bg-primary-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
            >
              {hasApplied ? 'Applied' : user?.role === 'employer' || user?.role === 'admin' ? 'Cannot Apply' : 'Apply Now'}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Job Type</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{job.jobType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{job.location?.city}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Remote</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{job.remote ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Posted</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatDate(job.createdAt)}</p>
            </div>
          </div>

          {job.salaryRange?.min && (
            <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4 mb-8">
              <p className="text-sm text-primary-600 dark:text-primary-400">Salary Range (per year)</p>
              <p className="text-2xl font-bold text-primary-700 dark:text-primary-300">
                {formatSalaryInLakhs(job.salaryRange.min, job.salaryRange.max)}
              </p>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About the Role</h2>
            <div className="prose max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {job.description}
            </div>
          </div>

          {job.responsibilities && job.responsibilities.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Responsibilities</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                {job.responsibilities.map((resp, idx) => (
                  <li key={idx}>{resp}</li>
                ))}
              </ul>
            </div>
          )}

          {job.qualifications && job.qualifications.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Requirements</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                {job.qualifications.map((qual, idx) => (
                  <li key={idx}>{qual}</li>
                ))}
              </ul>
            </div>
          )}

          {job.tags && job.tags.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {showApplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-2xl w-full"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Apply for {job.title}</h2>
              <button
                onClick={() => {
                  setShowApplyModal(false);
                  setCoverLetter('');
                  setResumeFile(null);
                }}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleApply();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-2">Cover Letter</label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Tell us why you're interested in this position..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-2">Resume (Optional)</label>
                <input
                  type="file"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  accept=".pdf,.doc,.docx"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Accepted formats: PDF, DOC, DOCX (Max 5MB)</p>
                {resumeFile && <p className="text-sm text-green-600 dark:text-green-400 mt-1">📄 {resumeFile.name}</p>}
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowApplyModal(false);
                    setCoverLetter('');
                    setResumeFile(null);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  className="flex-1 px-4 py-3 bg-primary-600 dark:bg-primary-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition font-semibold disabled:bg-gray-400"
                >
                  {applying ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default JobDetail;
