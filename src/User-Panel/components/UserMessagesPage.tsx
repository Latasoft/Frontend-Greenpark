import Messages from '../../shared/Messages';
import EnviarMensaje from '../../shared/EnviarMensaje';
import { useAuth } from '../../hooks/useAuth';

const UserMessagesPage = () => {
  const { user } = useAuth();

  if (!user) return <div>Cargando usuario...</div>;

  return (
    <div className="h-[80vh] overflow-y-auto p-4 bg-white rounded-lg shadow">
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
