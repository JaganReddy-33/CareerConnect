import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Search, X } from 'lucide-react';
import { debounce } from '../utils/helpers';

const Filters = ({ onFilter, onSearch }) => {
  const [filters, setFilters] = useState({
    jobType: [],
    remote: false,
    minSalary: '',
    maxSalary: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    jobType: true,
    remote: true,
    salary: true,
  });

  const debouncedSearch = debounce((value) => {
    if (onSearch) {
      onSearch(value);
    }
  }, 500);

  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'];

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleJobTypeChange = (type) => {
    setFilters((prev) => ({
      ...prev,
      jobType: prev.jobType.includes(type)
        ? prev.jobType.filter((t) => t !== type)
        : [...prev.jobType, type],
    }));
  };

  const handleRemoteChange = () => {
    setFilters((prev) => ({
      ...prev,
      remote: !prev.remote,
    }));
  };

  const handleSalaryChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    if (onSearch) {
      onSearch('');
    }
  };

  const applyFilters = () => {
    onFilter(filters);
  };

  const resetFilters = () => {
    const newFilters = {
      jobType: [],
      remote: false,
      minSalary: '',
      maxSalary: '',
    };
    setFilters(newFilters);
    setSearchQuery('');
    onFilter(newFilters);
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <div className="p-4 sm:p-6">
        <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Search</label>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 transition text-sm"
            />
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
              >
                <X size={18} />
              </motion.button>
            )}
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">Filters</h3>

        <div className="space-y-0 divide-y divide-gray-200 dark:divide-gray-700">
          <motion.div>
            <button
              onClick={() => toggleSection('jobType')}
              className="w-full flex items-center justify-between py-4 text-gray-900 dark:text-white font-semibold hover:text-primary-600 dark:hover:text-primary-400 transition"
            >
              <span>Job Type</span>
              <motion.div
                animate={{ rotate: expandedSections.jobType ? 0 : -90 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={20} />
              </motion.div>
            </button>
            <motion.div
              initial={false}
              animate={{ height: expandedSections.jobType ? 'auto' : 0, opacity: expandedSections.jobType ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-3 pb-4">
                {jobTypes.map((type) => (
                  <label key={type} className="flex items-center cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition">
                    <input
                      type="checkbox"
                      checked={filters.jobType.includes(type)}
                      onChange={() => handleJobTypeChange(type)}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-600 cursor-pointer"
                    />
                    <span className="ml-3 text-gray-700 dark:text-gray-300 text-sm">{type}</span>
                  </label>
                ))}
              </div>
            </motion.div>
          </motion.div>

          <motion.div>
            <button
              onClick={() => toggleSection('remote')}
              className="w-full flex items-center justify-between py-4 text-gray-900 dark:text-white font-semibold hover:text-primary-600 dark:hover:text-primary-400 transition"
            >
              <span>Work Mode</span>
              <motion.div
                animate={{ rotate: expandedSections.remote ? 0 : -90 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={20} />
              </motion.div>
            </button>
            <motion.div
              initial={false}
              animate={{ height: expandedSections.remote ? 'auto' : 0, opacity: expandedSections.remote ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pb-4">
                <label className="flex items-center cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition">
                  <input
                    type="checkbox"
                    checked={filters.remote}
                    onChange={handleRemoteChange}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-600 cursor-pointer"
                  />
                  <span className="ml-3 text-gray-700 dark:text-gray-300 font-medium text-sm">Remote Only</span>
                </label>
              </div>
            </motion.div>
          </motion.div>

          <motion.div>
            <button
              onClick={() => toggleSection('salary')}
              className="w-full flex items-center justify-between py-4 text-gray-900 dark:text-white font-semibold hover:text-primary-600 dark:hover:text-primary-400 transition"
            >
              <span>Salary Range</span>
              <motion.div
                animate={{ rotate: expandedSections.salary ? 0 : -90 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={20} />
              </motion.div>
            </button>
            <motion.div
              initial={false}
              animate={{ height: expandedSections.salary ? 'auto' : 0, opacity: expandedSections.salary ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-3 pb-4">
                <input
                  type="number"
                  name="minSalary"
                  placeholder="Min Salary"
                  value={filters.minSalary}
                  onChange={handleSalaryChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 dark:bg-gray-700 dark:text-white text-sm"
                />
                <input
                  type="number"
                  name="maxSalary"
                  placeholder="Max Salary"
                  value={filters.maxSalary}
                  onChange={handleSalaryChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 dark:bg-gray-700 dark:text-white text-sm"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>

        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={applyFilters}
            className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition font-medium text-sm"
          >
            Apply
          </button>
          <button
            onClick={resetFilters}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition font-medium text-sm"
          >
            Reset
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Filters;
