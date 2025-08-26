import Messages from '../../shared/Messages';
import EnviarMensaje from '../../shared/EnviarMensaje';
import { useAuth } from '../../hooks/useAuth';

const UserMessagesPage = () => {
  const { user } = useAuth();

  if (!user) return <div>Cargando usuario...</div>;

  return (
    <div className="p-4 bg-white rounded-lg shadow">
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
