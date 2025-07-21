import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

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
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoading(true);
        setError(null);

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

        setCourses(cursosNormalizados);
      } catch (err: any) {
        setError(err.message || "Error desconocido");
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  async function handleDeleteCurso(cursoId: string) {
    const confirm = window.confirm("¿Seguro quieres eliminar este curso de tu lista?");
    if (!confirm) return;

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
        setError(err.message || "Error al eliminar el curso.");
      } finally {
        setDeletingCourseId(null);
      }
    }

  if (loading) return <p>Cargando cursos...</p>;
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
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-[#8BAE52] bg-[#8BAE52]/10">
                  En progreso
                </span>
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
    </div>
  );
};

export default UserCourses;
