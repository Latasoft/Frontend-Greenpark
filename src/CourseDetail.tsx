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

interface QuizResult {
  passed: boolean;
  score: number;
  respuestas: number[];
}

const CourseDetail = () => {
  const { cursoId } = useParams<{ cursoId: string }>();
  const [curso, setCurso] = useState<Curso | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openModulo, setOpenModulo] = useState<number | null>(null);

  const [showQuiz, setShowQuiz] = useState(false);
  const [quizModuloIndex, setQuizModuloIndex] = useState<number | null>(null);

  // Guardamos resultados por módulo, clave: índice módulo
  const [quizResults, setQuizResults] = useState<{ [index: number]: QuizResult }>({});

  useEffect(() => {
    if (!cursoId) return;
    setLoading(true);
    axios
      .get(`${baseURL}/api/cursos/${cursoId}`)
      .then((res) => {
        setCurso(res.data);
        setError(null);
        setQuizResults({});
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

  // Recibimos resultado desde QuizModal
  const handleQuizComplete = async (
    passed: boolean,
    score: number,
    respuestas: number[]
  ) => {
    if (quizModuloIndex === null || !cursoId) return;

    const usuarioId = localStorage.getItem("userId");
    if (!usuarioId) {
      console.error("Usuario no autenticado");
      return;
    }

    // Actualizamos resultados localmente
    const nuevosResultados = {
      ...quizResults,
      [quizModuloIndex]: { passed, score, respuestas },
    };
    setQuizResults(nuevosResultados);
    setShowQuiz(false);
    setQuizModuloIndex(null);

    // Calcular progreso como % de módulos con quiz aprobados
    const modulosConQuiz = curso?.modulos.filter((m) => m.quiz)?.length || 0;
    const modulosAprobados = Object.values(nuevosResultados).filter((r) => r.passed).length;
    const progresoCalculado = modulosConQuiz > 0
      ? Math.round((modulosAprobados / modulosConQuiz) * 100)
      : 0;

    // Enviar progreso al backend
    try {
      await axios.post(
        `${baseURL}/api/cursos/${cursoId}/usuarios/${usuarioId}/progreso`,
        { progreso: progresoCalculado },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("Progreso actualizado:", progresoCalculado);
    } catch (err) {
      console.error("Error al actualizar progreso:", err);
    }
  };

  // FUNCION PARA FINALIZAR CURSO Y ENVIAR PROGRESO FINAL
  const handleFinalizarCurso = async () => {
    if (!cursoId) return;

    let totalPreguntas = 0;
    let totalCorrectas = 0;

    curso?.modulos.forEach((modulo, index) => {
      if (modulo.quiz && quizResults[index]) {
        totalPreguntas += modulo.quiz.preguntas.length;
        modulo.quiz.preguntas.forEach((pregunta, i) => {
          if (quizResults[index].respuestas[i] === pregunta.respuestaCorrecta) {
            totalCorrectas++;
          }
        });
      }
    });

    const porcentajeFinal =
      totalPreguntas > 0 ? Math.round((totalCorrectas / totalPreguntas) * 100) : 0;

    const usuarioId = localStorage.getItem("userId");
    if (!usuarioId) {
      console.error("Usuario no autenticado");
      alert("Debes iniciar sesión para finalizar el curso.");
      return;
    }

    try {
      await axios.post(
        `${baseURL}/api/cursos/${cursoId}/usuarios/${usuarioId}/progreso`,
        { progreso: porcentajeFinal },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert(`Curso finalizado con progreso ${porcentajeFinal}%`);
    } catch (error) {
      console.error("Error al finalizar curso:", error);
      alert("No se pudo finalizar el curso. Intenta más tarde.");
    }
  };

  if (loading)
    return <p className="text-center mt-8 text-gray-600">Cargando curso...</p>;

  if (error)
    return (
      <p className="text-center mt-8 text-red-600 font-semibold">{error}</p>
    );

  if (!curso)
    return (
      <p className="text-center mt-8 text-gray-600 font-semibold">
        Curso no encontrado
      </p>
    );

  return (
    <div className="min-h-screen bg-white max-w-5xl mx-auto p-6">
      {/* Banner */}
      <div
        className="relative h-64 bg-cover bg-center rounded-lg mb-8 shadow-md"
        style={{ backgroundImage: `url(${curso.imagenUrl})` }}
      >
        <div
          className="absolute inset-0 bg-[#1A3D33] opacity-90 rounded-lg"
          aria-hidden="true"
        />
        <div className="relative text-white p-8 flex flex-col justify-center h-full">
          <h1 className="text-4xl font-extrabold mb-3">{curso.titulo}</h1>
          <p className="mb-3 text-lg">Duración: {curso.duracionHoras} horas</p>
          <p className="italic mb-4 max-w-lg">{curso.bienvenida}</p>
          <span className="inline-block bg-[#8BAE52] px-4 py-2 rounded-full text-sm uppercase tracking-wide font-semibold">
            Dirigido a: {curso.dirigidoA || "General"}
          </span>
        </div>
      </div>

      {/* Herramientas */}
      <section className="mb-10">
        <h2 className="text-3xl font-semibold text-[#1A3D33] mb-4">Herramientas</h2>
        <p className="text-gray-700 text-lg">
          {curso.herramientas.length
            ? curso.herramientas.join(", ")
            : "No especificado"}
        </p>
      </section>

      {/* Aprenderás */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold text-[#1A3D33] mb-4">Aprenderás</h2>
        <ul className="list-disc list-inside text-gray-800 space-y-1 text-lg">
          {curso.loAprenderan.length > 0 ? (
            curso.loAprenderan.map((item) => (
              <li key={item}>{item}</li>
            ))
          ) : (
            <li>No especificado</li>
          )}
        </ul>
      </section>

      {/* Módulos */}
      <section>
        <h2 className="text-3xl font-semibold text-[#1A3D33] mb-6">Módulos</h2>
        {curso.modulos.length === 0 ? (
          <p className="text-gray-600">No hay módulos disponibles.</p>
        ) : (
          <div className="space-y-6">
            {curso.modulos.map((modulo, index) => (
              <div
                key={modulo.id ?? modulo.nombre + index}
                className="border rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <button
                  className="w-full p-5 flex justify-between items-center bg-gray-100 hover:bg-gray-200 transition-colors font-semibold text-[#1A3D33] text-lg rounded-t-lg"
                  onClick={() => toggleModulo(index)}
                  aria-expanded={openModulo === index}
                >
                  <span>{modulo.nombre}</span>
                  <svg
                    className={`w-6 h-6 transition-transform ${
                      openModulo === index ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {openModulo === index && (
                  <div className="p-6 bg-white rounded-b-lg border-t border-gray-300">
                    <p className="mb-5 text-gray-700">{modulo.descripcion}</p>

                    {modulo.enlaces && modulo.enlaces.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold mb-3 text-[#1A3D33] text-lg">
                          Enlaces útiles:
                        </h4>
                        <ul className="list-disc list-inside text-blue-700 space-y-1">
                          {modulo.enlaces.map((enlace) => (
                            <li key={enlace.url}>
                              <a
                                href={enlace.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-blue-900"
                              >
                                {enlace.nombre}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {modulo.quiz && modulo.quiz.preguntas.length > 0 && (
                      <>
                        <button
                          className="mt-4 px-6 py-3 bg-[#1A3D33] text-white font-semibold rounded hover:bg-[#8BAE52] transition-colors"
                          onClick={() => handleAbrirQuiz(index)}
                        >
                          {quizResults[index]
                            ? `Evaluación completada - Puntaje: ${quizResults[index].score}%`
                            : "Completar Evaluación"}
                        </button>

                        {/* Mostrar resultados */}
                        {quizResults[index] && (
                          <div className="mt-4 p-4 border rounded bg-green-50 text-[#1A3D33]">
                            <p className="font-semibold mb-2">
                              Puntaje: {quizResults[index].score}%{" "}
                              {quizResults[index].passed ? "(Aprobado)" : "(No aprobado)"}
                            </p>
                            <div className="space-y-3 max-h-64 overflow-auto">
                              {modulo.quiz!.preguntas.map((pregunta, i) => {
                                const respuestaUsuario = quizResults[index].respuestas[i];
                                const correcta = pregunta.respuestaCorrecta;
                                const estaCorrecta = respuestaUsuario === correcta;
                                return (
                                  <div
                                    key={i}
                                    className={`p-2 rounded ${
                                      estaCorrecta ? "bg-green-100" : "bg-red-100"
                                    }`}
                                  >
                                    <p><strong>Pregunta:</strong> {pregunta.pregunta}</p>
                                    <p><strong>Tu respuesta:</strong> {respuestaUsuario >= 0 ? pregunta.opciones[respuestaUsuario] : "Sin responder"}</p>
                                    {!estaCorrecta && (
                                      <p>
                                        <strong>Respuesta correcta:</strong> {pregunta.opciones[correcta]}
                                      </p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* BOTÓN FINALIZAR CURSO */}
      <button
        onClick={handleFinalizarCurso}
        className="mt-8 w-full py-3 bg-[#8BAE52] text-white font-semibold rounded hover:bg-[#6f8a3d] transition-colors"
      >
        Finalizar curso
      </button>

      {/* Modal Quiz */}
      {showQuiz && quizModuloIndex !== null && curso.modulos[quizModuloIndex].quiz && (
        <QuizModal
          isOpen={showQuiz}
          onClose={handleCerrarQuiz}
          quiz={curso.modulos[quizModuloIndex].quiz!}
          onQuizComplete={handleQuizComplete}
        />
      )}
    </div>
  );
};

export default CourseDetail;
