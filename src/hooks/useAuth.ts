import { useState, useEffect } from 'react';

interface User {
  correo: string;
  nombre: string;
  rol: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('userCorreo'); // en tu login guardas como 'userCorreo'
    const storedName = localStorage.getItem('userName');
    const storedRole = localStorage.getItem('userRole');

    if (storedUser && storedName && storedRole) {
      setUser({
        correo: storedUser,
        nombre: storedName,
        rol: storedRole,
      });
    }
  }, []);

  return { user };
}
