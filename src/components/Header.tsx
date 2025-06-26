import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const userRole = localStorage.getItem('userRole'); // Puede ser 'admin', 'alumno', etc.
  const userName = localStorage.getItem('userName') || '';

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase();

  const initials = getInitials(userName) || 'US';

  const handleRedirect = () => {
    if (userRole === 'admin') navigate('/admin/profile');
    else if (userRole === 'alumno') navigate('/user/profile');
    else if (userRole === 'docente') navigate('/docente');
    else if (userRole === 'apoderado') navigate('/apoderado');
    else navigate('/');
  };

  return (
    <header className="bg-white shadow-sm relative">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/">
              <img src={logo} alt="GreenPark Logo" className="h-12" />
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link to="/" className="text-[#1A3D33] hover:text-[#8BAE52] px-3 py-2 text-sm font-medium transition-colors">Inicio</Link>
              <Link to="/cursos" className="text-[#1A3D33] hover:text-[#8BAE52] px-3 py-2 text-sm font-medium transition-colors">Cursos</Link>
              <Link to="/biblioteca" className="text-[#1A3D33] hover:text-[#8BAE52] px-3 py-2 text-sm font-medium transition-colors">Biblioteca</Link>
              <Link to="/contacto" className="text-[#1A3D33] hover:text-[#8BAE52] px-3 py-2 text-sm font-medium transition-colors">Contacto</Link>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <button
                onClick={handleRedirect}
                className="bg-[#8BAE52] text-white w-10 h-10 rounded-full text-sm font-bold hover:bg-[#1A3D33] transition-colors flex items-center justify-center"
                title={userName}
              >
                {initials}
              </button>
            ) : (
              <>
                <Link 
                  to="/registro" 
                  className="bg-[#1A3D33] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#8BAE52] transition-colors"
                >
                  Registrarse
                </Link>
                <Link 
                  to="/login" 
                  className="border border-[#F0F0F0] text-[#1A3D33] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#F0F0F0] transition-colors"
                >
                  Iniciar sesión
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-[#1A3D33] hover:text-[#8BAE52] p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
                />
              </svg>
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
