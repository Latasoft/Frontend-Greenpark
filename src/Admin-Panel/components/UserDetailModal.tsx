// Admin-Panel/components/UserDetailModal.tsx
import React, { useEffect } from 'react';

interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  fechaNacimiento: string;
  rol: string;
  aprobado: boolean;
}

interface Props {
  usuario: Usuario | null;
  onClose: () => void;
}

const UserDetailModal: React.FC<Props> = ({ usuario, onClose }) => {
  if (!usuario) return null;

  // Cerrar con tecla ESC (opcional)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose(); // Cierra si clic fuera del contenido
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md relative">
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-red-500 text-2xl font-bold"
        >
          X
        </button>

        <h2 className="text-2xl font-semibold mb-4 text-[#1A3D33] text-center">Detalles del Usuario</h2>

        <div className="space-y-3 text-sm text-gray-800">
          <p><strong>Nombre:</strong> {usuario.nombre}</p>
          <p><strong>Apellido:</strong> {usuario.apellido}</p>
          <p><strong>Correo:</strong> {usuario.correo}</p>
          <p><strong>Fecha de nacimiento:</strong> {new Date(usuario.fechaNacimiento).toLocaleDateString()}</p>
          <p><strong>Rol:</strong> {usuario.rol}</p>
          <p>
            <strong>Estado:</strong>{' '}
            <span className={usuario.aprobado ? 'text-green-600' : 'text-yellow-600'}>
              {usuario.aprobado ? 'Aprobado' : 'Pendiente'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;

