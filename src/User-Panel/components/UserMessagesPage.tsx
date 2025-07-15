// src/user-panel/pages/UserMessagesPage.tsx

import React from 'react';
import Messages from '../../shared/Messages';
import EnviarMensaje from '../../shared/EnviarMensaje';
import { useAuth } from '../../hooks/useAuth';

const UserMessagesPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) return <div>Cargando usuario...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Tus mensajes</h1>

      <div className="mb-8">
        <EnviarMensaje
          currentUserEmail={user.correo}
          currentUserName={user.nombre}
          currentUserRole={user.rol}
        />
      </div>

      <Messages userEmail={user.correo} userRole={user.rol} />
    </div>
  );
};

export default UserMessagesPage;
