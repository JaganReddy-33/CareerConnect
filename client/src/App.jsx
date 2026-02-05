import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Toast from './components/Toast';

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
                  <Route path="/" element={<Home />} />
                  <Route path="/jobs" element={<Jobs />} />
                  <Route path="/job/:jobId" element={<JobDetail />} />
                  <Route path="/post-job" element={<PostJob />} />
                  <Route path="/post-job/:jobId" element={<PostJob />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/job/:jobId/applicants" element={<ApplicantsPage />} />
                  <Route path="/saved-jobs" element={<SavedJobs />} />
                  <Route path="/job-alerts" element={<JobAlerts />} />
                  <Route path="/recommended-jobs" element={<RecommendedJobs />} />
                  <Route path="/profile" element={<UserProfile />} />
                  <Route path="/employer-profile" element={<EmployerProfile />} />
                  <Route path="/profile/seeker/:userId" element={<JobSeekerProfile />} />
                  <Route path="/company/:employerId" element={<CompanyProfileView />} />
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
