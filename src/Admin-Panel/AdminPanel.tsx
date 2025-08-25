import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Profile from './components/Profile';
import Courses from './components/Courses';
import Records from './components/Records';
import CourseCreator from './components/CourseCreator';
import Messages from './components/AdminMessagesPage';
import Library from './components/Library';
import PageTitle from '../components/PageTitle';
import { 
  UserIcon, AcademicCapIcon, DocumentTextIcon, ChatBubbleLeftIcon, 
  BookOpenIcon, ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline';

const AdminPanel = () => {
  const [currentSection, setCurrentSection] = useState('profile');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [contentFading, setContentFading] = useState(false);

  // Add this effect to trigger animations on component mount
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('isAdmin');
    navigate('/login');
  };

  const menuItems = [
    { id: 'profile', name: 'Mi Perfil', icon: UserIcon },
    { id: 'courses', name: 'Mis Cursos', icon: AcademicCapIcon },
    { id: 'records', name: 'Registros', icon: DocumentTextIcon },
    { id: 'messages', name: 'Mensajes', icon: ChatBubbleLeftIcon },
    { id: 'library', name: 'Biblioteca', icon: BookOpenIcon },
    { id: 'logout', name: 'Cerrar Sesión', icon: ArrowRightOnRectangleIcon }
  ];

  const handleMenuClick = (sectionId: string) => {
    if (sectionId === 'logout') {
      logout();
      return;
    }
    
    if (currentSection !== sectionId) {
      // Fade out content
      setContentFading(true);
      
      // Change section and navigate after a short delay
      setTimeout(() => {
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
        
        // Fade content back in
        setTimeout(() => setContentFading(false), 100);
      }, 300);
    }
  };

  return (
    <div className="relative flex min-h-screen bg-gray-100">
      <PageTitle title="Panel de Administrador" />

      {/* Animated overlay with blur effect */}
      <div 
        className={`fixed inset-0 bg-black z-20 lg:hidden transition-opacity duration-300 ease-in-out ${
          isSidebarOpen ? 'opacity-50 backdrop-blur-sm' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Animated sidebar */}
      <div 
        className={`
          fixed lg:static top-0 bottom-0 left-0 z-30
          w-64 bg-[#1A3D33] text-white flex flex-col
          transition-all duration-300 ease-in-out lg:shadow-xl
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isLoaded ? 'animate-slide-in' : 'opacity-0'}
        `}
      >
        <div className="p-4 border-b border-[#8BAE52]/20">
          <h2 className="text-2xl font-bold">Panel de Admin</h2>
        </div>
        
        <nav className="mt-6 flex-1 flex flex-col">
          <div className="flex-1 space-y-1">
            {menuItems.slice(0, -1).map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={`w-full flex items-center px-4 py-3 text-left transition-colors animate-fade-in`}
                  style={{ animationDelay: `${150 + index * 75}ms` }}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <span className={currentSection === item.id ? 
                    'bg-[#8BAE52] text-white font-medium w-full py-2 px-3 rounded-md transition-colors duration-300' : 
                    'hover:bg-[#8BAE52]/10 w-full py-2 px-3 rounded-md transition-colors duration-300'
                  }>
                    {item.name}
                  </span>
                </button>
              );
            })}
          </div>
          
          <div className="border-t border-[#8BAE52]/20 pt-2 mt-2">
            {menuItems.slice(-1).map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className="w-full flex items-center px-4 py-3 text-left hover:bg-[#8BAE52]/10 transition-colors animate-fade-in"
                  style={{ animationDelay: '500ms' }}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Content area with animations */}
      <div className={`flex-1 flex flex-col overflow-hidden ${isLoaded ? 'animate-fade-in animation-delay-300' : 'opacity-0'}`}>
        {/* Header with animation */}
        <header className={`bg-white shadow-sm z-10 ${isLoaded ? 'animate-slide-up animation-delay-300' : 'opacity-0'}`}>
          <div className="px-6 py-4 flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden mr-4 text-gray-500 hover:text-gray-700 hover:scale-110 transition-all duration-200"
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

        {/* Main content with animation */}
        <main className={`p-6 flex-1 transition-opacity duration-300 ease-in-out ${contentFading ? 'opacity-0' : 'opacity-100'}`}>
          <Routes>
            <Route path="/" element={<Navigate to="/admin/profile" replace />} />
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
