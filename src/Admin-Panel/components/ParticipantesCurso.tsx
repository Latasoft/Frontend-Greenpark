import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Participante {
  id: string;
  nombre: string;
  correo: string;
  registradoEn: string | null;
}

const baseURL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://greenpark-backend-0ua6.onrender.com';

const ParticipantesCurso: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchParticipantes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${baseURL}/api/cursos/${id}/participantes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al cargar participantes');
      const data = await res.json();
      setParticipantes(data.participantes);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipantes();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600 text-lg animate-pulse">Cargando participantes...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-600 text-lg font-semibold">Error: {error}</p>
      </div>
    );

  return (
    <div className="bg-white p-8 min-h-screen max-w-6xl mx-auto rounded-md shadow-md">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-semibold text-[#1A3D33]">Participantes</h2>
        <button
          onClick={() => navigate('/admin/courses')}
          className="px-5 py-2 bg-[#8BAE52] text-white rounded-md hover:bg-[#1A3D33] transition-colors shadow-md"
        >
          ← Volver a cursos
        </button>
      </div>

      <div className="overflow-x-auto border rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#E8F1E9]">
            <tr>
              {['Nombre', 'Correo', 'Fecha de registro'].map((title) => (
                <th
                  key={title}
                  className="px-6 py-3 text-left text-xs font-semibold text-[#2E5234] uppercase tracking-wider select-none"
                >
                  {title}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-100">
            {participantes.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="py-6 text-center text-gray-500 font-medium select-none"
                >
                  No hay participantes aún.
                </td>
              </tr>
            ) : (
              participantes.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-[#F0F9F4] transition-colors cursor-default"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-[#1A3D33] font-medium text-sm">
                    {p.nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700 text-sm">
                    {p.correo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-sm">
                    {p.registradoEn
                      ? new Date(p.registradoEn).toLocaleString()
                      : 'Sin fecha'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ParticipantesCurso;
