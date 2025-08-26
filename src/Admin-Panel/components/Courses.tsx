import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // Add this import
import '../../../src/styles/animations.css';

interface Curso {
  id: string;
  titulo: string;
  descripcion?: string;
  estado: string;
  dirigidoA: string;
  cantidadAccesosQuiz: number;
  cantidadParticipantes?: number;
}

// Añadir a las interfaces existentes
interface PaginationData {
  total: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const baseURL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://greenpark-backend-0ua6.onrender.com';

const Courses: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [accionandoId, setAccionandoId] = useState<string | null>(null);
  // Add new state to track loading participants
  // const [loadingParticipants, setLoadingParticipants] = useState<Record<string, boolean>>({});
  const [loadingDetails, setLoadingDetails] = useState(false);
  // Agregar estado para animación de carga
  const [isVisible, setIsVisible] = useState(false);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  const handleVerParticipantes = async (cursoId: string, cursoTitulo: string) => {
    setLoadingDetails(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const res = await fetch(`${baseURL}/api/cursos/${cursoId}/participantes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!res.ok) throw new Error('Error al cargar participantes');
      const data = await res.json();
      const participantes = data.participantes || [];

      // Mostrar el Swal con la lista de participantes
      await Swal.fire({
        title: `Participantes - ${cursoTitulo}`,
        html: `
          <div class="max-h-[400px] overflow-y-auto">
            <table class="min-w-full text-sm">
              <thead>
                <tr>
                  <th class="text-left py-2 px-3 bg-gray-50">Nombre</th>
                  <th class="text-left py-2 px-3 bg-gray-50">Correo</th>
                  <th class="text-left py-2 px-3 bg-gray-50">Fecha de registro</th>
                </tr>
              </thead>
              <tbody>
                ${participantes.length === 0 
                  ? `<tr><td colspan="3" class="py-6 text-center text-gray-500">No hay participantes aún.</td></tr>`
                  : participantes.map((p: any) => `
                    <tr class="border-b">
                      <td class="py-2 px-3">${p.nombre}</td>
                      <td class="py-2 px-3">${p.correo}</td>
                      <td class="py-2 px-3">${p.registradoEn 
                        ? new Date(p.registradoEn).toLocaleString() 
                        : 'Sin fecha'}</td>
                    </tr>
                  `).join('')}
              </tbody>
            </table>
          </div>
        `,
        width: '800px',
        showConfirmButton: true,
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#8BAE52',
        customClass: {
          htmlContainer: 'overflow-hidden',
        }
      });

    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cargar los participantes del curso',
        confirmButtonColor: '#8BAE52'
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  // Obtener cursos y luego agregar cantidad de participantes a cada uno
  const fetchCursos = async (page: number = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const res = await fetch(`${baseURL}/api/cursos/lista?page=${page}&limit=9`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        throw new Error('Error al cargar los cursos');
      }

      const data = await res.json();
      if (!data.cursos || !Array.isArray(data.cursos)) {
        throw new Error('Formato de respuesta inválido');
      }

      setCourses(data.cursos);
      setPagination({
        total: data.pagination.total,
        page: data.pagination.page,
        totalPages: data.pagination.totalPages,
        hasNextPage: data.pagination.hasNextPage,
        hasPrevPage: data.pagination.hasPrevPage
      });

    } catch (error) {
      console.error('Error en fetchCursos:', error);
      // Error handling can be done with Swal or console.error if needed
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCursos(pagination.page);
    setIsVisible(true);
  }, [pagination.page]);

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
      
      await fetchCursos(pagination.page);
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
      
      await fetchCursos(pagination.page);
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

  // Reemplazar el loading simple por un skeleton loader
  if (loading) {
    return (
      <div className="bg-white p-6 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                {[...Array(5)].map((_, index) => (
                  <th key={index} className="px-6 py-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, rowIndex) => (
                <tr key={rowIndex} className="border-b">
                  {[...Array(5)].map((_, colIndex) => (
                    <td key={colIndex} className="px-6 py-4">
                      <div 
                        className="h-4 bg-gray-200 rounded animate-pulse"
                        style={{
                          animationDelay: `${(rowIndex + colIndex) * 0.1}s`
                        }}
                      ></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white p-6 transition-all duration-500 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    }`}>
      <div className="flex justify-between items-center mb-6 fade-in-up">
        <h2 className="text-2xl font-semibold text-[#1A3D33]">Cursos</h2>
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => navigate('/admin/courses/new')}
            className="px-4 py-2 bg-[#8BAE52] text-white rounded-md hover:bg-[#1A3D33] transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
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

      <div className="overflow-x-auto fade-in">
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
                  <span>{course.cantidadParticipantes ?? 0} alumnos</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleVerParticipantes(course.id, course.titulo)}
                      disabled={loadingDetails}
                      className="px-3 py-1 text-sm border border-[#1A3D33] text-[#1A3D33] rounded-md hover:bg-[#1A3D33] hover:text-white disabled:opacity-50"
                    >
                      {loadingDetails ? 'Cargando...' : 'Ver participantes'}
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

      {/* Paginador */}
      <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
        <div className="flex items-center">
          <p className="text-sm text-gray-700">
            Mostrando{' '}
            <span className="font-medium">{courses.length}</span>{' '}
            de{' '}
            <span className="font-medium">{pagination.total}</span>{' '}
            cursos - Página{' '}
            <span className="font-medium">{pagination.page}</span>{' '}
            de{' '}
            <span className="font-medium">{pagination.totalPages}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={!pagination.hasPrevPage || loading}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors
              ${pagination.hasPrevPage && !loading
                ? 'bg-[#8BAE52] text-white hover:bg-[#1A3D33]'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          >
            Anterior
          </button>
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={!pagination.hasNextPage || loading}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors
              ${pagination.hasNextPage && !loading
                ? 'bg-[#8BAE52] text-white hover:bg-[#1A3D33]'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          >
            Siguiente
          </button>
        </div>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8BAE52]"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;