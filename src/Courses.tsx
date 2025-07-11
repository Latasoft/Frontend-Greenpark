import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const baseURL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://greenpark-backend-0ua6.onrender.com";

const Courses = () => {
  const [cursos, setCursos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCursos = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/cursos/lista`)

        setCursos(res.data);
      } catch (err) {
        setError("Error al cargar cursos");
      } finally {
        setLoading(false);
      }
    };
    fetchCursos();
  }, []);

  if (loading) return <p className="text-center mt-8">Cargando cursos...</p>;
  if (error) return <p className="text-center mt-8 text-red-600">{error}</p>;

  return (
    <div className="min-h-screen bg-white">
      <section
        className="relative h-[300px] bg-cover bg-center flex items-center"
        style={{
          backgroundImage: `url('/assets/curso-banner.png')`, // Ajusta la ruta de la imagen
        }}
      >
        <div
          className="absolute inset-0"
          style={{ backgroundColor: "#1A3D33", opacity: "0.85" }}
        ></div>
        <div className="relative w-full text-center">
          <h1 className="text-[32px] text-white font-bold mb-4">
            Transforma tu Carrera Educativa
          </h1>
          <p className="text-base text-white max-w-3xl mx-auto">
            Cursos especializados con enfoque práctico y profesional
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {cursos.map((curso) => (
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
                    src={curso.imagenUrl}
                    alt={curso.titulo}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-[#1A3D33] mb-4">
                    {curso.titulo}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <span>Duración: {curso.duracionHoras || "N/A"} horas</span>
                  </div>
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-[#1A3D33] mb-2">
                      Herramientas:
                    </h4>
                    <p className="text-sm text-gray-600">
                      {curso.herramientas?.join(", ") || "No especificado"}
                    </p>
                  </div>
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-[#1A3D33] mb-2">
                      Aprenderás:
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                      {curso.loAprenderan && curso.loAprenderan.length > 0 ? (
                        curso.loAprenderan.map((item: string, index: number) => (
                          <li key={index}>{item}</li>
                        ))
                      ) : (
                        <li>No especificado</li>
                      )}
                    </ul>
                  </div>
                  <button
                    className="w-full bg-[#1A3D33] text-white py-2 rounded-md hover:bg-[#8BAE52] transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/cursos/${curso.id}`);
                    }}
                  >
                    Comenzar Curso
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Courses;
