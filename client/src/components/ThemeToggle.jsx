import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (savedTheme === 'system' && prefersDark);
    setIsDark(shouldBeDark);
    updateTheme(shouldBeDark);
  }, []);

  const updateTheme = (dark) => {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const toggleTheme = () => {
    setIsFlipping(true);
    setTimeout(() => {
      const newTheme = !isDark;
      setIsDark(newTheme);
      updateTheme(newTheme);
      setIsFlipping(false);
    }, 300);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      className="relative p-2.5 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-800 dark:text-gray-200 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-700 transition-all duration-300 shadow-md hover:shadow-lg border border-gray-300 dark:border-gray-600"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <motion.div
        animate={{ rotateY: isFlipping ? 360 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
        className="relative w-5 h-5 flex items-center justify-center"
      >
        {isDark ? (
          <motion.span
            initial={{ opacity: 0, rotate: -180 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ duration: 0.3 }}
            className="text-lg"
          >
            ☀️
          </motion.span>
        ) : (
          <motion.span
            initial={{ opacity: 0, rotate: 180 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ duration: 0.3 }}
            className="text-lg"
          >
            🌙
          </motion.span>
        )}
      </motion.div>

      <motion.div
        className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary-400/20 to-primary-600/20 dark:from-primary-500/20 dark:to-primary-700/20 pointer-events-none"
        animate={isFlipping ? { scale: [1, 1.5, 0] } : { scale: 0 }}
        transition={{ duration: 0.6 }}
      />
    </motion.button>
  );
};

export default ThemeToggle;
