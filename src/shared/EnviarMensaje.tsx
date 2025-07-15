import React, { useState } from 'react';
import axios from 'axios';

interface EnviarMensajeProps {
  currentUserEmail: string;
  currentUserName: string;
  currentUserRole: string;
}

const EnviarMensaje: React.FC<EnviarMensajeProps> = ({
  currentUserEmail,
  currentUserName,
  currentUserRole,
}) => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleEnviar = async () => {
    if (!to || !subject || !content) {
      setError('Por favor completa todos los campos.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await axios.post('https://greenpark-backend-0ua6.onrender.com/api/mensajes', {
        from: currentUserEmail,
        fromName: currentUserName,
        fromRole: currentUserRole,
        to,
        subject,
        content,
      });

      setTo('');
      setSubject('');
      setContent('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
      setError('Ocurrió un error al enviar el mensaje.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-4">
      <button
        className="bg-[#1A3D33] text-white px-4 py-2 rounded hover:bg-[#154d40] mb-2"
        onClick={() => setShowForm((prev) => !prev)}
        aria-expanded={showForm}
      >
        {showForm ? 'Ocultar formulario' : 'Enviar nuevo mensaje'}
      </button>

      {showForm && (
        <div className="bg-white border rounded-lg p-4 shadow w-full max-w-2xl space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Para (correo):</label>
            <input
              type="email"
              placeholder="Correo del destinatario"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:border-[#1A3D33]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Asunto:</label>
            <input
              type="text"
              placeholder="Asunto"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:border-[#1A3D33]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Mensaje:</label>
            <textarea
              placeholder="Escribe tu mensaje..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:border-[#1A3D33]"
              rows={4}
            />
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleEnviar}
              disabled={loading}
              className="bg-[#1A3D33] text-white px-4 py-2 rounded hover:bg-[#154d40] disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Enviar'}
            </button>
            {success && <p className="text-green-600 text-sm">Mensaje enviado correctamente.</p>}
            {error && <p className="text-red-600 text-sm">{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnviarMensaje;
