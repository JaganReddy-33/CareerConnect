import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Toast from './components/Toast';
import { motion } from 'framer-motion';

import Home from './pages/Home';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import PostJob from './pages/PostJob';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import SavedJobs from './pages/SavedJobs';
import JobAlerts from './pages/JobAlerts';
import RecommendedJobs from './pages/RecommendedJobs';
import UserProfile from './pages/UserProfile';
import EmployerProfile from './pages/EmployerProfile';
import ApplicantsPage from './pages/ApplicantsPage';
import JobSeekerProfile from './pages/JobSeekerProfile';
import CompanyProfileView from './pages/CompanyProfileView';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AdminUsers from './pages/Admin/Users';
import AdminJobs from './pages/Admin/Jobs';
import AdminSettings from './pages/Admin/Settings';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <ToastProvider>
            <div className="flex flex-col min-h-screen">
              <Header />

              <main className="flex-1">
                <Routes>

                  {/* Public Routes */}
                  <Route
                    path="/"
                    element={
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Home />
                      </motion.div>
                    }
                  />

                  <Route
                    path="/jobs"
                    element={
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Jobs />
                      </motion.div>
                    }
                  />

                  <Route path="/job/:jobId" element={<JobDetail />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />

                  {/* Employer Routes */}
                  <Route
                    path="/post-job"
                    element={
                      <ProtectedRoute roles={["employer"]}>
                        <PostJob />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/post-job/:jobId"
                    element={
                      <ProtectedRoute roles={["employer"]}>
                        <PostJob />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/job/:jobId/applicants"
                    element={
                      <ProtectedRoute roles={["employer"]}>
                        <ApplicantsPage />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/employer-profile"
                    element={
                      <ProtectedRoute roles={["employer"]}>
                        <EmployerProfile />
                      </ProtectedRoute>
                    }
                  />

                  {/* Dashboard Routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute roles={["jobSeeker", "employer", "admin"]}>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/saved-jobs"
                    element={
                      <ProtectedRoute roles={["jobSeeker"]}>
                        <SavedJobs />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/job-alerts"
                    element={
                      <ProtectedRoute roles={["jobSeeker"]}>
                        <JobAlerts />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/recommended-jobs"
                    element={
                      <ProtectedRoute roles={["jobSeeker"]}>
                        <RecommendedJobs />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute roles={["jobSeeker", "employer", "admin"]}>
                        <UserProfile />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/profile/seeker/:userId"
                    element={
                      <ProtectedRoute roles={["employer", "admin"]}>
                        <JobSeekerProfile />
                      </ProtectedRoute>
                    }
                  />

                  {/* Company Route */}
                  <Route
                    path="/company/:employerId"
                    element={<CompanyProfileView />}
                  />

                  {/* Admin Routes */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute roles={["admin"]}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/admin/users"
                    element={
                      <ProtectedRoute roles={["admin"]}>
                        <AdminUsers />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/admin/jobs"
                    element={
                      <ProtectedRoute roles={["admin"]}>
                        <AdminJobs />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/admin/settings"
                    element={
                      <ProtectedRoute roles={["admin"]}>
                        <AdminSettings />
                      </ProtectedRoute>
                    }
                  />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" />} />

                </Routes>
              </main>

              <Footer />
              <Toast />
            </div>
          </ToastProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
