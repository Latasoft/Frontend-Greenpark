import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

const baseURL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://greenpark-backend-0ua6.onrender.com";

interface Curso {
  id: string;
  titulo: string;
  imagen?: string;
  imagenUrl?: string; // en caso que venga con ese nombre
  duracionHoras?: number;
  herramientas?: string[];
  loAprenderan?: string[];
  dirigidoA?: string;
  estado?: string;
  rol?: string;
}

const Courses = () => {
  const { tipo } = useParams<{ tipo?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const searchParams = new URLSearchParams(location.search);
  const destacados = searchParams.get("destacados");

  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCursos = async () => {
      setLoading(true);
      setError(null);

      try {
        let url = "";

        if (destacados === "true") {
          url = `${baseURL}/api/cursos/destacados`;
        } else {
          const tipoValido = tipo?.toLowerCase();

          if (
            tipoValido &&
            !["docente", "estudiante", "comunidad"].includes(tipoValido)
          ) {
            setError("Categoría no válida");
            setCursos([]);
            setLoading(false);
            return;
          }

          if (tipoValido) {
            url = `${baseURL}/api/cursos/publico/${tipoValido}`;
          } else {
            url = `${baseURL}/api/cursos/lista`;
          }
        }

        const token = localStorage.getItem("token");
        const res = await axios.get(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        // Normalizar campos para cada curso:
        let cursosNormalizados: Curso[] = (res.data.cursos || res.data).map(
          (curso: any) => ({
            ...curso,
            imagen: curso.imagen || curso.imagenUrl || "",
            duracionHoras: curso.duracionHoras ?? 0,
            herramientas: curso.herramientas || [],
            loAprenderan: curso.loAprenderan || [],
            dirigidoA: curso.dirigidoA || "General",
            estado: curso.estado || "borrador"
          })
        );

        // Filtrar cursos no publicados para usuarios no admin/docente
        if (user && !['admin', 'docente'].includes(user.rol.toLowerCase())) {
          cursosNormalizados = cursosNormalizados.filter(curso => curso.estado === 'publicado');
        }

        setCursos(cursosNormalizados);
      } catch (err) {
        setError("Error al cargar cursos");
      } finally {
        setLoading(false);
      }
    };

    fetchCursos();
  }, [tipo, destacados]);

  if (loading)
    return <p className="text-center mt-8">Cargando cursos...</p>;
  if (error)
    return (
      <p className="text-center mt-8 text-red-600">{error}</p>
    );

  return (
    <div className="min-h-screen bg-white">
      <section
        className="relative h-[300px] bg-cover bg-center flex items-center"
        style={{
          backgroundImage: `url('/assets/curso-banner.png')`,
        }}
      >
        <div
          className="absolute inset-0"
          style={{ backgroundColor: "#1A3D33", opacity: "0.85" }}
        ></div>
        <div className="relative w-full text-center px-4">
          <h1 className="text-[32px] text-white font-bold mb-4 capitalize">
            {destacados === "true"
              ? "Cursos Destacados"
              : tipo
              ? `Cursos para ${tipo}`
              : "Transforma tu Carrera Educativa"}
          </h1>
          <p className="text-base text-white max-w-3xl mx-auto">
            {destacados === "true"
              ? "Los 10 cursos con más participantes"
              : tipo
              ? `Cursos especializados para ${tipo}`
              : "Cursos especializados con enfoque práctico y profesional"}
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {cursos.length === 0 ? (
              <p className="text-center text-gray-600 col-span-3">
                No hay cursos disponibles.
              </p>
            ) : (
              cursos.map((curso) => (
                <div
                  key={curso.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/cursos/${curso.id}`)}
                >
                  <div className="relative">
                    <span className="absolute top-4 left-4 bg-[#8BAE52] text-white px-3 py-1 rounded-md text-sm capitalize">
                      {curso.dirigidoA || "General"}
                    </span>
                    <img
                      src={curso.imagen}
                      alt={curso.titulo}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-[#1A3D33] mb-4">
                      {curso.titulo}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                      <span>
                        Duración: {curso.duracionHoras || "N/A"} horas
                      </span>
                    </div>
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-[#1A3D33] mb-2">
                        Herramientas:
                      </h4>
                      <p className="text-sm text-gray-600">
                        {curso.herramientas?.length
                          ? curso.herramientas.join(", ")
                          : "No especificado"}
                      </p>
                    </div>
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-[#1A3D33] mb-2">
                        Aprenderás:
                      </h4>
                      <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                        {curso.loAprenderan?.length ? (
                          curso.loAprenderan.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))
                        ) : (
                          <li>No especificado</li>
                        )}
                      </ul>
                    </div>
                    <button
                      className="w-full bg-[#1A3D33] text-white py-2 rounded-md hover:bg-[#8BAE52] transition-colors"
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (!user) {
                          alert("Por favor inicie sesión para tomar el curso.");
                          return;
                        }

                        // Verificar que el usuario tenga el rol correcto para el curso
                        if (curso.dirigidoA && curso.dirigidoA.toLowerCase() !== 'general' && 
                            user.rol.toLowerCase() !== curso.dirigidoA.toLowerCase()) {
                          alert(`Este curso está dirigido únicamente a usuarios con rol de ${curso.dirigidoA}`);
                          return;
                        }

                        // Verificar que el curso esté publicado
                        if (curso.estado !== 'publicado' && !['admin', 'docente'].includes(user.rol.toLowerCase())) {
                          alert("Este curso aún no está disponible.");
                          return;
                        }

                        try {
                          const token = localStorage.getItem("token");

                          await axios.post(
                            `${baseURL}/api/cursos/${curso.id}/registrarParticipante`,
                            {},
                            {
                              headers: { Authorization: `Bearer ${token}` },
                            }
                          );

                          alert("¡Registro exitoso!");
                          navigate(`/cursos/${curso.id}`);
                        } catch (error) {
                          console.error(
                            "Error al registrar participante",
                            error
                          );
                          alert(
                            "No se pudo registrar la participación. Por favor contacte al administrador."
                          );
                        }
                      }}
                    >
                      Comenzar Curso
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Courses;
