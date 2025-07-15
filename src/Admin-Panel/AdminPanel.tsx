import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Profile from './components/Profile';
import Courses from './components/Courses';
import Records from './components/Records';
import CourseCreator from './components/CourseCreator';
import Messages from './components/AdminMessagesPage';
import Library from './components/Library';
import PageTitle from '../components/PageTitle';

const AdminPanel = () => {
  const [currentSection, setCurrentSection] = useState('profile');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('isAdmin');
    navigate('/login');
  };

  const menuItems = [
    { id: 'profile', name: 'Mi Perfil', icon: 'user' },
    { id: 'courses', name: 'Mis Cursos', icon: 'academic-cap' },
    { id: 'records', name: 'Registros', icon: 'document-text' },
    { id: 'messages', name: 'Mensajes', icon: 'chat' },
    { id: 'library', name: 'Biblioteca', icon: 'book' },
    { id: 'logout', name: 'Cerrar Sesión', icon: 'logout' }
  ];

  const handleMenuClick = (sectionId: string) => {
    if (sectionId === 'logout') {
      logout();
      return;
    }
    setCurrentSection(sectionId);
    switch(sectionId) {
      case 'courses':
        navigate('/admin/courses');
        break;
      case 'profile':
        navigate('/admin/profile');
        break;
      case 'records':
        navigate('/admin/records');
        break;
      case 'messages':
        navigate('/admin/messages');
        break;
      case 'library':
        navigate('/admin/library');
        break;
    }
  };

  return (
    <div className="relative flex h-screen bg-gray-100">
      <PageTitle title="Panel de Administrador" />

      {/* Overlay para sidebar en móvil */}
      <div 
        className={`fixed inset-0 bg-black/50 z-20 lg:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 bg-[#1A3D33] text-white 
        transform transition-transform duration-300 ease-in-out
        lg:transform-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4">
          <h2 className="text-2xl font-bold">Panel de Usuario</h2>
        </div>
        <nav className="mt-8 flex-1 flex flex-col">
          <div className="flex-1">
            {menuItems.slice(0, -1).map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center px-6 py-3 text-left ${
                  currentSection === item.id
                    ? 'bg-[#8BAE52] text-white'
                    : 'hover:bg-[#8BAE52]/10'
                }`}
              >
                <span>{item.name}</span>
              </button>
            ))}
          </div>
          <div className="border-t border-[#8BAE52]/20">
            {menuItems.slice(-1).map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className="w-full flex items-center px-6 py-3 text-left hover:bg-[#8BAE52]/10"
              >
                <span>{item.name}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10">
          <div className="px-6 py-4 flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden mr-4 text-gray-500 hover:text-gray-700"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-2xl font-semibold text-[#1A3D33]">
              {menuItems.find(item => item.id === currentSection)?.name}
            </h1>
          </div>
        </header>

        {/* Main con scroll y altura flexible */}
        <main className="p-6 flex-1 overflow-auto">
          <Routes>
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/new" element={<CourseCreator />} />
            <Route path="/profile" element={<Profile isAdminPanel={true} />} />
            <Route path="/records" element={<Records />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/library" element={<Library />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
