import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { 
  Upload, 
  Download, 
  X, 
  Plus, 
  User as UserIcon, 
  Briefcase, 
  Mail, 
  Phone, 
  MapPin, 
  FileText,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import apiClient from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Badge from '../components/Badge';

const SectionHeader = ({ icon: Icon, title, description }) => (
  <div className="mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
    <div className="flex items-center gap-2 mb-1">
      {Icon && <Icon className="text-primary-600 dark:text-primary-400" size={22} />}
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
    </div>
    {description && <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>}
  </div>
);

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
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);
  
  const resumeInputRef = useRef(null);
  const profileImageInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setValue('name', user.name || '');
      setValue('email', user.email || '');
      setValue('phone', user.phone || '');
      setValue('bio', user.bio || '');
      setValue('location', user.location?.city || '');
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

      const response = await apiClient.put('/users/me', payload);
      showSuccess('Profile updated successfully');
      if (response.data.user) {
        updateUser(response.data.user);
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = () => {
    const trimmedSkill = skillInput.trim();
    if (trimmedSkill && !skills.includes(trimmedSkill)) {
      setSkills([...skills, trimmedSkill]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
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
      showSuccess('Experience updated');
    } else {
      setExperiences([...experiences, expForm]);
      showSuccess('Experience added');
    }
    
    resetExpForm();
  };

  const resetExpForm = () => {
    setExpForm({ company: '', position: '', duration: '', description: '' });
    setEditingExpIndex(null);
    setShowExpForm(false);
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showError('File size must be less than 5MB');
      return;
    }

    const allowedExtensions = ['.pdf', '.doc', '.docx'];
    if (!allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
      showError('Only PDF and Word documents are allowed');
      return;
    }

    setResumeFile(file);
  };

  const uploadResume = async () => {
    if (!resumeFile) return;

    try {
      setUploadingResume(true);
      const formData = new FormData();
      formData.append('resume', resumeFile);

      const response = await apiClient.put('/users/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      showSuccess('Resume uploaded successfully!');
      updateUser(response.data.user);
      setResumeFile(null);
      if (resumeInputRef.current) resumeInputRef.current.value = '';
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to upload resume');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleDeleteResume = async () => {
    if (!window.confirm('Are you sure you want to delete your resume?')) return;
    try {
      await apiClient.put('/users/me', { resume: null });
      showSuccess('Resume deleted');
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

    if (file.size > 2 * 1024 * 1024) {
      showError('Image must be less than 2MB');
      return;
    }

    setProfileImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setProfileImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const uploadProfileImage = async () => {
    if (!profileImageFile) return;

    try {
      setUploadingProfileImage(true);
      const formData = new FormData();
      formData.append('profileImage', profileImageFile);

      const response = await apiClient.put('/users/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      showSuccess('Profile picture updated!');
      updateUser(response.data.user);
      setProfileImageFile(null);
      if (profileImageInputRef.current) profileImageInputRef.current.value = '';
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to upload profile picture');
    } finally {
      setUploadingProfileImage(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mb-10"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your professional identity and personal details</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8">
          {/* Profile Section */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-10">
              
              {/* Avatar Section */}
              <div className="flex flex-col sm:flex-row items-center gap-8 pb-10 border-b border-gray-50 dark:border-gray-800">
                <div className="relative group">
                  {profileImagePreview ? (
                    <img
                      src={profileImagePreview}
                      alt="Profile"
                      className="w-32 h-32 rounded-2xl object-cover ring-4 ring-primary-50 dark:ring-primary-900/20 transition-transform group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-4xl font-bold ring-4 ring-primary-50 dark:ring-primary-900/20">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                  <input
                    ref={profileImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    className="hidden"
                    id="profileImageInput"
                  />
                </div>
                
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Profile Photo</h3>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                    <label
                      htmlFor="profileImageInput"
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer text-sm font-medium"
                    >
                      Change Photo
                    </label>
                    {profileImageFile && (
                      <button
                        type="button"
                        onClick={uploadProfileImage}
                        disabled={uploadingProfileImage}
                        className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition text-sm font-medium flex items-center gap-2"
                      >
                        {uploadingProfileImage ? 'Uploading...' : 'Save Photo'}
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-3 flex items-center justify-center sm:justify-start gap-1">
                    <AlertCircle size={12} /> Max size 2MB. JPG, PNG.
                  </p>
                </div>
              </div>

              {/* Basic Info */}
              <div>
                <SectionHeader 
                  icon={UserIcon} 
                  title="Basic Information" 
                  description="Your primary contact information used for applications"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Full Name</label>
                    <input
                      {...register('name', { required: 'Name is required' })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition dark:text-white"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Email Address</label>
                    <input
                      {...register('email')}
                      disabled
                      className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Phone Number</label>
                    <input
                      {...register('phone')}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition dark:text-white"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        {...register('location')}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition dark:text-white"
                        placeholder="City, Country"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Professional Bio</label>
                  <textarea
                    {...register('bio')}
                    rows="4"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition dark:text-white resize-none"
                    placeholder="Briefly describe your professional background and goals..."
                  />
                </div>
              </div>

              {/* Job Seeker Specifics */}
              {user.role === 'jobSeeker' && (
                <>
                  {/* Skills Section */}
                  <div className="pt-4">
                    <SectionHeader 
                      icon={Briefcase} 
                      title="Skills & Expertise" 
                      description="Add keywords that highlight your professional capabilities"
                    />
                    <div className="flex flex-col sm:flex-row gap-3 mb-4">
                      <input
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                        placeholder="e.g. React, Python, UI Design"
                        className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={handleAddSkill}
                        className="px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition font-medium"
                      >
                        Add Skill
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 min-h-[2.5rem]">
                      <AnimatePresence>
                        {skills.map((skill, i) => (
                          <motion.div
                            key={skill}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                          >
                            <Badge
                              label={skill}
                              variant="primary"
                              onRemove={() => handleRemoveSkill(skill)}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      {skills.length === 0 && (
                        <p className="text-sm text-gray-400 italic">No skills added yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Experience Section */}
                  <div className="pt-4">
                    <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                      <div className="flex items-center gap-2">
                        <FileText className="text-primary-600 dark:text-primary-400" size={22} />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Work Experience</h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingExpIndex(null);
                          setExpForm({ company: '', position: '', duration: '', description: '' });
                          setShowExpForm(true);
                        }}
                        className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition"
                      >
                        <Plus size={24} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {experiences.map((exp, i) => (
                        <div
                          key={i}
                          className="group p-5 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all flex justify-between items-start"
                        >
                          <div>
                            <h4 className="font-bold text-gray-900 dark:text-white">{exp.position}</h4>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm mt-1">
                              <span className="text-primary-600 dark:text-primary-400 font-medium">{exp.company}</span>
                              <span className="text-gray-400">•</span>
                              <span className="text-gray-500 dark:text-gray-400">{exp.duration}</span>
                            </div>
                            {exp.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 line-clamp-2">{exp.description}</p>
                            )}
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => {
                                setExpForm(exp);
                                setEditingExpIndex(i);
                                setShowExpForm(true);
                              }}
                              className="p-2 text-gray-500 hover:text-primary-600 hover:bg-white dark:hover:bg-gray-800 rounded-lg shadow-sm transition"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setExperiences(experiences.filter((_, idx) => idx !== i))}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-white dark:hover:bg-gray-800 rounded-lg shadow-sm transition"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                      {experiences.length === 0 && (
                        <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/20 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                          <p className="text-gray-500">Share your professional journey</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Resume Section */}
                  <div className="pt-4">
                    <SectionHeader 
                      icon={Download} 
                      title="Resume & Documents" 
                      description="Upload your latest resume (PDF or DOCX)"
                    />
                    
                    <div className="space-y-4">
                      {user.resume?.fileName ? (
                        <div className="flex items-center justify-between p-4 bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-2xl">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600">
                              <FileText size={24} />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">{user.resume.fileName}</p>
                              <p className="text-xs text-green-600/70 font-medium">Uploaded Successfully</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={handleDeleteResume}
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-gray-800/10 text-center">
                          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400 mb-4">
                            <Upload size={32} />
                          </div>
                          <p className="text-gray-900 dark:text-white font-medium mb-1">Upload your resume</p>
                          <p className="text-sm text-gray-500 mb-6">PDF, DOC, DOCX up to 5MB</p>
                          <input
                            ref={resumeInputRef}
                            type="file"
                            onChange={handleResumeUpload}
                            accept=".pdf,.doc,.docx"
                            className="hidden"
                            id="resumeInput"
                          />
                          <label
                            htmlFor="resumeInput"
                            className="px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition font-medium cursor-pointer"
                          >
                            Browse Files
                          </label>
                        </div>
                      )}

                      {resumeFile && (
                        <div className="flex items-center justify-between p-4 bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/30 rounded-2xl">
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="text-primary-600" size={20} />
                            <span className="text-sm font-medium dark:text-white">{resumeFile.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={uploadResume}
                            disabled={uploadingResume}
                            className="text-primary-600 font-bold text-sm hover:underline disabled:opacity-50"
                          >
                            {uploadingResume ? 'Uploading...' : 'Confirm Upload'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              <div className="pt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-primary-600 text-white rounded-2xl font-bold text-lg hover:bg-primary-700 disabled:opacity-50 shadow-lg shadow-primary-500/20 transition-all hover:translate-y-[-1px]"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving Changes...
                    </div>
                  ) : 'Save All Changes'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Experience Modal */}
      <AnimatePresence>
        {showExpForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetExpForm}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <h3 className="text-xl font-bold dark:text-white">
                  {editingExpIndex !== null ? 'Edit Experience' : 'Add Experience'}
                </h3>
                <button onClick={resetExpForm} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="p-8 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Company</label>
                    <input
                      value={expForm.company}
                      onChange={(e) => setExpForm({ ...expForm, company: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white"
                      placeholder="Microsoft"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Position</label>
                    <input
                      value={expForm.position}
                      onChange={(e) => setExpForm({ ...expForm, position: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white"
                      placeholder="Senior Engineer"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Duration</label>
                  <input
                    value={expForm.duration}
                    onChange={(e) => setExpForm({ ...expForm, duration: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white"
                    placeholder="Jan 2022 - Present"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Description</label>
                  <textarea
                    value={expForm.description}
                    onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                    rows="4"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white resize-none"
                    placeholder="Describe your key contributions..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveExperience}
                    className="flex-1 py-3.5 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition"
                  >
                    {editingExpIndex !== null ? 'Update' : 'Add Experience'}
                  </button>
                  <button
                    onClick={resetExpForm}
                    className="flex-1 py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserProfile;
