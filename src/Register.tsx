import { useState } from 'react';
import { Link } from 'react-router-dom';
import imgRegister from './assets/img-register.jpg';
import axios from 'axios';

const baseURL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://greenpark-backend-0ua6.onrender.com";

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    fechaNacimiento: '',
    rol: '',
    password: '',
    confirmarPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
  };

  const validateForm = () => {
    if (!formData.nombre.trim() ||
        !formData.apellido.trim() ||
        !formData.correo.trim() ||
        !formData.fechaNacimiento.trim() ||
        !formData.rol.trim() ||
        !formData.password.trim() ||
        !formData.confirmarPassword.trim()) {
      setError('Por favor, completa todos los campos.');
      return false;
    }
    if (formData.password !== formData.confirmarPassword) {
      setError('Las contraseñas no coinciden.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const postData = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        correo: formData.correo.trim(),
        fechaNacimiento: formData.fechaNacimiento,
        rol: formData.rol.trim(),
        password: formData.password,
        confirmarPassword: formData.confirmarPassword,
      };

      console.log('Datos que se enviarán:', postData);

      await axios.post(`${baseURL}/api/auth/register`, postData);

      setSuccess('¡Cuenta creada exitosamente!');
      setFormData({
        nombre: '',
        apellido: '',
        correo: '',
        fechaNacimiento: '',
        rol: '',
        password: '',
        confirmarPassword: ''
      });
    } catch (err: any) {
      console.error('Error al enviar formulario:', err);
      setError(err.response?.data?.message || 'Hubo un problema al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-[32px] text-[#1A3D33] font-bold">Registrarse</h1>
            <div className="w-24 h-1 bg-[#8BAE52] mx-auto mt-2"></div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#8BAE52] focus:border-[#8BAE52]"
                  placeholder="Ingresa tu nombre"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Apellido</label>
                <input
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#8BAE52] focus:border-[#8BAE52]"
                  placeholder="Ingresa tu apellido"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Correo electrónico</label>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#8BAE52] focus:border-[#8BAE52]"
                  placeholder="correo@ejemplo.com"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de nacimiento</label>
                <input
                  type="date"
                  name="fechaNacimiento"
                  value={formData.fechaNacimiento}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#8BAE52] focus:border-[#8BAE52]"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de cuenta</label>
                <select
                  name="rol"
                  value={formData.rol}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#8BAE52] focus:border-[#8BAE52]"
                  required
                  disabled={loading}
                >
                  <option value="">Selecciona una opción</option>
                  <option value="docente">Docente</option>
                  <option value="estudiante">Estudiante</option>
                  <option value="comunidad">Comunidad</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#8BAE52] focus:border-[#8BAE52]"
                  placeholder="Crea tu contraseña"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Contraseña</label>
                <input
                  type="password"
                  name="confirmarPassword"
                  value={formData.confirmarPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#8BAE52] focus:border-[#8BAE52]"
                  placeholder="Repite tu contraseña"
                  required
                  disabled={loading}
                />
              </div>

              {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
              {success && <p className="text-green-600 text-sm mb-2">{success}</p>}

              <button
                type="submit"
                className={`w-full py-2 rounded-md transition-colors ${
                  loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#1A3D33] hover:bg-[#8BAE52] text-white'
                }`}
                disabled={loading}
              >
                {loading ? 'Registrando...' : 'Crear cuenta'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <p className="text-gray-600">
                ¿Ya tienes una cuenta?{' '}
                <Link to="/login" className="text-[#8BAE52] hover:text-[#1A3D33] font-medium">
                  Ingresa
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:block w-1/2 relative">
        <div className="absolute inset-0 bg-[#1A3D33] opacity-85"></div>
        <img
          src={imgRegister}
          alt="Register Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-12">
          <h2 className="text-3xl font-bold mb-4">
            Únete a la comunidad Greenpark
          </h2>
          <p className="text-center text-lg">
            Sé parte de una red de profesionales comprometidos con el desarrollo sostenible y la innovación verde
          </p>
          <button className="mt-8 px-6 py-2 border-2 border-white rounded-md hover:bg-white hover:text-[#1A3D33] transition-colors">
            Conocer más
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
