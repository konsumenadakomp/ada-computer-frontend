import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const getActiveClass = (path: string) => {
    return location.pathname === path ? 'text-white font-bold' : 'text-blue-100 hover:text-white';
  };

  return (
    <nav className="bg-blue-600 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <span className="text-white text-xl font-bold">A.D.A KOMPUTER</span>
          </Link>
          
          <div className="flex space-x-8">
            <Link to="/" className={`${getActiveClass('/')} transition-colors duration-200`}>
              Input Service
            </Link>
            <Link to="/track" className={`${getActiveClass('/track')} transition-colors duration-200`}>
              Track Service
            </Link>
            {isAuthenticated ? (
              <Link to="/admin" className={`${getActiveClass('/admin')} transition-colors duration-200`}>
                Panel Admin
              </Link>
            ) : (
              <Link to="/login" className={`${getActiveClass('/login')} transition-colors duration-200`}>
                Masuk sebagai Admin
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 