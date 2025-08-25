import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // Add this import

interface Curso {
  id: string;
  titulo: string;
  descripcion?: string;
  estado: string;
  dirigidoA: string;
  cantidadAccesosQuiz: number;
  cantidadParticipantes?: number;
}

const baseURL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://greenpark-backend-0ua6.onrender.com';

const Courses: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accionandoId, setAccionandoId] = useState<string | null>(null);
  const [participantCache, setParticipantCache] = useState<Record<string, number>>({});
  // Add new state to track loading participants
  const [loadingParticipants, setLoadingParticipants] = useState<Record<string, boolean>>({});

  // Función para obtener cantidad de participantes por curso
  const fetchCantidadParticipantes = async (cursoId: string): Promise<number> => {
    // Check cache first
    if (participantCache[cursoId] !== undefined) {
      return participantCache[cursoId];
    }
    
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${baseURL}/api/cursos/${cursoId}/cantidadParticipantes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Error al obtener cantidad de participantes');
      const data = await res.json();
      const count = data.cantidadParticipantes || 0;
      
      // Update cache
      setParticipantCache(prev => ({
        ...prev,
        [cursoId]: count
      }));
      
      return count;
    } catch {
      return 0;
    }
  };

  // Add a batchFetchParticipantes function
  const batchFetchParticipantes = async (cursoIds: string[]): Promise<Record<string, number>> => {
    try {
      const token = localStorage.getItem('token') || '';
      // Create a new endpoint in your backend that accepts multiple IDs
      const res = await fetch(`${baseURL}/api/cursos/participantes-batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ cursoIds })
      });
      
      if (!res.ok) throw new Error('Error al obtener cantidades de participantes');
      return await res.json();
    } catch {
      return {};
    }
  };

  // Obtener cursos y luego agregar cantidad de participantes a cada uno
  const fetchCursos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/api/cursos/lista`);
      if (!res.ok) throw new Error('Error al cargar los cursos');
      const data = await res.json();
      
      // Set courses immediately without participant counts
      setCourses(data);
      setLoading(false);
      
      // Initialize loading state for all courses
      const loadingState: Record<string, boolean> = {};
      data.forEach((curso: Curso) => {
        loadingState[curso.id] = true;
      });
      setLoadingParticipants(loadingState);
      
      // Load participant counts in the background
      data.forEach(async (curso: Curso) => {
        const cantidadParticipantes: number = await fetchCantidadParticipantes(curso.id);
        setCourses((prevCourses: Curso[]) =>
          prevCourses.map((c: Curso) =>
            c.id === curso.id ? { ...c, cantidadParticipantes } : c
          )
        );
        // Mark this course's participants as loaded
        setLoadingParticipants(prev => ({
          ...prev,
          [curso.id]: false
        }));
      });
      
      // Batch participant fetching
      const cursoIds = data.map((curso: Curso) => curso.id);
      const participantesData = await batchFetchParticipantes(cursoIds);
      setCourses(prevCourses => 
        prevCourses.map(c => ({
          ...c,
          cantidadParticipantes: participantesData[c.id] || c.cantidadParticipantes
        }))
      );
      
      // Mark all courses as loaded after batch fetch
      const completedLoadingState: Record<string, boolean> = {};
      data.forEach((curso: Curso) => {
        completedLoadingState[curso.id] = false;
      });
      setLoadingParticipants(completedLoadingState);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCursos();
  }, []);

  // Replace the handleEliminarCurso function with this improved version
  const handleEliminarCurso = async (id: string) => {
    // Replace window.confirm with SweetAlert
    const result = await Swal.fire({
      title: '¿Eliminar curso?',
      text: '¿Estás seguro de eliminar este curso? Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    setAccionandoId(id);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseURL}/api/cursos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (!response.ok) throw new Error('Error al eliminar el curso');
      
      // Show success message
      await Swal.fire({
        icon: 'success',
        title: 'Curso eliminado',
        text: 'El curso ha sido eliminado exitosamente',
        confirmButtonColor: '#8BAE52'
      });
      
      await fetchCursos();
    } catch (error) {
      // Show error message
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al eliminar el curso. Por favor intenta nuevamente.',
        confirmButtonColor: '#8BAE52'
      });
    } finally {
      setAccionandoId(null);
    }
  };

  // Also let's add SweetAlert to the publish function
  const handlePublicarCurso = async (cursoId: string, cursoTitulo: string) => {
    // Show confirmation dialog before publishing
    const result = await Swal.fire({
      title: '¿Publicar curso?',
      text: `¿Estás seguro de publicar el curso "${cursoTitulo}"? Una vez publicado, estará disponible para todos los usuarios.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#8BAE52',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Sí, publicar',
      cancelButtonText: 'Cancelar'
    });

    // If user cancels, do nothing
    if (!result.isConfirmed) return;

    // Continue with publication if confirmed
    setAccionandoId(cursoId);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        Swal.fire({
          icon: 'error',
          title: 'Error de autenticación',
          text: 'No se encontró el token de autenticación',
          confirmButtonColor: '#8BAE52'
        });
        return;
      }

      const response = await fetch(`${baseURL}/api/cursos/${cursoId}/publicar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Error al publicar el curso');
      
      // Show success message
      await Swal.fire({
        icon: 'success',
        title: 'Curso publicado',
        text: 'El curso ha sido publicado exitosamente',
        confirmButtonColor: '#8BAE52'
      });
      
      await fetchCursos();
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al publicar el curso. Por favor intenta nuevamente.',
        confirmButtonColor: '#8BAE52'
      });
    } finally {
      setAccionandoId(null);
    }
  };

  if (loading) return <p>Cargando cursos...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="bg-white p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-[#1A3D33]">Cursos</h2>
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => navigate('/admin/courses/new')}
            className="px-4 py-2 bg-[#8BAE52] text-white rounded-md hover:bg-[#1A3D33] transition-colors flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Nuevo Curso
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre del curso
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo de acceso
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Participantes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {courses.map((course) => (
              <tr key={course.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-[#1A3D33]">{course.titulo}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      course.estado === 'publicado'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {course.estado}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{course.dirigidoA}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {loadingParticipants[course.id] ? (
                    <div className="flex items-center">
                      <svg className="animate-spin h-4 w-4 mr-2 text-[#8BAE52]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Cargando...</span>
                    </div>
                  ) : (
                    <span>{course.cantidadParticipantes ?? 0} alumnos</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => navigate(`/admin/courses/participantes/${course.id}`)}
                      className="px-3 py-1 text-sm border border-[#1A3D33] text-[#1A3D33] rounded-md hover:bg-[#1A3D33] hover:text-white"
                    >
                      Ver participantes
                    </button>

                    <button
                      onClick={() => navigate(`/admin/courses/edit/${course.id}`)}
                      className="px-3 py-1 text-sm bg-[#8BAE52] text-white rounded-md hover:bg-[#1A3D33]"
                    >
                      Editar
                    </button>

                    {course.estado !== 'publicado' && (
                      <button
                        onClick={() => handlePublicarCurso(course.id, course.titulo)}
                        disabled={accionandoId === course.id}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                      >
                        {accionandoId === course.id ? 'Publicando...' : 'Publicar'}
                      </button>
                    )}

                    <button
                      onClick={() => handleEliminarCurso(course.id)}
                      disabled={accionandoId === course.id}
                      className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
                    >
                      {accionandoId === course.id ? 'Eliminando...' : 'Eliminar'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Courses;
