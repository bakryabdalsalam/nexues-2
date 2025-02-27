import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import Login from '../pages/Login';
import Register from '../pages/Register';
import UserDashboard from '../pages/UserDashboard';
import CompanyDashboard from '../pages/CompanyDashboard';
import AdminDashboard from '../pages/AdminDashboard';
import JobListings from '../pages/JobListings';
import JobDetails from '../pages/JobDetails';
import JobApplicationForm from '../components/forms/JobApplicationForm';
import UserProfileForm from '../components/forms/UserProfileForm';
import CompanyProfileForm from '../components/forms/CompanyProfileForm';
import JobPostForm from '../components/forms/JobPostForm';
import Unauthorized from '../pages/Unauthorized';
import ErrorBoundary from '../components/common/ErrorBoundary';

// Lazy-loaded admin components
const AdminUsers = lazy(() => import('../pages/admin/AdminUsers'));
const AdminJobs = lazy(() => import('../pages/admin/AdminJobs'));
const AdminApplications = lazy(() => import('../pages/admin/AdminApplications'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/jobs" element={<JobListings />} />
      <Route path="/jobs/:id" element={<JobDetails />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      {/* Protected User Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['USER']}>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/edit"
        element={
          <ProtectedRoute allowedRoles={['USER']}>
            <UserProfileForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs/:id/apply"
        element={
          <ProtectedRoute allowedRoles={['USER']}>
            <JobApplicationForm />
          </ProtectedRoute>
        }
      />
      
      {/* Protected Company Routes */}
      <Route
        path="/company"
        element={
          <ProtectedRoute allowedRoles={['COMPANY']}>
            <CompanyDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company/profile/edit"
        element={
          <ProtectedRoute allowedRoles={['COMPANY']}>
            <CompanyProfileForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company/jobs/create"
        element={
          <ProtectedRoute allowedRoles={['COMPANY']}>
            <JobPostForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company/jobs/:id/edit"
        element={
          <ProtectedRoute allowedRoles={['COMPANY']}>
            <JobPostForm isEditing />
          </ProtectedRoute>
        }
      />
      
      {/* Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ErrorBoundary>
              <AdminDashboard />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />
      
      {/* Additional Admin Routes */}
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ErrorBoundary>
              <Suspense fallback={<LoadingFallback />}>
                <AdminUsers />
              </Suspense>
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/jobs"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ErrorBoundary>
              <Suspense fallback={<LoadingFallback />}>
                <AdminJobs />
              </Suspense>
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/applications"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ErrorBoundary>
              <Suspense fallback={<LoadingFallback />}>
                <AdminApplications />
              </Suspense>
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />
      
      {/* Default Route */}
      <Route path="/" element={<JobListings />} />
    </Routes>
  );
};
