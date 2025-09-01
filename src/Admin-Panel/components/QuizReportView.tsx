import React, { useState, useEffect } from "react";
import axios from "axios";

const baseURL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://backend-greenpark.onrender.com";

interface RespuestaPregunta {
  pregunta: string;
  respuestaUsuario: number;
  esCorrecta: boolean;
}

interface RespuestaQuiz {
  id: string;
  cursoId: string;
  moduloIndex: number;
  usuarioId: string;  // This will be treated as string in our component
  respuestas: RespuestaPregunta[];
  porcentaje: number;
  puntajeTotal: number;
  totalPreguntas: number;
  creadoEn: Date;
}

interface Usuario {
  id: string;
  nombre: string;
  email: string;
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const QuizReportView: React.FC<{ cursoId: string }> = ({ cursoId }) => {
  const [loading, setLoading] = useState(true);
  const [respuestas, setRespuestas] = useState<RespuestaQuiz[]>([]);
  const [usuarios, setUsuarios] = useState<Record<string, Usuario>>({});
  const [error, setError] = useState<string | null>(null);
  const [filtroUsuario, setFiltroUsuario] = useState<string>("");
  const [filtroModulo, setFiltroModulo] = useState<number | "">("");

  useEffect(() => {
    if (!cursoId) return;
    
    const fetchRespuestas = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No hay token de autenticación");
        
        const response = await axios.get(`${baseURL}/api/quiz/respuestas/curso/${cursoId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const respuestasData = response.data.map((resp: any) => ({
          ...resp,
          usuarioId: String(resp.usuarioId), // Ensure usuarioId is a string
          creadoEn: resp.creadoEn ? new Date(resp.creadoEn) : new Date()
        }));
        
        setRespuestas(respuestasData);
        
        // Obtener información de los usuarios
        const userIdSet = new Set<string>();
        respuestasData.forEach((r: RespuestaQuiz) => {
          if (typeof r.usuarioId === 'string') {
            userIdSet.add(r.usuarioId);
          }
        });
        
        const usuariosIds = Array.from(userIdSet);
        const usuariosData: Record<string, Usuario> = {};
        
        await Promise.all(usuariosIds.map(async (id) => {
          try {
            const userResponse = await axios.get(`${baseURL}/api/auth/users/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            usuariosData[id] = userResponse.data as Usuario;
          } catch (error) {
            console.error(`Error al obtener usuario ${id}:`, error);
            usuariosData[id] = { 
              id: id, 
              nombre: `Usuario ${id.substring(0, 6)}...`, 
              email: 'desconocido' 
            };
          }
        }));
        
        setUsuarios(usuariosData);
      } catch (err) {
        console.error("Error al cargar respuestas:", err);
        setError("Error al cargar las respuestas de los quizzes");
      } finally {
        setLoading(false);
      }
    };
    
    fetchRespuestas();
  }, [cursoId]);

  // Filtrar respuestas por usuario y módulo
  const respuestasFiltradas = respuestas.filter((resp) => {
    const userId = typeof resp.usuarioId === 'string' ? resp.usuarioId : '';
    const usuarioData = usuarios[userId];
    
    const pasaFiltroUsuario = filtroUsuario 
      ? usuarioData?.nombre.toLowerCase().includes(filtroUsuario.toLowerCase()) ||
        usuarioData?.email.toLowerCase().includes(filtroUsuario.toLowerCase())
      : true;
    
    const pasaFiltroModulo = filtroModulo !== "" 
      ? resp.moduloIndex === filtroModulo
      : true;
      
    return pasaFiltroUsuario && pasaFiltroModulo;
  });

  if (loading) {
    return <div className="p-4 text-center">Cargando respuestas de los quizzes...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-600">{error}</div>;
  }

  if (respuestas.length === 0) {
    return (
      <div className="p-4 text-center">
        No hay respuestas registradas para este curso.
      </div>
    );
  }

  // Obtener lista de módulos únicos
  const modulos = [...new Set(respuestas.map(r => r.moduloIndex))].sort((a, b) => a - b);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6 text-[#1A3D33]">Resultados de Evaluaciones</h2>
      
      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[250px]">
          <label className="block text-sm font-medium mb-1 text-[#1A3D33]">
            Filtrar por usuario
          </label>
          <input
            type="text"
            value={filtroUsuario}
            onChange={(e) => setFiltroUsuario(e.target.value)}
            placeholder="Nombre o email"
            className="w-full border border-gray-300 rounded p-2"
          />
        </div>
        <div className="w-40">
          <label className="block text-sm font-medium mb-1 text-[#1A3D33]">
            Filtrar por módulo
          </label>
          <select
            value={filtroModulo}
            onChange={(e) => setFiltroModulo(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full border border-gray-300 rounded p-2"
          >
            <option value="">Todos</option>
            {modulos.map((modulo) => (
              <option key={modulo} value={modulo}>
                Módulo {modulo + 1}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Tabla de resultados */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#1A3D33] text-white">
              <th className="p-2 text-left">Usuario</th>
              <th className="p-2 text-left">Módulo</th>
              <th className="p-2 text-left">Porcentaje</th>
              <th className="p-2 text-left">Correctas</th>
              <th className="p-2 text-left">Total</th>
              <th className="p-2 text-left">Fecha</th>
              <th className="p-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {respuestasFiltradas.map((resp) => (
              <tr key={resp.id} className="border-b hover:bg-gray-50">
                <td className="p-2">
                  {(() => {
                    const userId = typeof resp.usuarioId === 'string' ? resp.usuarioId : '';
                    const usuario = usuarios[userId];
                    return (
                      <>
                        {usuario?.nombre || `Usuario ${userId.substring(0, 6)}...`}
                        <div className="text-xs text-gray-500">
                          {usuario?.email}
                        </div>
                      </>
                    );
                  })()}
                </td>
                <td className="p-2">Módulo {resp.moduloIndex + 1}</td>
                <td className="p-2">
                  <span 
                    className={`font-bold ${resp.porcentaje >= 70 
                      ? 'text-green-600' 
                      : 'text-red-600'}`
                    }
                  >
                    {resp.porcentaje}%
                  </span>
                </td>
                <td className="p-2">{resp.puntajeTotal}</td>
                <td className="p-2">{resp.totalPreguntas}</td>
                <td className="p-2">{formatDate(resp.creadoEn)}</td>
                <td className="p-2">
                  <button 
                    className="text-blue-600 hover:text-blue-800 underline"
                    onClick={() => {
                      const userId = typeof resp.usuarioId === 'string' ? resp.usuarioId : '';
                      const usuario = usuarios[userId];
                      alert(
                        `Respuestas de ${usuario?.nombre || 'Usuario'}: \n\n` + 
                        resp.respuestas.map((r, i) => 
                          `${i+1}. ${r.pregunta}\n   Respuesta: ${r.respuestaUsuario}\n   ${r.esCorrecta ? '✓ Correcta' : '✗ Incorrecta'}`
                        ).join('\n\n')
                      );
                    }}
                  >
                    Ver detalles
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuizReportView;
