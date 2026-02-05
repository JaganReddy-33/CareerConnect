import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Building2, Globe, MapPin, Users, Briefcase, Linkedin, Twitter, Upload, X } from 'lucide-react';
import apiClient from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import CompanyReviews from '../components/CompanyReviews';

const EmployerProfile = () => {
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/companies/my-profile');
      setProfile(response.data.profile);

      if (response.data.profile) {
        setValue('companyName', response.data.profile.companyName);
        setValue('industry', response.data.profile.industry);
        setValue('companySize', response.data.profile.companySize);
        setValue('website', response.data.profile.website);
        setValue('description', response.data.profile.description);
        setValue('foundedYear', response.data.profile.foundedYear);
        setValue('location.city', response.data.profile.location?.city);
        setValue('location.country', response.data.profile.location?.country);
        setValue('location.headquarters', response.data.profile.location?.headquarters);
        setValue('socialLinks.linkedin', response.data.profile.socialLinks?.linkedin);
        setValue('socialLinks.twitter', response.data.profile.socialLinks?.twitter);
        setValue('socialLinks.facebook', response.data.profile.socialLinks?.facebook);
        if (response.data.profile.logo) {
          setLogoPreview(response.data.profile.logo);
        }
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        showError('Failed to load company profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showError('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showError('File size must be less than 5MB');
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('companyName', data.companyName);
      formData.append('industry', data.industry);
      formData.append('companySize', data.companySize);
      formData.append('website', data.website);
      formData.append('description', data.description);
      formData.append('foundedYear', data.foundedYear ? parseInt(data.foundedYear) : '');
      formData.append('location[city]', data['location.city']);
      formData.append('location[country]', data['location.country']);
      formData.append('location[headquarters]', data['location.headquarters']);
      formData.append('socialLinks[linkedin]', data['socialLinks.linkedin']);
      formData.append('socialLinks[twitter]', data['socialLinks.twitter']);
      formData.append('socialLinks[facebook]', data['socialLinks.facebook']);

      if (logoFile) {
        formData.append('logo', logoFile);
      }

      if (profile?._id) {
        await apiClient.put('/companies', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showSuccess('Company profile updated successfully!');
      } else {
        const response = await apiClient.post('/companies', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setProfile(response.data.profile);
        showSuccess('Company profile created successfully!');
      }

      setLogoFile(null);
      fetchProfile();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to save company profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-2">
            <Building2 size={36} className="text-primary-600" />
            Company Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-300">Manage your company information and attract top talent</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 space-y-8"
        >
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Building2 size={24} /> Company Logo
            </h2>
            <div className="mb-8">
              <div className="flex items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-gray-400">
                        <Building2 size={32} className="mx-auto mb-1" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company Logo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-100 file:text-primary-700 hover:file:bg-primary-200"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">PNG, JPG, GIF up to 5MB</p>
                  {logoPreview && logoFile && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={handleRemoveLogo}
                      className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm"
                    >
                      <X size={16} /> Remove Logo
                    </motion.button>
                  )}
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Building2 size={24} /> Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company Name *
                </label>
                <input
                  {...register('companyName', { required: 'Company name is required' })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  placeholder="Your company name"
                />
                {errors.companyName && <span className="text-error-500 text-sm">{errors.companyName.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Industry
                </label>
                <input
                  {...register('industry')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  placeholder="e.g. Technology, Finance"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company Size
                </label>
                <select
                  {...register('companySize')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                >
                  <option value="">Select size</option>
                  <option value="1-50">1-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501-1000">501-1000 employees</option>
                  <option value="1000+">1000+ employees</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Founded Year
                </label>
                <input
                  {...register('foundedYear')}
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  placeholder="e.g. 2020"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Globe size={18} /> Website
                </label>
                <input
                  {...register('website')}
                  type="url"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  placeholder="https://yourcompany.com"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company Description
                </label>
                <textarea
                  {...register('description')}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  placeholder="Tell us about your company, culture, and values..."
                />
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <MapPin size={24} /> Location
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  City
                </label>
                <input
                  {...register('location.city')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  placeholder="e.g. San Francisco"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Country
                </label>
                <input
                  {...register('location.country')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  placeholder="e.g. United States"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Headquarters
                </label>
                <input
                  {...register('location.headquarters')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  placeholder="Full headquarters address"
                />
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Users size={24} /> Social Links
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Linkedin size={18} /> LinkedIn
                </label>
                <input
                  {...register('socialLinks.linkedin')}
                  type="url"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  placeholder="https://linkedin.com/company/..."
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Twitter size={18} /> Twitter
                </label>
                <input
                  {...register('socialLinks.twitter')}
                  type="url"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  placeholder="https://twitter.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Facebook
                </label>
                <input
                  {...register('socialLinks.facebook')}
                  type="url"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  placeholder="https://facebook.com/..."
                />
              </div>
            </div>
          </div>

          {profile && (
            <div className={`${profile.isVerified ? 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700' : 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700'} border rounded-lg p-4`}>
              <p className={`text-sm ${profile.isVerified ? 'text-green-800 dark:text-green-200' : 'text-blue-800 dark:text-blue-200'}`}>
                <span className="font-semibold">Verification Status:</span>{' '}
                {profile.isVerified ? (
                  <span className="flex items-center gap-2">
                    <span className="text-green-600">✓</span> Verified Company
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span>⏳</span> Verification in Progress - Your profile is under review
                  </span>
                )}
              </p>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={saving}
            className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 transition"
          >
            {saving ? 'Saving...' : profile ? 'Update Profile' : 'Create Profile'}
          </motion.button>
        </motion.form>

        {profile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mt-8"
          >
            <CompanyReviews companyId={profile._id} />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EmployerProfile;
