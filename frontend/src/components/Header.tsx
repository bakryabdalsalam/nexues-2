import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Determine the dashboard link based on user role
  const getDashboardLink = () => {
    if (!user) return '/dashboard';
    
    switch (user.role) {
      case 'ADMIN':
        return '/admin';
      case 'COMPANY':
        return '/company';
      default:
        return '/dashboard';
    }
  };

  return (
    <header className="bg-white shadow">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-gray-800">
            Job Board
          </Link>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to={getDashboardLink()}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Dashboard
                </Link>
                {user.role === 'ADMIN' && (
                  <Link to="/admin" className="text-gray-600 hover:text-gray-800">
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-gray-800">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;