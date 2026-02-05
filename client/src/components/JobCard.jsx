import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Clock, Bookmark, Edit2, Trash2 } from 'lucide-react';
import { formatSalaryInLakhs } from '../utils/helpers';

const JobCard = ({ job, onSave, user, onEdit, onDelete }) => {
  const isOwner = user?.role === 'employer' && (job.company?._id === user._id || job.company === user._id);
  return (
    <motion.div
      whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
      whileTap={{ y: -4 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 p-6 border border-gray-200 dark:border-gray-700 h-full flex flex-col"
    >
      <div className="flex justify-between items-start mb-4 flex-shrink-0">
        <div className="flex-1">
          <Link to={`/job/${job._id}`} className="text-lg font-bold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 line-clamp-2">
            {job.title}
          </Link>
          {job.companyProfileId || job.company?.employerId ? (
            <Link 
              to={`/company/${job.companyProfileId || job.company?.employerId || job.company?._id}`}
              className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-semibold hover:text-primary-600 dark:hover:text-primary-400 transition inline-block"
            >
              🏢 {job.companyName || job.company?.companyName || job.company?.name || 'Company'}
            </Link>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-semibold">
              🏢 {job.companyName || job.company?.companyName || job.company?.name || 'Company'}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isOwner ? (
            <>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit?.(job._id);
                }}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                title="Edit job"
              >
                <Edit2 size={18} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete?.(job._id);
                }}
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                title="Delete job"
              >
                <Trash2 size={18} />
              </motion.button>
            </>
          ) : (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSave?.(job._id)}
              className="text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <Bookmark size={20} className="transition-transform" />
            </motion.button>
          )}
        </div>
      </div>

      <div className="space-y-3 mb-4 flex-grow">
        <p className="text-gray-600 dark:text-gray-300 line-clamp-2 text-sm leading-relaxed">{job.description}</p>

        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
          <span className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full">
            <MapPin size={16} className="text-blue-600 dark:text-blue-400" />
            <span className="font-medium">{job.location?.city || 'Remote'}</span>
          </span>

          <span className="flex items-center gap-1.5 bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 rounded-full">
            <Clock size={16} className="text-purple-600 dark:text-purple-400" />
            <span className="font-medium">{job.jobType}</span>
          </span>
        </div>

        {job.tags && job.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {job.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="inline-block px-3 py-1.5 text-xs bg-gradient-to-r from-primary-100 to-primary-50 dark:from-primary-900/30 dark:to-primary-800/20 text-primary-700 dark:text-primary-300 rounded-full font-semibold">
                {tag}
              </span>
            ))}
            {job.tags.length > 2 && (
              <span className="inline-block px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full font-semibold">
                +{job.tags.length - 2} more
              </span>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between items-center flex-shrink-0">
        {job.salaryRange?.min && (
          <span className="text-sm font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-lg">
            {formatSalaryInLakhs(job.salaryRange.min, job.salaryRange.max)}
          </span>
        )}
        <Link
          to={`/job/${job._id}`}
          className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold text-sm transition-colors flex items-center gap-1"
        >
          View Details <span>→</span>
        </Link>
      </div>
    </motion.div>
  );
};

export default JobCard;
