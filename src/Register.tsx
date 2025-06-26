import { useState } from 'react';
import { Link } from 'react-router-dom';
import imgRegister from './assets/img-register.jpg';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.password !== formData.confirmarPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    try {
      const response = await fetch('https://greenpark-backend.onrender.com/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Error al registrar');
      }

      const data = await response.json();
      console.log('Usuario registrado:', data);
      alert('¡Cuenta creada exitosamente!');

      // Limpia el formulario reseteando el estado a valores iniciales
      setFormData({
        nombre: '',
        apellido: '',
        correo: '',
        fechaNacimiento: '',
        rol: '',
        password: '',
        confirmarPassword: ''
      });
      
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      alert('Hubo un problema al registrarse');
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
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#8BAE52] focus:border-[#8BAE52]"
                  placeholder="Ingresa tu nombre"
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
                />
              </div>
              <input
                type="email"
                name="correo" // ✅ antes: "email"
                value={formData.correo}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#8BAE52] focus:border-[#8BAE52]"
                placeholder="correo@ejemplo.com"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de nacimiento</label>
                <input
                  type="date"
                  name="fechaNacimiento"
                  value={formData.fechaNacimiento}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#8BAE52] focus:border-[#8BAE52]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de cuenta</label>
                <select
                  name="rol" // ✅ antes: "tipoCuenta"
                  value={formData.rol}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#8BAE52] focus:border-[#8BAE52]"
                >
                  <option value="">Selecciona una opción</option>
                  <option value="docente">Docente</option>
                  <option value="estudiante">Estudiante</option>
                  <option value="apoderado">Apoderado</option>
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
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#1A3D33] text-white py-2 rounded-md hover:bg-[#8BAE52] transition-colors"
              >
                Crear cuenta
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
  )
}

export default Register
