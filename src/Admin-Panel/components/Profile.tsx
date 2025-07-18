import React, { useEffect, useState } from 'react';

interface ProfileProps {
  isAdminPanel?: boolean;
}

interface UserData {
  nombre: string | null;
  correo: string | null;
  rol: string | null;
  fechaNacimiento: string | null;
  id: string | null;
  imagenPerfil: string | null;
}

const baseURL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://greenpark-backend-0ua6.onrender.com';

const Profile = ({ isAdminPanel = false }: ProfileProps) => {
  const [userData, setUserData] = useState<UserData>({
    nombre: null,
    correo: null,
    rol: null,
    fechaNacimiento: null,
    id: null,
    imagenPerfil: null,
  });

  // Estados para edición
  const [editing, setEditing] = useState(false);
  const [newCorreo, setNewCorreo] = useState('');
  const [newImagen, setNewImagen] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const nombre = localStorage.getItem('userName');
    const correo = localStorage.getItem('userCorreo');
    const rol = localStorage.getItem('userRole');
    const fechaNacimiento = localStorage.getItem('userFechaNacimiento');
    const id = localStorage.getItem('userId');
    const imagenPerfil = localStorage.getItem('imagenPerfil');

    setUserData({ nombre, correo, rol, fechaNacimiento, id, imagenPerfil });
    setNewCorreo(correo || '');
    setNewImagen(imagenPerfil || '');
  }, []);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'unsigned_preset'); // Asegúrate que sea correcto
    formData.append('cloud_name', 'dmmlobp9k'); // Tu Cloud name

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/dmmlobp9k/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.secure_url) {
        setNewImagen(data.secure_url);
      } else {
        alert('No se pudo subir la imagen');
      }
    } catch (error) {
      console.error('Error al subir imagen:', error);
      alert('Hubo un error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!userData.id) {
      alert('Usuario no identificado');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${baseURL}/api/auth/users/${userData.id}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token ?? ''}`,
        },
        body: JSON.stringify({
          correo: newCorreo,
          imagenPerfil: newImagen,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setUserData((prev) => ({
          ...prev,
          correo: newCorreo,
          imagenPerfil: newImagen,
        }));

        localStorage.setItem('userCorreo', newCorreo);
        localStorage.setItem('imagenPerfil', newImagen);

        setEditing(false);
        alert('Perfil actualizado con éxito');
      } else {
        alert(data.message || 'Error al actualizar');
      }
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      alert('Hubo un error al actualizar el perfil');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
          {userData.imagenPerfil ? (
            <img
              src={userData.imagenPerfil}
              alt="Imagen de perfil"
              className="w-full h-full object-cover"
            />
          ) : (
            <svg
              className="w-16 h-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          )}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-[#1A3D33]">{userData.nombre ?? 'Sin nombre'}</h2>
          <p className="text-gray-600">{isAdminPanel ? 'Administrador' : userData.rol ?? 'Sin especificar'}</p>
          <p className="text-[#8BAE52]">{userData.correo ?? 'Sin email'}</p>
          <button
            className="mt-2 px-4 py-1 text-sm bg-[#8BAE52] text-white rounded-md hover:bg-[#1A3D33] transition-colors"
            onClick={() => setEditing(!editing)}
          >
            {editing ? 'Cancelar' : 'Editar Perfil'}
          </button>
        </div>
      </div>

      {editing && (
        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nuevo correo</label>
            <input
              type="email"
              value={newCorreo}
              onChange={(e) => setNewCorreo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Subir nueva imagen</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              disabled={uploading}
            />
            {uploading && <p className="text-sm text-gray-500 mt-1">Subiendo imagen...</p>}
          </div>
          <button
            onClick={handleUpdateProfile}
            className="bg-[#8BAE52] text-white px-4 py-2 rounded-md hover:bg-[#1A3D33] transition-colors"
            disabled={uploading}
          >
            Guardar cambios
          </button>
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-[#1A3D33] mb-4 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          Información Personal
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre completo</label>
            <p className="mt-1 text-gray-400 italic">{userData.nombre ?? 'Sin especificar'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha de nacimiento</label>
            <p className="mt-1 text-gray-400 italic">{userData.fechaNacimiento ?? 'Sin especificar'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-gray-400 italic">{userData.correo ?? 'Sin especificar'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Rol</label>
            <p className="mt-1 text-[#1A3D33]">{isAdminPanel ? 'Administrador' : userData.rol ?? 'Sin especificar'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
