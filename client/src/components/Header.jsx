import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import apiClient from '../api/axios';
import { Briefcase } from "lucide-react";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
      logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      logout();
      navigate('/');
    }
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center text-white font-bold shadow-lg"
          >
            <Briefcase size={20} />
          </motion.div>
          <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            CareerConnect
          </span>
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          <Link to="/jobs" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition font-medium">
            Browse Jobs
          </Link>

          {user?.role === 'employer' && (
            <Link to="/post-job" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition font-medium">
              Post Job
            </Link>
          )}

          {user?.role === 'admin' && (
            <Link to="/admin" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition font-medium">
              Admin
            </Link>
          )}

          <ThemeToggle />

          {user ? (
            <div className="flex items-center space-x-4 border-l border-gray-200 dark:border-gray-700 pl-8">
              <Link to="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition font-medium">
                Dashboard
              </Link>
              {user?.role === 'jobSeeker' && (
                <>
                  <Link to="/recommended-jobs" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition font-medium">
                    Recommended
                  </Link>
                  <Link to="/saved-jobs" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition font-medium">
                    Saved
                  </Link>
                  <Link to="/job-alerts" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition font-medium">
                    Alerts
                  </Link>
                </>
              )}
              {user?.role === 'employer' && (
                <Link to="/employer-profile" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition font-medium">
                  Company Profile
                </Link>
              )}
              <Link to="/profile" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition font-medium">
                Profile
              </Link>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="px-4 py-2 bg-error-500 text-white rounded-lg hover:bg-error-600 transition font-medium"
              >
                Logout
              </motion.button>
            </div>
          ) : (
            <div className="flex items-center space-x-4 border-l border-gray-200 dark:border-gray-700 pl-8">
              <Link
                to="/login"
                className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition font-medium"
              >
                Login
              </Link>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:shadow-lg transition font-medium"
                >
                  Sign Up
                </Link>
              </motion.div>
            </div>
          )}
        </div>

        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg className="w-6 h-6 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </nav>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700"
        >
          <div className="px-4 py-4 space-y-4">
            <Link to="/jobs" onClick={() => setIsOpen(false)} className="block text-gray-600 dark:text-gray-300 hover:text-primary-600 py-2">
              Browse Jobs
            </Link>
            {user?.role === 'employer' && (
              <Link to="/post-job" onClick={() => setIsOpen(false)} className="block text-gray-600 dark:text-gray-300 hover:text-primary-600 py-2">
                Post Job
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin" onClick={() => setIsOpen(false)} className="block text-gray-600 dark:text-gray-300 hover:text-primary-600 py-2">
                Admin
              </Link>
            )}
            <div className="py-2">
              <ThemeToggle />
            </div>
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block text-gray-600 dark:text-gray-300 hover:text-primary-600 py-2">
                  Dashboard
                </Link>
                {user?.role === 'jobSeeker' && (
                  <>
                    <Link to="/recommended-jobs" onClick={() => setIsOpen(false)} className="block text-gray-600 dark:text-gray-300 hover:text-primary-600 py-2">
                      Recommended Jobs
                    </Link>
                    <Link to="/saved-jobs" onClick={() => setIsOpen(false)} className="block text-gray-600 dark:text-gray-300 hover:text-primary-600 py-2">
                      Saved Jobs
                    </Link>
                    <Link to="/job-alerts" onClick={() => setIsOpen(false)} className="block text-gray-600 dark:text-gray-300 hover:text-primary-600 py-2">
                      Job Alerts
                    </Link>
                  </>
                )}
                {user?.role === 'employer' && (
                  <Link to="/employer-profile" onClick={() => setIsOpen(false)} className="block text-gray-600 dark:text-gray-300 hover:text-primary-600 py-2">
                    Company Profile
                  </Link>
                )}
                <Link to="/profile" onClick={() => setIsOpen(false)} className="block text-gray-600 dark:text-gray-300 hover:text-primary-600 py-2">
                  Profile
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="w-full px-4 py-2 bg-error-500 text-white rounded-lg hover:bg-error-600 font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)} className="block text-gray-600 dark:text-gray-300 hover:text-primary-600 py-2">
                  Login
                </Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="block text-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </header>
  );
};

export default Header;
