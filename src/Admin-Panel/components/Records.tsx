import { useEffect, useState } from 'react';
import axios from 'axios';
import UserDetailModal from './UserDetailModal';
import Swal from 'sweetalert2';

interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  fechaNacimiento: string;
  rol: string;
  aprobado: boolean;
}

// Definimos la baseURL según dónde esté la app
const baseURL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://greenpark-backend-0ua6.onrender.com';

const Records = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchUsuarios = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${baseURL}/api/auth/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsuarios(res.data);
    } catch (error) {
      console.error('Error al obtener usuarios', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const aprobarUsuario = async (userId: string, userName: string) => {
    // Show SweetAlert confirmation dialog
    const result = await Swal.fire({
      title: '¿Aprobar usuario?',
      text: `¿Estás seguro de aprobar al usuario ${userName}? Una vez aprobado, podrá acceder a la plataforma.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#8BAE52',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, aprobar',
      cancelButtonText: 'Cancelar',
    });

    // If user cancels, do nothing
    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${baseURL}/api/auth/approve/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Show success message
      await Swal.fire({
        icon: 'success',
        title: 'Usuario aprobado',
        text: 'El usuario ha sido aprobado exitosamente',
        confirmButtonColor: '#8BAE52',
      });

      fetchUsuarios();
    } catch (error) {
      console.error('Error al aprobar usuario', error);
      // Show error message
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo aprobar el usuario. Por favor intenta nuevamente.',
        confirmButtonColor: '#8BAE52',
      });
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    // Show SweetAlert confirmation dialog
    const result = await Swal.fire({
      title: '¿Eliminar usuario?',
      text: `¿Estás seguro de eliminar al usuario ${userName}? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    // If user cancels, do nothing
    if (!result.isConfirmed) return;

    // Set loading state
    setDeletingId(userId);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseURL}/api/auth/usuario/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Error al eliminar el usuario');

      // Show success message
      await Swal.fire({
        icon: 'success',
        title: 'Usuario eliminado',
        text: 'El usuario ha sido eliminado exitosamente',
        confirmButtonColor: '#8BAE52',
      });

      // Refresh the user list
      await fetchUsuarios();
    } catch (error) {
      // Show error message
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al eliminar el usuario. Por favor intenta nuevamente.',
        confirmButtonColor: '#8BAE52',
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white p-6">
      <h2 className="text-2xl font-semibold text-[#1A3D33] mb-6">Registros</h2>

      {loading ? (
        <p className="text-gray-500">Cargando usuarios...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Registro</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo de Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
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
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.aprobado ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.aprobado ? 'Aprobado' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      {!user.aprobado && (
                        <button
                          onClick={() => aprobarUsuario(user.id, user.nombre)}
                          className="px-3 py-1 text-sm bg-[#8BAE52] text-white rounded-md hover:bg-[#1A3D33] transition-colors"
                        >
                          Aprobar
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteUser(user.id, user.nombre)}
                        disabled={deletingId === user.id}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
                      >
                        {deletingId === user.id ? 'Eliminando...' : 'Eliminar'}
                      </button>
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="px-3 py-1 text-sm border border-[#1A3D33] text-[#1A3D33] rounded-md hover:bg-[#1A3D33] hover:text-white transition-colors"
                      >
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

      {/* Modal de detalles del usuario */}
      {selectedUser && (
        <UserDetailModal usuario={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
};

export default Records;
