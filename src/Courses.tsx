import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {useAuth} from "./hooks/useAuth";
import axios from "axios";

// Add this import for the animation

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

  if (loading) {
    // Replace your loading indicator with skeleton cards
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Generate 6 skeleton cards */}
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-full animate-pulse">
              {/* Skeleton image */}
              <div className="relative">
                <div className="w-full h-48 bg-gray-200"></div>
                {/* Skeleton badge */}
                <div className="absolute top-4 left-4 bg-gray-200 w-20 h-6 rounded-md"></div>
              </div>
              
              {/* Skeleton content */}
              <div className="p-6 flex flex-col flex-1">
                <div className="flex-1">
                  {/* Skeleton title */}
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  
                  {/* Skeleton duration */}
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  
                  {/* Skeleton herramientas */}
                  <div className="mb-4">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                  </div>
                  
                  {/* Skeleton aprenderás */}
                  <div className="mb-4">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="space-y-1">
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                    </div>
                  </div>
                </div>
                
                {/* Skeleton button */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="h-10 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Once data is loaded, render the actual cards with a fade-in animation
  return (
    <div className="container mx-auto px-4 py-8">
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {cursos.map((curso) => (
          <div
            key={curso.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer flex flex-col h-full fade-in"
            onClick={() => navigate(`/cursos/${curso.id}`)}
          >
            {/* Your existing card content */}
            <div className="relative">
              <span className="absolute top-4 left-4 bg-[#8BAE52] text-white px-3 py-1 rounded-md text-sm capitalize">
                {curso.dirigidoA || "General"}
              </span>
              <img
                src={curso.imagen || curso.imagenUrl}
                alt={curso.titulo}
                className="w-full h-48 object-cover"
              />
            </div>
            
            <div className="p-6 flex flex-col flex-1">
              <div className="flex-1">
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
              </div>
              
              {/* Button container - always at bottom */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <button
                  className="w-full bg-[#1A3D33] text-white py-2 rounded-md hover:bg-[#8BAE52] transition-colors"
                  onClick={(e) => {
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

                      axios.post(
                        `${baseURL}/api/cursos/${curso.id}/registrarParticipante`,
                        {},
                        {
                          headers: { Authorization: `Bearer ${token}` },
                        }
                      ).then(() => {
                        alert("¡Registro exitoso!");
                        navigate(`/cursos/${curso.id}`);
                      });
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default Courses;