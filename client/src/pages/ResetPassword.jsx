import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import apiClient from '../api/axios';
import { useToast } from '../context/ToastContext';
import { Lock } from 'lucide-react';

const ResetPassword = () => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const password = watch('password');

  useEffect(() => {
    if (!token) {
      showError('Invalid reset link');
      navigate('/login');
    }
  }, [token, navigate, showError]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await apiClient.post('/auth/reset-password', {
        token,
        newPassword: data.password,
      });
      showSuccess('Password reset successfully! Redirecting to login...');
      setSubmitted(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 10 },
    },
  };

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center py-12 px-4 relative overflow-hidden">
      <motion.div
        className="absolute top-0 right-0 w-96 h-96 bg-primary-200 dark:bg-primary-900/20 rounded-full blur-3xl opacity-20"
        animate={{ x: [0, -100, 0], y: [0, 50, 0] }}
        transition={{ duration: 20, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-96 h-96 bg-primary-300 dark:bg-primary-800/20 rounded-full blur-3xl opacity-15"
        animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
        transition={{ duration: 25, repeat: Infinity }}
      />

      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 50, damping: 15, duration: 0.8 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl dark:shadow-2xl p-8 w-full max-w-md relative z-10 border border-white dark:border-gray-700"
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary-400/5 to-primary-600/5 dark:from-primary-500/10 dark:to-primary-700/10 rounded-2xl pointer-events-none"
          animate={{ opacity: [0.5, 0.7, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10"
        >
          <motion.div variants={itemVariants} className="text-center mb-8">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 mb-4"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Lock className="text-primary-600 dark:text-primary-400" size={32} />
            </motion.div>
            <motion.h1
              className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-300 bg-clip-text text-transparent"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {submitted ? 'Password Reset' : 'Create New Password'}
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-gray-600 dark:text-gray-400 mt-2 text-sm"
            >
              {submitted
                ? 'Your password has been successfully reset'
                : 'Enter your new password below'}
            </motion.p>
          </motion.div>

          {!submitted ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <motion.div variants={itemVariants}>
                <label className="block text-gray-900 dark:text-gray-200 font-semibold mb-2 text-sm">
                  New Password
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition duration-300"
                />
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-2"
                  >
                    {errors.password.message}
                  </motion.p>
                )}
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="block text-gray-900 dark:text-gray-200 font-semibold mb-2 text-sm">
                  Confirm Password
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) => value === password || 'Passwords do not match',
                  })}
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition duration-300"
                />
                {errors.confirmPassword && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-2"
                  >
                    {errors.confirmPassword.message}
                  </motion.p>
                )}
              </motion.div>

              <motion.button
                variants={itemVariants}
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(14, 165, 233, 0.3)' }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-semibold transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <motion.span
                  animate={{ opacity: loading ? 0.5 : 1 }}
                  transition={{ duration: 0.5, repeat: loading ? Infinity : 0 }}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </motion.span>
              </motion.button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl mb-4"
              >
                ✓
              </motion.div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Redirecting to login...
              </p>
            </motion.div>
          )}

          <motion.div variants={itemVariants} className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Back to{' '}
              <Link
                to="/login"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition hover:underline"
              >
                Sign in
              </Link>
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
          >
            <Link
              to="/"
              className="text-center block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 text-sm transition hover:underline"
            >
              ← Back to Home
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
