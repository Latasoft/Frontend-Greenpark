import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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

const UserCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const usuarioId = "j6RpWm9mTqfsvIRs4109";

  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${baseURL}/api/auth/${usuarioId}/cursos-inscritos`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Error al cargar cursos: ${res.statusText}`);
        }

        const data: Course[] = await res.json();
        setCourses(data);
      } catch (err: any) {
        setError(err.message || "Error desconocido");
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, [usuarioId]);

  if (loading) return <p>Cargando cursos...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {courses.map((course) => (
        <div key={course.id} className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900">{course.nombre}</h3>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-[#8BAE52] bg-[#8BAE52]/10">
                En progreso
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
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
            <button
              onClick={() => navigate(`/cursos/${course.id}`)}
              className="w-full bg-[#1A3D33] text-white py-2 px-4 rounded hover:bg-[#152f27] transition-colors"
            >
              Continuar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserCourses;
