import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Upload, Download, X, Plus } from 'lucide-react';
import apiClient from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Badge from '../components/Badge';

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const { showError, showSuccess } = useToast();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [experiences, setExperiences] = useState([]);
  const [showExpForm, setShowExpForm] = useState(false);
  const [expForm, setExpForm] = useState({ company: '', position: '', duration: '', description: '' });
  const [editingExpIndex, setEditingExpIndex] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const resumeInputRef = useRef(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);
  const profileImageInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setValue('name', user.name);
      setValue('email', user.email);
      setValue('phone', user.phone);
      setValue('bio', user.bio);
      setValue('location', user.location?.city);
      setSkills(user.skills || []);
      setExperiences(user.experience || []);
      if (user.profileImage) {
        setProfileImagePreview(user.profileImage);
      }
    }
  }, [user, setValue]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const payload = {
        name: data.name,
        phone: data.phone,
        bio: data.bio,
        location: { city: data.location },
        skills,
        experience: experiences,
      };

      await apiClient.put('/users/me', payload);
      showSuccess('Profile updated successfully');
      updateUser(payload);
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleSaveExperience = () => {
    if (!expForm.company.trim() || !expForm.position.trim() || !expForm.duration.trim()) {
      showError('Please fill in all required fields');
      return;
    }

    if (editingExpIndex !== null) {
      const updated = [...experiences];
      updated[editingExpIndex] = expForm;
      setExperiences(updated);
      showSuccess('Experience updated successfully');
    } else {
      setExperiences([...experiences, expForm]);
      showSuccess('Experience added successfully');
    }
    
    setExpForm({ company: '', position: '', duration: '', description: '' });
    setEditingExpIndex(null);
    setShowExpForm(false);
  };

  const handleEditExperience = (index) => {
    setExpForm(experiences[index]);
    setEditingExpIndex(index);
    setShowExpForm(true);
  };

  const removeExperience = (index) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const handleOpenExpForm = () => {
    setExpForm({ company: '', position: '', duration: '', description: '' });
    setEditingExpIndex(null);
    setShowExpForm(true);
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showError('File size must be less than 5MB');
      return;
    }

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type) && !['.pdf', '.doc', '.docx'].some(ext => file.name.endsWith(ext))) {
      showError('Only PDF and Word documents are allowed');
      return;
    }

    setResumeFile(file);
  };

  const uploadResume = async () => {
    if (!resumeFile) {
      showError('Please select a file first');
      return;
    }

    try {
      setUploadingResume(true);
      const formData = new FormData();
      formData.append('resume', resumeFile);

      const response = await apiClient.put('/users/me', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      showSuccess('Resume uploaded successfully!');
      updateUser(response.data.user);
      setResumeFile(null);
      if (resumeInputRef.current) {
        resumeInputRef.current.value = '';
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to upload resume');
    } finally {
      setUploadingResume(false);
    }
  };

  const downloadResume = async () => {
    if (!user?.resume?.fileName) return;
    try {
      const response = await apiClient.get(`/users/${user._id}/resume/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', user.resume.fileName || 'resume.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showSuccess('Resume downloaded successfully');
    } catch (error) {
      showError('Failed to download resume');
    }
  };

  const deleteResume = async () => {
    try {
      await apiClient.put('/users/me', { resume: null });
      showSuccess('Resume deleted successfully');
      updateUser({ ...user, resume: null });
    } catch (error) {
      showError('Failed to delete resume');
    }
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showError('File size must be less than 5MB');
      return;
    }

    setProfileImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const uploadProfileImage = async () => {
    if (!profileImageFile) {
      showError('Please select an image first');
      return;
    }

    try {
      setUploadingProfileImage(true);
      const formData = new FormData();
      formData.append('profileImage', profileImageFile);

      const response = await apiClient.put('/users/me', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      showSuccess('Profile picture uploaded successfully!');
      updateUser(response.data.user);
      setProfileImageFile(null);
      if (profileImageInputRef.current) {
        profileImageInputRef.current.value = '';
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to upload profile picture');
    } finally {
      setUploadingProfileImage(false);
    }
  };

  const deleteProfileImage = async () => {
    try {
      await apiClient.put('/users/me', { profileImage: null });
      showSuccess('Profile picture deleted successfully');
      updateUser({ ...user, profileImage: null });
      setProfileImagePreview(null);
      setProfileImageFile(null);
    } catch (error) {
      showError('Failed to delete profile picture');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Manage your personal information and professional details</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 space-y-8"
        >
          {/* Profile Picture Section */}
          {user?.role === 'jobSeeker' && (
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Upload size={24} /> Profile Picture
              </h2>
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  {profileImagePreview || user?.profileImage ? (
                    <div className="relative">
                      <img
                        src={profileImagePreview || user?.profileImage}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover border-4 border-primary-200 dark:border-primary-800"
                      />
                      {profileImageFile && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-semibold">New</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-primary-200 dark:border-primary-800">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Upload Profile Picture
                    </label>
                    <div className="flex gap-3">
                      <input
                        ref={profileImageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleProfileImageChange}
                        className="hidden"
                        id="profileImageInput"
                      />
                      <label
                        htmlFor="profileImageInput"
                        className="px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition font-semibold cursor-pointer text-sm"
                      >
                        Choose Image
                      </label>
                      {profileImageFile && (
                        <>
                          <button
                            type="button"
                            onClick={uploadProfileImage}
                            disabled={uploadingProfileImage}
                            className="px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                          >
                            {uploadingProfileImage ? 'Uploading...' : 'Upload'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setProfileImageFile(null);
                              setProfileImagePreview(user?.profileImage || null);
                              if (profileImageInputRef.current) {
                                profileImageInputRef.current.value = '';
                              }
                            }}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-semibold text-sm"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {(user?.profileImage || profileImagePreview) && !profileImageFile && (
                        <button
                          type="button"
                          onClick={deleteProfileImage}
                          className="px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition font-semibold text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Recommended: Square image, max 5MB. JPG, PNG, or GIF.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  {...register('name', { required: 'Name is required' })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
                {errors.name && <span className="text-error-500 text-sm">{errors.name.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email (Read-only)
                </label>
                <input
                  {...register('email')}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-600 dark:text-gray-300 bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone
                </label>
                <input
                  {...register('phone')}
                  type="tel"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <input
                  {...register('location')}
                  placeholder="City"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                {...register('bio')}
                rows="4"
                placeholder="Tell us about yourself..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
          </div>

          {user?.role === 'jobSeeker' && (
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Upload size={24} /> Resume Management
              </h2>
              <div className="space-y-4">
                {user?.resume?.fileName ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4 flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">📄</div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{user.resume.fileName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Uploaded {new Date(user.resume.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={downloadResume}
                        className="p-2 hover:bg-green-100 dark:hover:bg-green-800 rounded-lg transition"
                        title="Download resume"
                      >
                        <Download size={20} className="text-green-600 dark:text-green-400" />
                      </button>
                      <button
                        type="button"
                        onClick={deleteResume}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-800 rounded-lg transition"
                        title="Delete resume"
                      >
                        <X size={20} className="text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="bg-blue-50 dark:bg-blue-900 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg p-6 text-center">
                    <Upload size={32} className="mx-auto text-blue-500 dark:text-blue-400 mb-3" />
                    <p className="text-gray-700 dark:text-gray-300 font-semibold mb-2">No resume uploaded</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Upload a resume to make it available for job applications
                    </p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Upload New Resume
                  </label>
                  <div className="flex gap-3">
                    <input
                      ref={resumeInputRef}
                      type="file"
                      onChange={handleResumeUpload}
                      accept=".pdf,.doc,.docx"
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                    />
                    <button
                      type="button"
                      onClick={uploadResume}
                      disabled={!resumeFile || uploadingResume}
                      className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
                    >
                      {uploadingResume ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                  {resumeFile && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-2">✓ {resumeFile.name} selected</p>
                  )}
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    Accepted formats: PDF, DOC, DOCX (Max 5MB)
                  </p>
                </div>
              </div>
            </div>
          )}

          {user?.role === 'jobSeeker' && (
            <>
              <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Skills</h2>
                <div className="flex gap-2 mb-4">
                  <input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    placeholder="Add a skill and press Enter"
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, i) => (
                    <Badge
                      key={i}
                      label={skill}
                      variant="primary"
                      onRemove={() => removeSkill(skill)}
                    />
                  ))}
                </div>
              </div>

              <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Experience</h2>
                <div className="space-y-4 mb-4">
                  {experiences.map((exp, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex justify-between items-start hover:shadow-md transition"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{exp.position}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{exp.company} • {exp.duration}</p>
                        {exp.description && <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">{exp.description}</p>}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          type="button"
                          onClick={() => handleEditExperience(i)}
                          className="p-2 text-primary-600 hover:bg-primary-100 dark:hover:bg-gray-600 rounded transition"
                          title="Edit experience"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          onClick={() => removeExperience(i)}
                          className="p-2 text-error-500 hover:bg-error-100 dark:hover:bg-gray-600 rounded transition"
                          title="Delete experience"
                        >
                          🗑️
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleOpenExpForm}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
                >
                  <Plus size={20} /> Add Experience
                </button>
              </div>
            </>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 transition"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </motion.button>
        </motion.form>

        {showExpForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-2xl w-full"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingExpIndex !== null ? 'Edit Experience' : 'Add Experience'}
                </h2>
                <button
                  onClick={() => {
                    setShowExpForm(false);
                    setEditingExpIndex(null);
                    setExpForm({ company: '', position: '', duration: '', description: '' });
                  }}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                >
                  <X size={24} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={expForm.company}
                    onChange={(e) => setExpForm({ ...expForm, company: e.target.value })}
                    placeholder="e.g., Google, Microsoft"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Position *
                  </label>
                  <input
                    type="text"
                    value={expForm.position}
                    onChange={(e) => setExpForm({ ...expForm, position: e.target.value })}
                    placeholder="e.g., Senior Developer, Product Manager"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Duration *
                  </label>
                  <input
                    type="text"
                    value={expForm.duration}
                    onChange={(e) => setExpForm({ ...expForm, duration: e.target.value })}
                    placeholder="e.g., Jan 2020 - Dec 2021"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={expForm.description}
                    onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                    placeholder="Describe your responsibilities and achievements..."
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={handleSaveExperience}
                  className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
                >
                  {editingExpIndex !== null ? 'Update Experience' : 'Add Experience'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowExpForm(false);
                    setEditingExpIndex(null);
                    setExpForm({ company: '', position: '', duration: '', description: '' });
                  }}
                  className="flex-1 px-4 py-3 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
