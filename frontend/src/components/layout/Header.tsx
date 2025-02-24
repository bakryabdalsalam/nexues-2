import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store';

export const Header = () => {
  const { user, logout } = useAuthStore();

  return (
    <header className="bg-white shadow">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-900">
              Job Board
            </Link>
            <div className="hidden md:block ml-10">
              <Link to="/jobs" className="text-gray-500 hover:text-gray-900 px-3 py-2">
                Jobs
              </Link>
              {user && (
                <Link to="/applications" className="text-gray-500 hover:text-gray-900 px-3 py-2">
                  My Applications
                </Link>
              )}
            </div>
          </div>
          
          <div>
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-500">{user.email}</span>
                <button 
                  onClick={logout}
                  className="text-gray-500 hover:text-gray-900"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-x-4">
                <Link 
                  to="/login"
                  className="text-gray-500 hover:text-gray-900"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};
