import React from 'react';
import { motion } from 'framer-motion';

const EmptyState = ({ icon = '📭', title, description, action, actionText }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-center max-w-md mb-8">{description}</p>
      {action && (
        <button
          onClick={action}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
        >
          {actionText || 'Take Action'}
        </button>
      )}
    </motion.div>
  );
};

export default EmptyState;
