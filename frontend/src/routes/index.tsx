import { Routes, Route } from 'react-router-dom';
import { JobList } from '../components/jobs/JobList';
import { JobDetails } from '../pages/JobDetails';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<JobList />} />
      <Route path="/jobs" element={<JobList />} />
      <Route path="/jobs/:id" element={<JobDetails />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/register" element={<RegisterForm />} />
      <Route
        path="/applications"
        element={
          <ProtectedRoute>
            <div>My Applications</div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};
