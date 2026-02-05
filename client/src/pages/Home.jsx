import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SearchBar from '../components/SearchBar';
import JobCardEnhanced from '../components/JobCardEnhanced';
import LoadingSkeleton from '../components/LoadingSkeleton';
import apiClient from '../api/axios';

const Home = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedJobs = async () => {
      try {
        const response = await apiClient.get('/jobs?limit=6');
        setJobs(response.data.jobs);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedJobs();
  }, []);

  const features = [
    { icon: '🎯', title: 'Smart Matching', desc: 'AI-powered job recommendations tailored to your profile' },
    { icon: '⚡', title: 'Quick Apply', desc: 'Apply to jobs in seconds using saved profile' },
    { icon: '🔔', title: 'Job Alerts', desc: 'Get notifications for jobs matching your criteria' },
    { icon: '❤️', title: 'Save for Later', desc: 'Bookmark jobs and review them whenever you want' },
    { icon: '🏢', title: 'Company Insights', desc: 'Learn about companies before you apply' },
    { icon: '📊', title: 'Track Progress', desc: 'Monitor your applications in one place' },
  ];

  return (
    <div className="bg-white dark:bg-gray-900">
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl animation-float"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-primary-100">CareerConnect</span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-12 max-w-2xl mx-auto">
              Your Gateway to Dream Jobs - Discover amazing opportunities from world-class companies. Apply with confidence.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="max-w-2xl mx-auto mb-12"
          >
            <SearchBar onSearch={() => {}} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Link
              to="/jobs"
              className="px-8 py-4 bg-white text-primary-600 rounded-lg font-bold hover:bg-primary-50 transition transform hover:scale-105"
            >
              Browse Jobs
            </Link>
            <Link
              to="/register?role=employer"
              className="px-8 py-4 border-2 border-white text-white rounded-lg font-bold hover:bg-white hover:text-primary-600 transition transform hover:scale-105"
            >
              Post a Job
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Featured Opportunities
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Top jobs across industries matched for you
            </p>
          </motion.div>

          {loading ? (
            <LoadingSkeleton count={6} type="grid" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {jobs.map((job, idx) => (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <JobCardEnhanced job={job} />
                </motion.div>
              ))}
            </div>
          )}

          <motion.div whileInView={{ opacity: 1 }} className="text-center mt-16">
            <Link
              to="/jobs"
              className="inline-block px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-bold hover:shadow-lg transition transform hover:scale-105"
            >
              Explore All Jobs →
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose JobListing?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Everything you need to find and land your perfect job
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -8 }}
                className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-md hover:shadow-xl transition border border-gray-200 dark:border-gray-600"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} whileInView={{ opacity: 1, y: 0 }}>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-primary-100 mb-12">
              Join thousands of job seekers finding their dream jobs on JobListing.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/register"
                className="inline-block px-8 py-4 bg-white text-primary-600 rounded-lg font-bold hover:bg-primary-50 transition"
              >
                Create Free Account
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
