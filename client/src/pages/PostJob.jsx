import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import apiClient from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const PostJob = () => {
  const { jobId } = useParams();
  const { user } = useAuth();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  const fetchJob = async () => {
    try {
      const response = await apiClient.get(`/jobs/${jobId}`);
      const job = response.data.job;
      reset({
        title: job.title,
        description: job.description,
        responsibilities: job.responsibilities?.join('\n'),
        qualifications: job.qualifications?.join('\n'),
        jobType: job.jobType,
        remote: job.remote === true,
      });
      setCity(job.location?.city || '');
      setCountry(job.location?.country || '');
      setMinSalary(job.salaryRange?.min || '');
      setMaxSalary(job.salaryRange?.max || '');
      setTags(job.tags || []);
    } catch (error) {
      showError('Failed to load job');
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const payload = {
        title: data.title,
        description: data.description,
        responsibilities: data.responsibilities.split('\n').filter((r) => r.trim()),
        qualifications: data.qualifications.split('\n').filter((q) => q.trim()),
        jobType: data.jobType,
        location: {
          city: city,
          country: country,
        },
        salaryRange: {
          min: minSalary ? parseInt(minSalary) : 0,
          max: maxSalary ? parseInt(maxSalary) : 0,
        },
        remote: !!data.remote,
        tags,
      };

      if (jobId) {
        await apiClient.put(`/jobs/${jobId}`, payload);
        showSuccess('Job updated successfully');
      } else {
        await apiClient.post('/jobs', payload);
        showSuccess('Job posted successfully');
      }

      navigate('/dashboard');
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to save job');
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setTags(tags.filter((t) => t !== tag));
  };

  if (user?.role !== 'employer' && user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 text-lg">You don't have permission to post jobs</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            {jobId ? 'Edit Job' : 'Post a New Job'}
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-gray-900 dark:text-white font-semibold mb-2">Job Title</label>
              <input
                {...register('title', { required: 'Job title is required' })}
                type="text"
                placeholder="e.g., Senior React Developer"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
              {errors.title && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-gray-900 dark:text-white font-semibold mb-2">Description</label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                placeholder="Describe the job..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
              {errors.description && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-2">Job Type</label>
                <select
                  {...register('jobType')}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-2">
                  <input type="checkbox" {...register('remote')} className="mr-2" />
                  Remote Position
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-2">City</label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  type="text"
                  placeholder="e.g., New York"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
              </div>

              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-2">Country</label>
                <input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  type="text"
                  placeholder="e.g., USA"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-900 font-semibold mb-2">Minimum Salary</label>
                <input
                  value={minSalary}
                  onChange={(e) => setMinSalary(e.target.value)}
                  type="number"
                  placeholder="50000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
              </div>

              <div>
                <label className="block text-gray-900 font-semibold mb-2">Maximum Salary</label>
                <input
                  value={maxSalary}
                  onChange={(e) => setMaxSalary(e.target.value)}
                  type="number"
                  placeholder="100000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-900 dark:text-white font-semibold mb-2">Responsibilities (one per line)</label>
              <textarea
                {...register('responsibilities')}
                placeholder="- Develop web applications&#10;- Lead development team"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>

            <div>
              <label className="block text-gray-900 dark:text-white font-semibold mb-2">Qualifications (one per line)</label>
              <textarea
                {...register('qualifications')}
                placeholder="- 3+ years experience&#10;- React expertise"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>

            <div>
              <label className="block text-gray-900 dark:text-white font-semibold mb-2">Skills/Tags</label>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add a skill and press Enter"
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-3 bg-primary-600 dark:bg-primary-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 font-bold hover:text-primary-900 dark:hover:text-primary-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex space-x-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-primary-600 dark:bg-primary-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition font-semibold disabled:bg-gray-400 dark:disabled:bg-gray-600"
              >
                {loading ? 'Saving...' : jobId ? 'Update Job' : 'Post Job'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default PostJob;
