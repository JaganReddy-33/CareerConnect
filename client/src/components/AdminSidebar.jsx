import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Users, FileText, Settings } from 'lucide-react';

const AdminSidebar = ({ className = '' }) => {
  return (
    <aside className={`rounded-2xl bg-white dark:bg-gray-800 p-4 shadow-sm border border-slate-100 dark:border-gray-700 ${className}`}>
      <div className="mb-6">
        <h3 className="text-sm uppercase tracking-wide text-slate-500 font-semibold">Admin</h3>
        <p className="text-xs text-slate-400 mt-1">Platform console</p>
      </div>

      <nav className="space-y-2">
        <Link to="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition">
          <Home className="w-5 h-5 text-slate-600" />
          <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Overview</span>
        </Link>

        <Link to="/admin/users" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition">
          <Users className="w-5 h-5 text-slate-600" />
          <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Users</span>
        </Link>

        <Link to="/admin/jobs" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition">
          <FileText className="w-5 h-5 text-slate-600" />
          <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Jobs</span>
        </Link>

        <Link to="/admin/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition">
          <Settings className="w-5 h-5 text-slate-600" />
          <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Settings</span>
        </Link>
      </nav>

      <div className="mt-6 border-t border-slate-100 dark:border-gray-700 pt-4 text-xs text-slate-500">
        <p>Quick links and tools for administrators.</p>
      </div>
    </aside>
  );
};

export default AdminSidebar;
