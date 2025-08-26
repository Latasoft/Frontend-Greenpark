// Admin-Panel/components/UserDetailModal.tsx
import React, { useEffect } from 'react';
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

interface Props {
  usuario: Usuario | null;
  onClose: () => void;
}

const UserDetailModal: React.FC<Props> = ({ usuario, onClose }) => {
  useEffect(() => {
    if (usuario) {
      Swal.fire({
        title: 'Detalles del Usuario',
        html: `
          <div class="space-y-3 text-left">
            <p><strong>Nombre:</strong> ${usuario.nombre}</p>
            <p><strong>Apellido:</strong> ${usuario.apellido}</p>
            <p><strong>Correo:</strong> ${usuario.correo}</p>
            <p><strong>Fecha de nacimiento:</strong> ${new Date(usuario.fechaNacimiento).toLocaleDateString()}</p>
            <p><strong>Rol:</strong> ${usuario.rol}</p>
            <p>
              <strong>Estado:</strong> 
              <span class="${usuario.aprobado ? 'text-green-600' : 'text-yellow-600'}">
                ${usuario.aprobado ? 'Aprobado' : 'Pendiente'}
              </span>
            </p>
          </div>
        `,
        showConfirmButton: true,
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#8BAE52',
        width: '32rem',
        customClass: {
          title: 'text-[#1A3D33] text-2xl font-semibold',
          htmlContainer: 'text-sm text-gray-800',
          popup: 'rounded-xl'
        }
      }).then(() => {
        onClose();
      });
    }
  }, [usuario, onClose]);

  return null;
};

export default UserDetailModal;

