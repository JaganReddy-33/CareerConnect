import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Github, Linkedin, Globe, ArrowLeft, Download, Edit2, Trash2, Plus, X } from 'lucide-react';
import apiClient from '../api/axios';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import LoadingSkeleton from '../components/LoadingSkeleton';

const JobSeekerProfile = () => {
  const { userId } = useParams();
  const { showError, showSuccess } = useToast();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [experiences, setExperiences] = useState([]);
  const [showExpForm, setShowExpForm] = useState(false);
  const [expForm, setExpForm] = useState({ company: '', position: '', duration: '', description: '' });
  const [editingExpIndex, setEditingExpIndex] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const isOwnProfile = user?._id === userId;

  useEffect(() => {
    fetchProfile();
  }, [userId, showError]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/users/${userId}`);
      setProfile(response.data.user);
      setExperiences(response.data.user.experience || []);
    } catch (error) {
      showError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveExperience = async () => {
    if (!expForm.company.trim() || !expForm.position.trim() || !expForm.duration.trim()) {
      showError('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      let updatedExperiences;

      if (editingExpIndex !== null) {
        updatedExperiences = [...experiences];
        updatedExperiences[editingExpIndex] = expForm;
      } else {
        updatedExperiences = [...experiences, expForm];
      }

      await apiClient.put('/users/me', { experience: updatedExperiences });
      setExperiences(updatedExperiences);
      showSuccess(editingExpIndex !== null ? 'Experience updated successfully' : 'Experience added successfully');
      
      setExpForm({ company: '', position: '', duration: '', description: '' });
      setEditingExpIndex(null);
      setShowExpForm(false);
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to save experience');
    } finally {
      setSaving(false);
    }
  };

  const handleEditExperience = (index) => {
    setExpForm(experiences[index]);
    setEditingExpIndex(index);
    setShowExpForm(true);
  };

  const handleDeleteExperience = async (index) => {
    if (!window.confirm('Are you sure you want to delete this experience?')) {
      return;
    }

    try {
      setSaving(true);
      const updatedExperiences = experiences.filter((_, i) => i !== index);
      await apiClient.put('/users/me', { experience: updatedExperiences });
      setExperiences(updatedExperiences);
      showSuccess('Experience deleted successfully');
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to delete experience');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenExpForm = () => {
    setExpForm({ company: '', position: '', duration: '', description: '' });
    setEditingExpIndex(null);
    setShowExpForm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <LoadingSkeleton count={5} type="card" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300 text-lg">Profile not found</p>
          <Link to="/jobs" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="-1" className="text-primary-600 hover:text-primary-700 mb-6 inline-flex items-center gap-2">
          <ArrowLeft size={20} /> Back
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <div className="flex flex-col items-center">
                {profile.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt={profile.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary-200 dark:border-primary-800 mb-4"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-5xl font-bold mb-4">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center">{profile.name}</h1>
                {profile.location && (
                  <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-2">
                    <MapPin size={16} />
                    {profile.location.city}, {profile.location.country}
                  </p>
                )}
              </div>

              <div className="mt-8 space-y-3">
                {profile.email && (
                  <a href={`mailto:${profile.email}`} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                    <Mail size={20} className="text-primary-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 break-all">{profile.email}</span>
                  </a>
                )}

                {profile.phone && (
                  <a href={`tel:${profile.phone}`} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                    <Phone size={20} className="text-primary-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{profile.phone}</span>
                  </a>
                )}
              </div>

              {profile.socialLinks && (Object.values(profile.socialLinks).some(link => link)) && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Social Links</h3>
                  <div className="space-y-2">
                    {profile.socialLinks.linkedin && (
                      <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary-600 hover:text-primary-700">
                        <Linkedin size={20} /> LinkedIn
                      </a>
                    )}
                    {profile.socialLinks.github && (
                      <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary-600 hover:text-primary-700">
                        <Github size={20} /> GitHub
                      </a>
                    )}
                    {profile.socialLinks.portfolio && (
                      <a href={profile.socialLinks.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary-600 hover:text-primary-700">
                        <Globe size={20} /> Portfolio
                      </a>
                    )}
                  </div>
                </div>
              )}

              {profile.resume && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={async () => {
                      try {
                        const response = await apiClient.get(`/users/${profile._id}/resume/download`, {
                          responseType: 'blob',
                        });
                        const url = window.URL.createObjectURL(new Blob([response.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', profile.resume.fileName || 'resume.pdf');
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                        window.URL.revokeObjectURL(url);
                        showSuccess('Resume downloaded successfully');
                      } catch (error) {
                        showError('Failed to download resume');
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 dark:bg-primary-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition font-medium"
                  >
                    <Download size={20} /> Download Resume
                  </button>
                </div>
              )}
            </div>

            <div className="md:col-span-2 space-y-8">
              {profile.bio && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">About</h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{profile.bio}</p>
                </motion.div>
              )}

              {profile.skills && profile.skills.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <motion.span key={index} whileHover={{ scale: 1.05 }} className="px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
                        {skill}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}

              {(experiences && experiences.length > 0 || isOwnProfile) && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Experience</h2>
                    {isOwnProfile && (
                      <button
                        onClick={handleOpenExpForm}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm font-medium"
                      >
                        <Plus size={16} /> Add
                      </button>
                    )}
                  </div>
                  {experiences && experiences.length > 0 ? (
                    <div className="space-y-4">
                      {experiences.map((exp, index) => (
                        <motion.div key={index} whileHover={{ x: 5 }} className="p-4 border-l-4 border-primary-600 bg-gray-50 dark:bg-gray-700/50 rounded-r-lg flex justify-between items-start group">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{exp.position}</h3>
                            <p className="text-sm text-primary-600 dark:text-primary-400">{exp.company}</p>
                            {exp.duration && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{exp.duration}</p>}
                            {exp.description && <p className="text-gray-700 dark:text-gray-300 mt-2 text-sm">{exp.description}</p>}
                          </div>
                          {isOwnProfile && (
                            <div className="flex gap-2 ml-4 opacity-0 group-hover:opacity-100 transition">
                              <button
                                onClick={() => handleEditExperience(index)}
                                className="p-1 text-primary-600 hover:bg-primary-100 dark:hover:bg-gray-600 rounded transition"
                                title="Edit experience"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteExperience(index)}
                                className="p-1 text-error-600 hover:bg-error-100 dark:hover:bg-gray-600 rounded transition"
                                title="Delete experience"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  ) : isOwnProfile && (
                    <div className="text-center py-8">
                      <p className="text-gray-600 dark:text-gray-400 mb-4">No experience added yet</p>
                      <button
                        onClick={handleOpenExpForm}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
                      >
                        <Plus size={18} /> Add Your First Experience
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {showExpForm && isOwnProfile && (
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
                  disabled={saving}
                  className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition font-semibold"
                >
                  {saving ? 'Saving...' : editingExpIndex !== null ? 'Update Experience' : 'Add Experience'}
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

export default JobSeekerProfile;
