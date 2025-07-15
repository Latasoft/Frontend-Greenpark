import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Profile from '../Admin-Panel/components/Profile';
import UserCourses from './components/UserCourses';
import Messages from './components/UserMessagesPage';
import PageTitle from '../components/PageTitle';

const UserPanel = () => {
  const [currentSection, setCurrentSection] = useState('profile');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { id: 'profile', name: 'Mi Perfil', icon: 'user' },
    { id: 'courses', name: 'Cursos', icon: 'academic-cap' },
    { id: 'messages', name: 'Mensajes', icon: 'mail' },
    { id: 'logout', name: 'Cerrar Sesión', icon: 'logout' }
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
    <div className="relative flex h-screen bg-gray-100">
      <PageTitle title="Panel de Usuario" />

      <div 
        className={`fixed inset-0 bg-black/50 z-20 lg:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}
        onClick={() => setSidebarOpen(false)}
      />

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
        <nav className="mt-8 flex flex-col flex-1">
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
          <div className="mt-auto border-t border-[#8BAE52]/20">
            <button
              onClick={() => handleMenuClick('logout')}
              className="w-full flex items-center px-6 py-3 text-left hover:bg-[#8BAE52]/10"
            >
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </nav>
      </div>

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
        <main className="p-6">
          <Routes>
            <Route path="/profile" element={<Profile />} />
            <Route path="/courses" element={<UserCourses />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="*" element={<div>Contenido en desarrollo</div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default UserPanel;
