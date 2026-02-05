import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Globe, Linkedin, Twitter, Facebook, Star, ArrowLeft } from 'lucide-react';
import apiClient from '../api/axios';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import LoadingSkeleton from '../components/LoadingSkeleton';
import CompanyReviews from '../components/CompanyReviews';

const CompanyProfileView = () => {
  const { employerId } = useParams();
  const { showError, showSuccess } = useToast();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileAndJobs();
  }, [employerId, showError]);

  const fetchProfileAndJobs = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/companies/${employerId}`);
      setProfile(response.data.profile);
      setJobs(response.data.jobs || []);

      const reviewsResponse = await apiClient.get(`/companies/${response.data.profile._id}/reviews`);
      setReviews(reviewsResponse.data.reviews || []);
    } catch (error) {
      showError('Failed to load company profile');
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <LoadingSkeleton count={5} type="card" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300 text-lg">Company not found</p>
          <Link to="/jobs" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  const rating = profile.ratings || 0;
  const ratingPercentage = (rating / 5) * 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="-1" className="text-primary-600 hover:text-primary-700 mb-6 inline-flex items-center gap-2">
          <ArrowLeft size={20} /> Back
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="h-40 bg-gradient-to-r from-primary-600 to-primary-800" style={{ backgroundImage: profile.banner ? `url(${profile.banner})` : 'none', backgroundSize: 'cover' }} />

          <div className="px-8 py-8 relative">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/3">
                <div className="-mt-24 mb-6">
                  <div className="w-32 h-32 rounded-lg bg-white dark:bg-gray-700 p-2 shadow-lg inline-block">
                    {profile.logo ? (
                      <img src={profile.logo} alt={profile.companyName} className="w-full h-full object-cover rounded" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-4xl font-bold rounded">
                        {profile.companyName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {profile.location && (profile.location.city || profile.location.country) && (
                    <div className="flex items-start gap-3">
                      <MapPin className="text-primary-600 dark:text-primary-400 mt-1 flex-shrink-0" size={20} />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {[profile.location.city, profile.location.country, profile.location.headquarters].filter(Boolean).join(', ') || 'Not specified'}
                        </p>
                      </div>
                    </div>
                  )}

                  {profile.website && (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 hover:text-primary-600 transition">
                      <Globe className="text-primary-600 mt-1 flex-shrink-0" size={20} />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Website</p>
                        <p className="font-medium text-primary-600 hover:underline break-all">{profile.website}</p>
                      </div>
                    </a>
                  )}

                  {profile.foundedYear && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Founded</p>
                      <p className="font-medium text-gray-900 dark:text-white">{profile.foundedYear}</p>
                    </div>
                  )}

                  {profile.companySize && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Company Size</p>
                      <p className="font-medium text-gray-900 dark:text-white">{profile.companySize} employees</p>
                    </div>
                  )}

                  {profile.industry && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Industry</p>
                      <p className="font-medium text-gray-900 dark:text-white">{profile.industry}</p>
                    </div>
                  )}

                  {profile.socialLinks && (profile.socialLinks.linkedin || profile.socialLinks.twitter || profile.socialLinks.facebook) && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">Follow Us</p>
                      <div className="flex gap-3">
                        {profile.socialLinks.linkedin && (
                          <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition">
                            <Linkedin size={24} />
                          </a>
                        )}
                        {profile.socialLinks.twitter && (
                          <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition">
                            <Twitter size={24} />
                          </a>
                        )}
                        {profile.socialLinks.facebook && (
                          <a href={profile.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition">
                            <Facebook size={24} />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="md:w-2/3">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{profile.companyName}</h1>
                  {profile.isVerified && <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">✓ Verified</span>}
                </div>

                {profile.description && (
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">About</h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{profile.description}</p>
                  </div>
                )}

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Company Rating</h3>
                    <div className="flex items-center gap-2">
                      <div className="text-3xl font-bold text-primary-600">{rating.toFixed(1)}</div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} size={20} className={star <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${ratingPercentage}%` }} />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Based on {reviews.length} reviews</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6">Active Jobs ({jobs.length})</h2>
              {jobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {jobs.map((job) => (
                    <Link 
                      key={job._id} 
                      to={`/job/${job._id}`} 
                      className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-600 dark:hover:border-primary-500 hover:shadow-md transition bg-gray-50 dark:bg-gray-700/30"
                    >
                      <h3 className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 text-base md:text-lg">{job.title}</h3>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded">{job.jobType}</span>
                        {job.location?.city && (
                          <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">📍 {job.location.city}</span>
                        )}
                      </div>
                      {job.salaryRange?.min && (
                        <p className="text-sm md:text-base text-primary-600 dark:text-primary-400 font-semibold mt-2">
                          ₹{(job.salaryRange.min / 100000).toFixed(1)}L - ₹{(job.salaryRange.max / 100000).toFixed(1)}L
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">No active jobs posted</p>
                </div>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
              <CompanyReviews companyId={profile._id} />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfileView;
