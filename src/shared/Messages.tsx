import { useEffect, useState } from 'react';
import axios from 'axios';

interface Message {
  id: string;
  from: string;
  fromName: string;
  fromRole: string;
  to: string;
  subject: string;
  content: string;
  date: string;
}

interface MessagesProps {
  userEmail: string;
  userRole: string;
}

const Messages: React.FC<MessagesProps> = ({ userEmail }) => {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `https://greenpark-backend-0ua6.onrender.com/api/mensajes?correo=${userEmail}`
        );
        setMessages(res.data);
      } catch (error) {
        console.error('Error al obtener mensajes:', error);
      }
    };
    fetchMessages();
  }, [userEmail]);

  return (
    <div className="flex h-[80vh] bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Bandeja lateral */}
      <div className="w-1/3 border-r overflow-y-auto">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">📥 Bandeja de entrada</h3>
        </div>
        {messages.length === 0 ? (
          <div className="p-4 text-gray-500 text-sm">No hay mensajes recibidos.</div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              onClick={() => setSelectedMessage(msg)}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                selectedMessage?.id === msg.id ? 'bg-gray-100' : ''
              }`}
            >
              <div className="font-medium text-sm text-gray-900">
                {msg.fromName} <span className="ml-1 text-xs text-[#1A3D33]">({msg.fromRole})</span>
              </div>
              <div className="text-sm text-gray-600 font-medium truncate">{msg.subject}</div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(msg.date).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Panel de mensaje seleccionado */}
      <div className="flex-1 p-6 overflow-y-auto">
        {selectedMessage ? (
          <>
            <div className="mb-6 border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-900">{selectedMessage.subject}</h2>
              <div className="text-sm mt-3 text-gray-700">
                <p>
                  <strong>De:</strong> {selectedMessage.fromName} ({selectedMessage.from})
                </p>
                <p>
                  <strong>Rol:</strong> {selectedMessage.fromRole}
                </p>
                <p>
                  <strong>Recibido:</strong> {new Date(selectedMessage.date).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="text-gray-800 text-base whitespace-pre-wrap leading-relaxed">
              {selectedMessage.content}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            Selecciona un mensaje para ver su contenido.
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
