import { useState } from 'react';

const Messages = () => {
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: "Ricardo González",
      role: "Administrador",
      subject: "Bienvenida al curso",
      date: "15/03/2024 10:30",
      content: "Estimada Ana, bienvenida al curso de Inteligencia Artificial. Espero que encuentres el contenido interesante y útil para tu desarrollo profesional. Cualquier duda o consulta no dudes en responder este mensaje..."
    }
  ]);

  const handleDeleteMessage = (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este mensaje?')) {
      setMessages(messages.filter(msg => msg.id !== id));
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
    }
  };

  return (
    <div className="flex h-full bg-white rounded-lg shadow">
      <div className="w-1/3 border-r">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">Bandeja de entrada</h3>
        </div>
        <div className="overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              onClick={() => setSelectedMessage(message)}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                selectedMessage?.id === message.id ? 'bg-gray-100' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-sm text-gray-900">
                    {message.from} 
                    <span className="ml-2 text-xs text-[#1A3D33]">({message.role})</span>
                  </div>
                  <div className="text-sm text-gray-600 font-medium">{message.subject}</div>
                  <div className="text-xs text-gray-500 mt-1">{message.date}</div>
                </div>
                <div className="w-2 h-2 rounded-full bg-[#8BAE52]"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 p-6">
        {selectedMessage ? (
          <>
            <div className="mb-6 border-b pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedMessage.subject}</h2>
                  <div className="mt-2 text-sm">
                    <span className="text-gray-700">De:</span> 
                    <span className="text-gray-900 ml-1">{selectedMessage.from}</span>
                    <span className="text-[#1A3D33] ml-2">({selectedMessage.role})</span>
                  </div>
                  <div className="text-sm text-gray-500">Recibido: {selectedMessage.date}</div>
                </div>
                <button 
                  onClick={() => handleDeleteMessage(selectedMessage.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
              {selectedMessage.content}
            </div>
            <div className="mt-6">
              <button className="px-4 py-2 bg-[#8BAE52] text-white rounded hover:bg-[#7a9947]">
                Responder
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Selecciona un mensaje para ver su contenido
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
