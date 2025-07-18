import { useEffect, useState } from 'react';
import axios from 'axios';

interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  fechaNacimiento: string;
  rol: string;
  aprobado: boolean;
}

const baseURL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://greenpark-backend-0ua6.onrender.com";

const Records = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsuarios = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No tienes token de autenticación. Por favor inicia sesión.');
        setLoading(false);
        return;
      }

      const res = await axios.get(`${baseURL}/api/auth/users`, {
        headers: {
          Authorization: `Bearer ${token}`,  // ¡IMPORTANTE!
        },
      });
      setUsuarios(res.data);
    } catch (error) {
      console.error('Error al obtener usuarios', error);
      setError('Error al cargar usuarios. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  // Aprobar usuario
  const aprobarUsuario = async (userId: string) => {
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No tienes token de autenticación. Por favor inicia sesión.');
        return;
      }

      const response = await axios.put(
        `${baseURL}/api/auth/approve/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Usuario aprobado:', response.data);
      fetchUsuarios(); // Refrescar lista después de aprobar
    } catch (error: any) {
      console.error('Error al aprobar usuario', error);
      alert(error.response?.data?.message || 'No se pudo aprobar el usuario');
    }
  };

  // Eliminar usuario
  const eliminarUsuario = async (id: string) => {
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No tienes token de autenticación. Por favor inicia sesión.');
        return;
      }

      await axios.delete(`${baseURL}/api/auth/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchUsuarios(); // Refrescar lista después de eliminar
    } catch (error: any) {
      console.error('Error al eliminar usuario', error);
      alert(error.response?.data?.message || 'No se pudo eliminar el usuario');
    }
  };

  return (
    <div className="bg-white p-6">
      <h2 className="text-2xl font-semibold text-[#1A3D33] mb-6">Registros</h2>

      {loading && <p className="text-gray-500">Cargando usuarios...</p>}

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {!loading && !error && usuarios.length === 0 && (
        <p className="text-gray-500">No hay usuarios para mostrar.</p>
      )}

      {!loading && !error && usuarios.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha de Registro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo de Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usuarios.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-[#1A3D33]">{`${user.nombre} ${user.apellido}`}</div>
                      <div className="text-sm text-gray-500">{user.correo}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(user.fechaNacimiento).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{user.rol}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.aprobado
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {user.aprobado ? 'Aprobado' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      {!user.aprobado && (
                        <button
                          onClick={() => aprobarUsuario(user.id)}
                          className="px-3 py-1 text-sm bg-[#8BAE52] text-white rounded-md hover:bg-[#1A3D33] transition-colors"
                        >
                          Aprobar
                        </button>
                      )}
                      <button
                        onClick={() => eliminarUsuario(user.id)}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                      >
                        Eliminar
                      </button>
                      <button className="px-3 py-1 text-sm border border-[#1A3D33] text-[#1A3D33] rounded-md hover:bg-[#1A3D33] hover:text-white transition-colors">
                        Ver
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Records;
