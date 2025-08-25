import { useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { 
  UserIcon, AcademicCapIcon, EnvelopeIcon, 
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline';
import PageTitle from '../components/PageTitle';
import Profile from '../Admin-Panel/components/Profile';
import UserCourses from './components/UserCourses';
import Messages from './components/UserMessagesPage';

const UserPanel = () => {
  const [currentSection, setCurrentSection] = useState('profile');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { id: 'profile', name: 'Mi Perfil', icon: UserIcon },
    { id: 'courses', name: 'Cursos', icon: AcademicCapIcon },
    { id: 'messages', name: 'Mensajes', icon: EnvelopeIcon },
    { id: 'logout', name: 'Cerrar Sesión', icon: ArrowRightOnRectangleIcon }
  ];

  const handleMenuClick = (sectionId: string) => {
    if (sectionId === 'logout') {
      // Limpiar localStorage (o lo que uses para auth)
      localStorage.clear();
      // Redirigir a login o home
      navigate('/login');
      return;
    }
    setCurrentSection(sectionId);
    switch(sectionId) {
      case 'profile':
        navigate('/user/profile');
        break;
      case 'courses':
        navigate('/user/courses');
        break;
      case 'messages':
        navigate('/user/messages');
        break;
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-64px)] bg-gray-100 pt-0">
      <PageTitle title="Panel de Usuario" />

      {/* Overlay for mobile sidebar */}
      <div 
        className={`fixed inset-0 bg-black/50 z-20 lg:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar - fix height and top positioning */}
      <div className={`
        fixed lg:static top-16 bottom-0 left-0 z-30
        w-64 bg-[#1A3D33] text-white flex flex-col
        transform transition-transform duration-300 ease-in-out
        lg:transform-none lg:min-h-[calc(100vh-64px)] shadow-lg
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 border-b border-[#8BAE52]/20">
          <h2 className="text-2xl font-bold">Panel de Usuario</h2>
        </div>
        
        <nav className="mt-6 flex-1 flex flex-col">
          <div className="flex-1 space-y-1">
            {menuItems.slice(0, -1).map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={`w-full flex items-center px-4 py-3 text-left transition-colors ${
                    currentSection === item.id
                      ? 'bg-[#8BAE52] text-white font-medium'
                      : 'hover:bg-[#8BAE52]/10'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>
          
          <div className="border-t border-[#8BAE52]/20 pt-2 mt-2">
            {menuItems.slice(-1).map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className="w-full flex items-center px-4 py-3 text-left hover:bg-[#8BAE52]/10 transition-colors"
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col">
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
              {menuItems.find(item => item.id === currentSection)?.name || 'Panel de Usuario'}
            </h1>
          </div>
        </header>

        <main className="p-6 flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<Profile />} />
            <Route path="courses" element={<UserCourses />} />
            <Route path="messages" element={<Messages />} />
            <Route path="*" element={<div>Contenido en desarrollo</div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default UserPanel;
