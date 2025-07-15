// src/admin-panel/pages/AdminMessagesPage.tsx

import React from 'react';
import Messages from '../../shared/Messages';
import EnviarMensaje from '../../shared/EnviarMensaje';
import { useAuth } from '../../hooks/useAuth';

const AdminMessagesPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) return <div>Cargando usuario...</div>;

  return (
    <div className="p-4 min-h-[90vh] flex flex-col">
      <h1 className="text-2xl font-bold mb-6">Mensajes del Administrador</h1>

      <div className="mb-8">
        <EnviarMensaje
          currentUserEmail={user.correo}
          currentUserName={user.nombre}
          currentUserRole={user.rol}
        />
      </div>

      <div className="flex-1">
        <Messages userEmail={user.correo} userRole={user.rol} />
      </div>
    </div>
  );
};

export default AdminMessagesPage;
