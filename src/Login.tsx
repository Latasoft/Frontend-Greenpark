import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import fondoInicio from './assets/fondo-inicio.jpg'; 
import axios from 'axios';

const Login: React.FC = () => {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('https://greenpark-backend.onrender.com/api/auth/login', {
        correo,
        password,
      });

      const { user, token } = response.data;

      localStorage.clear();
      localStorage.setItem('token', token);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userName', `${user.nombre} ${user.apellido}`);
      localStorage.setItem('userCorreo', user.correo);
      localStorage.setItem('userFechaNacimiento', user.fechaNacimiento);
      localStorage.setItem('userRole', user.rol);
      localStorage.setItem('isAdmin', user.rol === 'admin' ? 'true' : 'false');
      localStorage.setItem('imagenPerfil', user.imagenPerfil || '');  // <-- Línea añadida

      setLoading(false);

      if (user.rol === 'admin') {
        navigate('/admin');
      } else if (user.rol === 'docente') {
        navigate('/docente');
      } else if (user.rol === 'alumno') {
        navigate('/user');
      } else if (user.rol === 'apoderado') {
        navigate('/apoderado');
      } else {
        setError('Rol desconocido');
      }
    } catch (err: any) {
      setLoading(false);

      if (err.response) {
        // El servidor respondió con un error
        setError(err.response.data.message || 'Error en el servidor');
      } else if (err.request) {
        // Se hizo la petición pero no hubo respuesta
        setError('No se pudo conectar con el servidor. Verifica que esté encendido.');
      } else {
        // Otro error inesperado
        setError('Error inesperado: ' + err.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-[32px] text-[#1A3D33] font-bold">Iniciar Sesión</h1>
            <div className="w-24 h-1 bg-[#8BAE52] mx-auto mt-2"></div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#8BAE52] focus:border-[#8BAE52]"
                  placeholder="correo@ejemplo.com"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#8BAE52] focus:border-[#8BAE52]"
                  placeholder="Ingresar contraseña"
                  required
                  disabled={loading}
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                className={`w-full py-2 rounded-md transition-colors ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#1A3D33] hover:bg-[#8BAE52] text-white'}`}
                disabled={loading}
              >
                {loading ? 'Ingresando...' : 'Iniciar sesión'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <p className="text-gray-600">
                ¿No tienes una cuenta?{' '}
                <Link to="/registro" className="text-[#8BAE52] hover:text-[#1A3D33] font-medium">
                  Regístrate
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:block w-1/2 relative">
        <div className="absolute inset-0 bg-[#1A3D33] opacity-85"></div>
        <img 
          src={fondoInicio} 
          alt="Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-12">
          <h2 className="text-3xl font-bold mb-4">
            Bienvenido a Cursos de Greenpark AcademIA
          </h2>
          <p className="text-center text-lg">
            Accede a tu cuenta para continuar tu aprendizaje en sostenibilidad y desarrollo verde
          </p>
          <button className="mt-8 px-6 py-2 border-2 border-white rounded-md hover:bg-white hover:text-[#1A3D33] transition-colors">
            Explorar cursos
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
