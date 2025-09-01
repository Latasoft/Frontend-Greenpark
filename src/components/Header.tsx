import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo-nuevo-negro.png';
import Swal from 'sweetalert2';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'; // Importar icono

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const userRole = (localStorage.getItem('userRole') || '').toLowerCase(); // Puede ser 'admin', 'alumno', etc.
  const userName = localStorage.getItem('userName') || '';

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase();

  const initials = getInitials(userName) || 'US';

  const handleRedirect = () => {
    console.log('userRole:', userRole);
    if (userRole === 'admin') {
      navigate('/admin/profile');
    } else if (['estudiante', 'docente', 'comunidad'].includes(userRole)) {
      navigate('/user/profile'); // Changed from /user to /user/profile
    } else {
      navigate('/');
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro que deseas cerrar tu sesión?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#8BAE52',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        navigate('/login');
      }
    });
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
              <Link
                to="/"
                className="text-[#1A3D33] hover:text-[#8BAE52] px-3 py-2 text-sm font-medium transition-colors"
              >
                Inicio
              </Link>

              <div className="relative group">
                <Link
                  to="/cursos"
                  className="text-[#1A3D33] hover:text-[#8BAE52] px-3 py-2 text-sm font-medium transition-colors block"
                >
                  Cursos
                </Link>
                <div className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-md opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 z-50">
                  <Link
                    to="/cursos/dirigido/docente"
                    className="block px-4 py-2 text-sm text-[#1A3D33] hover:bg-[#F0F0F0] transition-colors"
                  >
                    Para Docentes
                  </Link>
                  <Link
                    to="/cursos/dirigido/estudiante"
                    className="block px-4 py-2 text-sm text-[#1A3D33] hover:bg-[#F0F0F0] transition-colors"
                  >
                    Para Estudiantes
                  </Link>
                  <Link
                    to="/cursos/dirigido/comunidad"
                    className="block px-4 py-2 text-sm text-[#1A3D33] hover:bg-[#F0F0F0] transition-colors"
                  >
                    Para Comunidad
                  </Link>
                </div>
              </div>

              <Link
                to="/biblioteca"
                className="text-[#1A3D33] hover:text-[#8BAE52] px-3 py-2 text-sm font-medium transition-colors"
              >
                Biblioteca
              </Link>
              <Link
                to="/contacto"
                className="text-[#1A3D33] hover:text-[#8BAE52] px-3 py-2 text-sm font-medium transition-colors"
              >
                Contacto
              </Link>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <button
                  onClick={handleRedirect}
                  className="bg-[#8BAE52] text-white w-10 h-10 rounded-full text-sm font-bold hover:bg-[#1A3D33] transition-colors flex items-center justify-center"
                  title={userName}
                >
                  {initials}
                </button>

                <button
                  onClick={handleLogout}
                  className="text-[#1A3D33] hover:text-red-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  title="Cerrar sesión"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                </button>
              </>
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
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    isMenuOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16M4 18h16"
                  }
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
