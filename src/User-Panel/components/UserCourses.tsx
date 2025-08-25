import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Swal from 'sweetalert2';

const baseURL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://greenpark-backend-0ua6.onrender.com";

interface Course {
  id: string;
  nombre: string;
  duracion: number | string;
  descripcion: string;
  progreso: number;
}

interface JwtPayload {
  id: string;
}

const UserCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);
  const [isColdStart, setIsColdStart] = useState(false);
  const [coldStartTimer, setColdStartTimer] = useState(0);
  const navigate = useNavigate();

  const CACHE_KEY = 'user_courses_cache';

  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoading(true);
        
        // Intentar cargar desde caché mientras esperamos la API
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const { courses, timestamp } = JSON.parse(cachedData);
          const isCacheValid = Date.now() - timestamp < 5 * 60 * 1000; // 5 minutos
          
          if (isCacheValid) {
            setCourses(courses);
            setLoading(false);
          }
        }
        
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No se encontró token de autenticación.");
          setLoading(false);
          return;
        }

        let usuarioId = "";
        try {
          const decoded = jwtDecode<JwtPayload>(token);
          usuarioId = decoded.id;
          if (!usuarioId) throw new Error("ID de usuario no encontrado en token.");
        } catch (e) {
          setError("Token inválido o mal formado.");
          setLoading(false);
          return;
        }

        const res = await fetch(`${baseURL}/api/auth/${usuarioId}/cursos-inscritos`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Error al cargar cursos: ${res.statusText}`);
        }

        const data: Course[] = await res.json();

        const cursosNormalizados = data.map(course => ({
          ...course,
          progreso:
            typeof course.progreso === "number" && course.progreso >= 0 && course.progreso <= 100
              ? course.progreso
              : 0,
        }));

        // Guardar en caché
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          courses: cursosNormalizados,
          timestamp: Date.now()
        }));
        
        setCourses(cursosNormalizados);
      } catch (err: any) {
        setError(err.message || "Error desconocido");
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (loading) {
      // Si después de 3 segundos sigue cargando, probablemente es cold start
      const delay = setTimeout(() => {
        setIsColdStart(true);
        
        // Contador ascendente para mostrar al usuario cuánto tiempo lleva
        timer = setInterval(() => {
          setColdStartTimer(prev => prev + 1);
        }, 1000);
      }, 3000);
      
      return () => {
        clearTimeout(delay);
        if (timer) clearInterval(timer);
      };
    } else {
      setIsColdStart(false);
      setColdStartTimer(0);
    }
  }, [loading]);

  async function handleDeleteCurso(cursoId: string) {
    const result = await Swal.fire({
      title: '¿Eliminar curso?',
      text: '¿Seguro quieres eliminar este curso de tu lista?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#8BAE52',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setError("No se encontró token de autenticación.");
      return;
    }

    try {
        setDeletingCourseId(cursoId);
        setError(null);

        const res = await fetch(`${baseURL}/api/auth/usuario/cursos-inscritos/${cursoId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Error al eliminar curso: ${res.statusText}`);
        }

        // Actualizar la lista local removiendo el curso borrado
        setCourses((prev) => prev.filter((c) => c.id !== cursoId));
      } catch (err: any) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.message || 'Error al eliminar el curso',
          confirmButtonColor: '#8BAE52'
        });
      } finally {
        setDeletingCourseId(null);
      }
    }

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((item) => (
        <div key={item} className="bg-white rounded-lg shadow overflow-hidden flex justify-between items-center">
          <div className="p-6 flex-1 w-full">
            <div className="flex justify-between items-start mb-2">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-end">
                <div className="h-3 bg-gray-200 rounded w-8"></div>
              </div>
              <div className="overflow-hidden h-2 mb-4 rounded bg-gray-200"></div>
            </div>
          </div>
          <div className="p-4 h-10 w-10"></div>
        </div>
      ))}
    </div>
  );
  if (error) return <p className="text-red-600">Error: {error}</p>;

  if (courses.length === 0) {
    return <p>No estás inscrito en ningún curso.</p>;
  }

  return (
    <div
      className="max-h-[60vh] overflow-y-auto pr-2"
      style={{ scrollbarGutter: "stable" }} // evitar salto layout al aparecer scrollbar
    >
      <ul className="space-y-4">
        {courses.map((course) => (
          <li
            key={course.id}
            className="bg-white rounded-lg shadow overflow-hidden flex justify-between items-center"
          >
            <div className="p-6 flex-1 cursor-pointer" onClick={() => navigate(`/cursos/${course.id}`)}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-medium text-gray-900">{course.nombre}</h3>
                {course.progreso === 100 ? (
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-100">
                    Finalizado
                  </span>
                ) : (
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-[#8BAE52] bg-[#8BAE52]/10">
                    En progreso
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Duración: {typeof course.duracion === "number" ? `${course.duracion} horas` : course.duracion}
              </p>
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-end">
                  <span className="text-xs font-semibold inline-block text-[#8BAE52]">{course.progreso}%</span>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-[#8BAE52]/10">
                  <div
                    style={{ width: `${course.progreso}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#8BAE52]"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => handleDeleteCurso(course.id)}
              disabled={deletingCourseId === course.id}
              className="p-4 text-red-600 hover:text-red-800 transition-colors"
              title="Eliminar curso"
              aria-label={`Eliminar curso ${course.nombre}`}
            >
              {deletingCourseId === course.id ? (
                <svg
                  className="animate-spin h-5 w-5 text-red-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </li>
        ))}
      </ul>

      {isColdStart && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-100 rounded-md">
          <p className="text-yellow-700 text-sm">
            El servidor se está iniciando, esto puede tomar hasta 1 minuto... ({coldStartTimer}s)
          </p>
        </div>
      )}
    </div>
  );
};

export default UserCourses;
