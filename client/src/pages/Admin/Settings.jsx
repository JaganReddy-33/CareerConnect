import React, { useEffect, useState } from 'react';
import apiClient from '../../api/axios';
import { useToast } from '../../context/ToastContext';

const AdminSettings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/settings');
      setSettings(res.data.settings || {});
    } catch (err) {
      showError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await apiClient.post('/admin/settings', settings);
      showSuccess('Settings saved');
    } catch (err) {
      showError('Failed to save settings');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-sm text-slate-500">Platform configuration</p>
      </div>

      {loading ? (
        <div className="py-12 text-center">Loading...</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Site Title</label>
            <input value={settings.siteTitle || ''} onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })} className="w-full border px-3 py-2 rounded-lg" />
          </div>
          <div className="text-right">
            <button onClick={handleSave} className="px-4 py-2 bg-primary-600 text-white rounded-lg">Save</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
