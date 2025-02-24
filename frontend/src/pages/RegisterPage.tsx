import React, { Suspense } from 'react';
import { Link } from 'react-router-dom';
import { RegisterForm } from '../components/auth/RegisterForm';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const RegisterPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              sign in to your account
            </Link>
          </p>
        </div>
        
        <ErrorBoundary fallback={<div>Something went wrong loading the registration form.</div>}>
          <Suspense fallback={<LoadingSkeleton rows={4} />}>
            <RegisterForm />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
};
