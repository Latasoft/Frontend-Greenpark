import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EditCourse from './EditCourse'; // importa tu modal

interface Curso {
  id: string;
  titulo: string;
  descripcion?: string;
  estado: string;
  dirigidoA: string;
  cantidadAccesosQuiz: number;
}

const Courses: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accionandoId, setAccionandoId] = useState<string | null>(null);

  // Estado para manejar curso que se está editando en modal
  const [cursoEditando, setCursoEditando] = useState<Curso | null>(null);

  const fetchCursos = async () => {
    try {
      const response = await fetch('https://greenpark-backend-0ua6.onrender.com/api/cursos/lista');
      if (!response.ok) throw new Error('Error al cargar los cursos');

      const data = await response.json();

      // Mapear data con la estructura de Curso (coincide con EditCourse)
      const mappedCourses: Curso[] = data.map((curso: any) => ({
        id: curso.id,
        titulo: curso.titulo || 'Sin título',
        descripcion: curso.descripcion || '',
        estado: curso.estado || 'Desconocido',
        dirigidoA: curso.dirigidoA || 'General',
        cantidadAccesosQuiz: curso.cantidadAccesosQuiz || 0,
      }));

      setCourses(mappedCourses);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCursos();
  }, []);

  const handlePublicarCurso = async (id: string) => {
    setAccionandoId(id);
    try {
      const response = await fetch(`https://greenpark-backend-0ua6.onrender.com/api/cursos/${id}/publicar`, {
        method: 'PUT',
      });
      if (!response.ok) throw new Error('Error al publicar el curso');

      await fetchCursos();
    } catch {
      alert('Error al publicar curso');
    } finally {
      setAccionandoId(null);
    }
  };

  const handleEliminarCurso = async (id: string) => {
    const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este curso? Esta acción no se puede deshacer.');
    if (!confirmDelete) return;

    setAccionandoId(id);
    try {
      const response = await fetch(`https://greenpark-backend-0ua6.onrender.com/api/cursos/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Error al eliminar el curso');

      await fetchCursos();
    } catch {
      alert('Error al eliminar curso');
    } finally {
      setAccionandoId(null);
    }
  };

  // Abrir modal para editar curso
  const handleEditarCurso = (curso: Curso) => {
    setCursoEditando(curso);
  };

  // Cerrar modal y refrescar lista
  const handleCerrarModal = () => {
    setCursoEditando(null);
    fetchCursos();
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
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nuevo Curso
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre del curso</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo de acceso</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participantes</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {courses.map((course) => (
              <tr key={course.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-[#1A3D33]">{course.titulo}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      course.estado === 'publicado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {course.estado}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{course.dirigidoA}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{course.cantidadAccesosQuiz} alumnos</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    <button className="px-3 py-1 text-sm border border-[#1A3D33] text-[#1A3D33] rounded-md hover:bg-[#1A3D33] hover:text-white">
                      Ver participantes
                    </button>
                    <button
                      onClick={() => handleEditarCurso(course)}
                      className="px-3 py-1 text-sm bg-[#8BAE52] text-white rounded-md hover:bg-[#1A3D33]"
                    >
                      Editar
                    </button>
                    {course.estado !== 'publicado' && (
                      <button
                        onClick={() => handlePublicarCurso(course.id)}
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

      {/* Modal de edición */}
      {cursoEditando && (
        <EditCourse curso={cursoEditando} onCerrar={handleCerrarModal} onGuardado={handleCerrarModal} />
      )}
    </div>
  );
};

export default Courses;
