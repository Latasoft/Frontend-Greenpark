import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

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
  const [loading, setLoading] = useState(false);

  const openMessageDialog = () => {
    Swal.fire({
      title: 'Enviar nuevo mensaje',
      html: `
        <div class="mb-4">
          <label for="swal-destinatario" class="block text-sm font-medium text-gray-700 mb-1 text-left">Destinatario:</label>
          <input 
            id="swal-destinatario" 
            type="email" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8BAE52] focus:border-transparent" 
            placeholder="correo@ejemplo.com"
          >
        </div>
        <div class="mb-4">
          <label for="swal-asunto" class="block text-sm font-medium text-gray-700 mb-1 text-left">Asunto:</label>
          <input id="swal-asunto" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8BAE52] focus:border-transparent" placeholder="Escribe el asunto">
        </div>
        <div>
          <label for="swal-mensaje" class="block text-sm font-medium text-gray-700 mb-1 text-left">Mensaje:</label>
          <textarea id="swal-mensaje" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8BAE52] focus:border-transparent" placeholder="Escribe tu mensaje"></textarea>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Enviar mensaje',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#8BAE52',
      cancelButtonColor: '#d33',
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),
      preConfirm: async () => {
        const destinatario = (document.getElementById('swal-destinatario') as HTMLInputElement).value;
        const asunto = (document.getElementById('swal-asunto') as HTMLInputElement).value;
        const mensaje = (document.getElementById('swal-mensaje') as HTMLTextAreaElement).value;
        
        // Validar formato de correo electrónico
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!destinatario || !emailRegex.test(destinatario)) {
          Swal.showValidationMessage('Por favor ingresa un correo electrónico válido');
          return false;
        }
        
        if (!asunto) {
          Swal.showValidationMessage('Por favor ingresa un asunto');
          return false;
        }
        
        if (!mensaje) {
          Swal.showValidationMessage('Por favor escribe un mensaje');
          return false;
        }
        
        try {
          setLoading(true);
          const token = localStorage.getItem('token');
          
          // Extraer nombre de usuario del email como fallback
          const emailUsername = destinatario.split('@')[0];
          
          const response = await axios.post(
            `${baseURL}/api/mensajes`,
            {
              from: currentUserEmail,
              fromName: currentUserName,
              fromRole: currentUserRole,
              to: destinatario,
              // Campos adicionales obligatorios
              toName: emailUsername || "Usuario", // Usar parte del email como nombre por defecto
              toRole: "usuario", // Rol por defecto
              subject: asunto,
              content: mensaje,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          
          return response.data;
        } catch (error: any) {
          console.error('Error sending message:', error);
          Swal.showValidationMessage(
            `Error al enviar mensaje: ${error.response?.data?.message || error.message}`
          );
          return false;
        } finally {
          setLoading(false);
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: '¡Mensaje enviado!',
          text: 'Tu mensaje ha sido enviado correctamente.',
          icon: 'success',
          confirmButtonColor: '#8BAE52'
        });
      }
    });
  };

  return (
    <div className="mb-6">
      <button
        onClick={openMessageDialog}
        className="flex items-center px-4 py-2 bg-[#8BAE52] text-white rounded hover:bg-[#1A3D33] transition-colors"
        disabled={loading}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 mr-2" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
        </svg>
        {loading ? 'Enviando...' : 'Enviar nuevo mensaje'}
      </button>
    </div>
  );
};

export default EnviarMensaje;
