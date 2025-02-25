import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { JobList } from '../components/jobs/JobList';
import { JobDetail } from '../pages/JobDetail';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterPage } from '../pages/RegisterPage';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { Dashboard } from '../pages/Dashboard';
import { Profile } from '../pages/Profile';
import { MyApplications } from '../pages/MyApplications';
import { AdminLayout } from '../components/admin/AdminLayout';
import { AdminDashboard } from '../components/admin/Dashboard';
import { UserManagement } from '../components/admin/UserManagement';
import { ApplicationManager } from '../components/admin/ApplicationManager';
import { JobTable } from '../components/admin/JobTable';
import { ReportGenerator } from '../components/admin/ReportGenerator';
import { EmailTemplates } from '../components/admin/EmailTemplates';
import { LandingPage } from '../pages/LandingPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/jobs" element={<JobList />} />
      <Route path="/jobs/:id" element={<JobDetail />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/applications"
        element={
          <ProtectedRoute>
            <MyApplications />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="applications" element={<ApplicationManager />} />
        <Route path="jobs" element={<JobTable />} />
        <Route path="reports" element={<ReportGenerator />} />
        <Route path="email-templates" element={<EmailTemplates />} />
      </Route>

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
