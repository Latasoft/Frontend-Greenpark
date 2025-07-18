import React, { useState } from 'react';
import axios from 'axios';

interface EnviarMensajeProps {
  currentUserEmail: string;
  currentUserName: string;
  currentUserRole: string;
}

const baseURL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://greenpark-backend-0ua6.onrender.com";

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
    if (!to.trim() || !subject.trim() || !content.trim()) {
      setError('Por favor completa todos los campos.');
      setSuccess(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      await axios.post(`${baseURL}/api/mensajes`, {
        from: currentUserEmail,
        fromName: currentUserName,
        fromRole: currentUserRole,
        to: to.trim(),
        subject: subject.trim(),
        content: content.trim(),
      });

      setTo('');
      setSubject('');
      setContent('');
      setSuccess(true);
      setError('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
      setError('Ocurrió un error al enviar el mensaje.');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-4">
      <button
        className="bg-[#1A3D33] text-white px-4 py-2 rounded hover:bg-[#154d40] mb-2 focus:outline-none focus:ring-2 focus:ring-[#1A3D33]"
        onClick={() => setShowForm((prev) => !prev)}
        aria-expanded={showForm}
        aria-controls="form-enviar-mensaje"
      >
        {showForm ? 'Ocultar formulario' : 'Enviar nuevo mensaje'}
      </button>

      {showForm && (
        <form
          id="form-enviar-mensaje"
          className="bg-white border rounded-lg p-4 shadow w-full max-w-2xl space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleEnviar();
          }}
          noValidate
        >
          <div>
            <label htmlFor="to" className="block text-sm font-medium text-gray-700">
              Para (correo):
            </label>
            <input
              id="to"
              type="email"
              placeholder="Correo del destinatario"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:border-[#1A3D33]"
              required
            />
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
              Asunto:
            </label>
            <input
              id="subject"
              type="text"
              placeholder="Asunto"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:border-[#1A3D33]"
              required
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Mensaje:
            </label>
            <textarea
              id="content"
              placeholder="Escribe tu mensaje..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:border-[#1A3D33]"
              rows={4}
              required
            />
          </div>

          <div className="flex items-center space-x-4">
            <button
              type="submit"
              disabled={loading || !to.trim() || !subject.trim() || !content.trim()}
              className="bg-[#1A3D33] text-white px-4 py-2 rounded hover:bg-[#154d40] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#1A3D33]"
            >
              {loading ? 'Enviando...' : 'Enviar'}
            </button>
            {success && <p className="text-green-600 text-sm">Mensaje enviado correctamente.</p>}
            {error && <p className="text-red-600 text-sm">{error}</p>}
          </div>
        </form>
      )}
    </div>
  );
};

export default EnviarMensaje;
