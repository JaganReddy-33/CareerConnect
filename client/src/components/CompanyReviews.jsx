import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare, Trash2, Edit2 } from 'lucide-react';
import apiClient from '../api/axios';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const CompanyReviews = ({ companyId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ rating: 5, title: '', comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (companyId) {
      fetchReviews();
    }
  }, [companyId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/companies/${companyId}/reviews`);
      setReviews(response.data.reviews || []);
    } catch (error) {
      showError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!formData.comment.trim()) {
      showError('Please enter a review');
      return;
    }

    try {
      setSubmitting(true);
      if (editingId) {
        await apiClient.put(`/companies/${companyId}/reviews/${editingId}`, {
          rating: formData.rating,
          title: formData.title,
          comment: formData.comment,
        });
        showSuccess('Review updated successfully!');
      } else {
        await apiClient.post(`/companies/${companyId}/reviews`, {
          rating: formData.rating,
          title: formData.title,
          comment: formData.comment,
        });
        showSuccess('Review submitted successfully!');
      }
      setFormData({ rating: 5, title: '', comment: '' });
      setEditingId(null);
      fetchReviews();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReview = (review) => {
    setFormData({ rating: review.rating, title: review.title || '', comment: review.comment });
    setEditingId(review._id);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.delete(`/companies/${companyId}/reviews/${reviewId}`);
      showSuccess('Review deleted successfully!');
      fetchReviews();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to delete review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ rating: 5, title: '', comment: '' });
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <MessageSquare size={24} /> Company Reviews
        </h3>

        <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 dark:text-primary-400">
                {averageRating}
              </div>
              <div className="flex justify-center gap-1 mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </p>
            </div>
            <div className="flex-1 h-24 bg-white dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {reviews.length === 0
                  ? 'No reviews yet. Be the first to review this company!'
                  : 'See what people think about this company'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {user && user.role === 'jobSeeker' && (
        <form onSubmit={handleSubmitReview} className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 border border-gray-200 dark:border-gray-700 mb-6 md:mb-8">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">{editingId ? 'Edit Your Review' : 'Write a Review'}</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rating
              </label>
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: i + 1 })}
                    className="text-2xl md:text-3xl transition hover:scale-110"
                  >
                    {i < formData.rating ? '⭐' : '☆'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Review Title (Optional)
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Give your review a title..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Review
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                placeholder="Share your experience working at this company..."
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                required
              />
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-700 dark:hover:bg-primary-600 disabled:opacity-50 transition"
              >
                {submitting ? 'Submitting...' : editingId ? 'Update Review' : 'Submit Review'}
              </motion.button>
              {editingId && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition font-semibold"
                >
                  Cancel
                </motion.button>
              )}
            </div>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : reviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((review) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex-shrink-0">
                    {review.reviewer?.profileImage ? (
                      <img
                        src={review.reviewer.profileImage}
                        alt={review.reviewer?.name || 'Reviewer'}
                        className="w-10 h-10 rounded-full object-cover border-2 border-primary-200 dark:border-primary-800"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm">
                        {review.reviewer?.name?.charAt(0)?.toUpperCase() || 'A'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {review.reviewer?.name || 'Anonymous'}
                    </p>
                    <div className="flex gap-1 mt-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                {user && user._id === review.reviewer?._id && (
                  <div className="flex gap-2 ml-2">
                    <button
                      onClick={() => handleEditReview(review)}
                      className="p-2 text-primary-600 hover:bg-primary-100 dark:hover:bg-gray-700 rounded transition"
                      title="Edit review"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review._id)}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-gray-700 rounded transition"
                      title="Delete review"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
              {review.title && (
                <p className="font-semibold text-gray-900 dark:text-white mb-2">{review.title}</p>
              )}
              <p className="text-gray-700 dark:text-gray-300 mb-3">{review.comment}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </motion.div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default CompanyReviews;
