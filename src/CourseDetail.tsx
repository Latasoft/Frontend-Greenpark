import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import QuizModal from "./User-Panel/components/QuizModal";

const baseURL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://greenpark-backend-0ua6.onrender.com";

interface Enlace {
  nombre: string;
  url: string;
}

interface Pregunta {
  pregunta: string;
  opciones: string[];
  respuestaCorrecta: number;
}

interface Quiz {
  preguntas: Pregunta[];
}

interface Modulo {
  id: number;
  nombre: string;
  descripcion: string;
  enlaces: Enlace[];
  quiz?: Quiz;
}

interface Curso {
  id: string;
  titulo: string;
  imagenUrl: string;
  duracionHoras: number;
  herramientas: string[];
  loAprenderan: string[];
  modulos: Modulo[];
  dirigidoA: string;
  bienvenida: string;
}

const CourseDetail = () => {
  const { cursoId } = useParams<{ cursoId: string }>();
  const [curso, setCurso] = useState<Curso | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openModulo, setOpenModulo] = useState<number | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizModuloIndex, setQuizModuloIndex] = useState<number | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  useEffect(() => {
    if (!cursoId) return;
    setLoading(true);
    axios
      .get(`${baseURL}/api/cursos/${cursoId}`)
      .then((res) => {
        setCurso(res.data);
        setError(null);
      })
      .catch(() => {
        setError("Error al cargar el curso.");
      })
      .finally(() => setLoading(false));
  }, [cursoId]);

  const toggleModulo = (index: number) => {
    setOpenModulo(openModulo === index ? null : index);
  };

  const handleAbrirQuiz = (index: number) => {
    setQuizModuloIndex(index);
    setShowQuiz(true);
  };

  const handleCerrarQuiz = () => {
    setShowQuiz(false);
    setQuizModuloIndex(null);
  };

  const handleQuizComplete = (passed: boolean, score: number) => {
    setQuizCompleted(passed);
    setQuizScore(score);
    setShowQuiz(false);

    // Aquí puedes llamar al backend para registrar el progreso si quieres
  };

  if (loading) return <p className="text-center mt-8">Cargando curso...</p>;
  if (error) return <p className="text-center mt-8 text-red-600">{error}</p>;
  if (!curso) return <p className="text-center mt-8">Curso no encontrado</p>;

  return (
    <div className="min-h-screen bg-white max-w-5xl mx-auto p-6">
      {/* Banner */}
      <div
        className="relative h-64 bg-cover bg-center rounded-lg mb-6"
        style={{ backgroundImage: `url(${curso.imagenUrl})` }}
      >
        <div
          className="absolute inset-0 bg-[#1A3D33] opacity-80 rounded-lg"
          aria-hidden="true"
        />
        <div className="relative text-white p-6 flex flex-col justify-center h-full">
          <h1 className="text-3xl font-bold mb-2">{curso.titulo}</h1>
          <p className="mb-2">Duración: {curso.duracionHoras} horas</p>
          <p className="italic">{curso.bienvenida}</p>
          <span className="inline-block mt-3 bg-[#8BAE52] px-3 py-1 rounded text-sm capitalize">
            Dirigido a: {curso.dirigidoA || "General"}
          </span>
        </div>
      </div>

      {/* Herramientas */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-[#1A3D33] mb-4">Herramientas</h2>
        <p>{curso.herramientas.length ? curso.herramientas.join(", ") : "No especificado"}</p>
      </section>

      {/* Aprenderás */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-[#1A3D33] mb-4">Aprenderás</h2>
        <ul className="list-disc list-inside">
          {curso.loAprenderan.length > 0 ? (
            curso.loAprenderan.map((item, i) => <li key={i}>{item}</li>)
          ) : (
            <li>No especificado</li>
          )}
        </ul>
      </section>

      {/* Módulos */}
      <section>
        <h2 className="text-2xl font-semibold text-[#1A3D33] mb-4">Módulos</h2>
        {curso.modulos.length === 0 && <p>No hay módulos disponibles.</p>}
        <div className="space-y-4">
          {curso.modulos.map((modulo, index) => (
            <div key={modulo.id} className="border rounded-md shadow-sm">
              <button
                className="w-full p-4 flex justify-between items-center bg-gray-100 hover:bg-gray-200 transition-colors"
                onClick={() => toggleModulo(index)}
                aria-expanded={openModulo === index}
              >
                <span className="font-semibold text-[#1A3D33]">{modulo.nombre}</span>
                <svg
                  className={`w-5 h-5 transition-transform ${openModulo === index ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openModulo === index && (
                <div className="p-4 bg-white">
                  <p className="mb-4">{modulo.descripcion}</p>
                  {modulo.enlaces && modulo.enlaces.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2 text-[#1A3D33]">Enlaces útiles:</h4>
                      <ul className="list-disc list-inside text-blue-600">
                        {modulo.enlaces.map((enlace, i) => (
                          <li key={i}>
                            <a href={enlace.url} target="_blank" rel="noopener noreferrer" className="underline">
                              {enlace.nombre}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {modulo.quiz && modulo.quiz.preguntas.length > 0 && (
                    <button
                      className="mt-4 px-4 py-2 bg-[#1A3D33] text-white rounded hover:bg-[#8BAE52] transition-colors"
                      onClick={() => handleAbrirQuiz(index)}
                    >
                      {quizCompleted && quizModuloIndex === index
                        ? `Evaluación completada - Puntaje: ${quizScore}%`
                        : "Completar Evaluación"}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Modal Quiz */}
      {showQuiz && quizModuloIndex !== null && curso.modulos[quizModuloIndex].quiz && (
        <QuizModal
          isOpen={showQuiz}
          onClose={handleCerrarQuiz}
          quiz={curso.modulos[quizModuloIndex].quiz}
          onQuizComplete={handleQuizComplete}
        />
      )}
    </div>
  );
};

export default CourseDetail;
