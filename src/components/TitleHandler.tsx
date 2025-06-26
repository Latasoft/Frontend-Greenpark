import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const TitleHandler = () => {
  const location = useLocation();

  useEffect(() => {
    const getTitle = () => {
      const path = location.pathname;
      
      if (path === '/') return 'Inicio';
      if (path === '/cursos') return 'Cursos';
      if (path === '/biblioteca') return 'Biblioteca';
      if (path === '/contacto') return 'Contacto';
      if (path === '/registro') return 'Registro';
      if (path === '/login') return 'Iniciar Sesión';
      if (path.startsWith('/admin')) return 'Panel Administrador';
      if (path.startsWith('/user')) return 'Panel Usuario';
      
      return 'GreenPark';
    };

    document.title = `${getTitle()} | GreenPark`;
  }, [location.pathname]);

  return null;
};

export default TitleHandler;
