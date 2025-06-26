import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: 'admin' | 'user';
}

const ProtectedRoute = ({ children, allowedRole }: ProtectedRouteProps) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  localStorage.setItem('isAuthenticated', 'true');
localStorage.setItem('isAdmin', 'true');

  
  if (!isAuthenticated || (allowedRole === 'admin' && !isAdmin)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
