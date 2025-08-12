import React, { useState, useEffect, useCallback } from "react";
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

interface ArchivoModulo {
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
  archivosModulo?: ArchivoModulo[];
  quiz?: Quiz;
}

interface Curso {
  id: string;
  titulo: string;
  imagen: string;
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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openModulo, setOpenModulo] = useState<number | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizModuloIndex, setQuizModuloIndex] = useState<number | null>(null);
  const [quizResults, setQuizResults] = useState<Record<number, QuizResult>>({});
  const [pdfLoadErrorKeys, setPdfLoadErrorKeys] = useState<Record<string, boolean>>({});
  const [pdfVisibleModules, setPdfVisibleModules] = useState<Record<number, boolean>>({});

  const fetchCurso = useCallback(async () => {
    if (!cursoId) return;

    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${baseURL}/api/cursos/${cursoId}`);
      let data = res.data;

      if (!data.imagen && data.imagenUrl) {
        data.imagen = data.imagenUrl;
      }

      if (Array.isArray(data.modulos)) {
        data.modulos = data.modulos.map((modulo: any, idx: number) => ({
          id: modulo.id ?? idx,
          nombre:
            (modulo.nombre?.trim() ||
              modulo.titulo?.trim() ||
              `Módulo ${idx + 1}`) ?? `Módulo ${idx + 1}`,
          descripcion: modulo.descripcion || "",
          enlaces: Array.isArray(modulo.enlaces) ? modulo.enlaces : [],
          archivosModulo: modulo.archivosModulo || modulo.archivos || [],
          quiz:
            modulo.quiz && modulo.quiz.preguntas?.length > 0
              ? modulo.quiz
              : undefined,
        }));
      } else {
        data.modulos = [];
      }

      setCurso(data);
      setQuizResults({});
      setPdfLoadErrorKeys({});
      setPdfVisibleModules({});
    } catch (err) {
      setError("Error al cargar el curso.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [cursoId]);

  useEffect(() => {
    fetchCurso();
  }, [fetchCurso]);

  const toggleModulo = (index: number) =>
    setOpenModulo((prev) => (prev === index ? null : index));

  const handleAbrirQuiz = (index: number) => {
    setQuizModuloIndex(index);
    setShowQuiz(true);
  };

  const handleCerrarQuiz = () => {
    setShowQuiz(false);
    setQuizModuloIndex(null);
  };

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

    const nuevosResultados = {
      ...quizResults,
      [quizModuloIndex]: { passed, score, respuestas },
    };
    setQuizResults(nuevosResultados);
    setShowQuiz(false);
    setQuizModuloIndex(null);

    const modulosConQuiz = curso?.modulos.filter((m) => m.quiz).length ?? 0;
    const modulosAprobados = Object.values(nuevosResultados).filter(
      (r) => r.passed
    ).length;
    const progreso =
      modulosConQuiz > 0
        ? Math.round((modulosAprobados / modulosConQuiz) * 100)
        : 0;

    try {
      await axios.post(
        `${baseURL}/api/cursos/${cursoId}/usuarios/${usuarioId}/progreso`,
        { progreso },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      console.log("Progreso actualizado:", progreso);
    } catch (error) {
      console.error("Error al actualizar progreso:", error);
    }
  };

  const handleFinalizarCurso = async () => {
    if (!cursoId || !curso) return;

    const usuarioId = localStorage.getItem("userId");
    if (!usuarioId) {
      alert("Debes iniciar sesión para finalizar el curso.");
      return;
    }

    let totalPreguntas = 0;
    let totalCorrectas = 0;

    curso.modulos.forEach((modulo, idx) => {
      if (modulo.quiz && quizResults[idx]) {
        totalPreguntas += modulo.quiz.preguntas.length;
        modulo.quiz.preguntas.forEach((pregunta, i) => {
          if (
            quizResults[idx].respuestas[i] === pregunta.respuestaCorrecta
          ) {
            totalCorrectas++;
          }
        });
      }
    });

    const porcentajeFinal =
      totalPreguntas > 0
        ? Math.round((totalCorrectas / totalPreguntas) * 100)
        : 0;

    try {
      await axios.post(
        `${baseURL}/api/cursos/${cursoId}/usuarios/${usuarioId}/progreso`,
        { progreso: porcentajeFinal },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      alert(`Curso finalizado con ${porcentajeFinal}% de progreso.`);
    } catch (error) {
      console.error("Error al finalizar curso:", error);
      alert("No se pudo finalizar el curso. Intenta más tarde.");
    }
  };

  const onIframeError = (key: string) => {
    setPdfLoadErrorKeys((prev) => ({ ...prev, [key]: true }));
  };

  const togglePdfVisibility = (moduloIndex: number) => {
    setPdfVisibleModules((prev) => ({
      ...prev,
      [moduloIndex]: !prev[moduloIndex],
    }));
  };

  const renderArchivosPDF = (modulo: Modulo, moduloIndex: number) => {
    if (!modulo.archivosModulo?.length) return null;

    const isVisible = pdfVisibleModules[moduloIndex];

    return (
      <div>
        <h4 className="text-[#1A3D33] font-semibold mb-2 flex items-center justify-between">
          Archivos PDF
          <button
            type="button"
            onClick={() => togglePdfVisibility(moduloIndex)}
            className="text-sm bg-[#1A3D33] text-white px-3 py-1 rounded hover:bg-[#8BAE52] transition"
          >
            {isVisible ? "Ocultar" : "Mostrar"}
          </button>
        </h4>
        {isVisible &&
          modulo.archivosModulo.map((archivo, archivoIndex) => {
            const key = `${moduloIndex}-${archivoIndex}`;
            if (
              !archivo.url ||
              typeof archivo.url !== "string" ||
              archivo.url.trim() === ""
            ) {
              return (
                <p key={key} className="text-red-600 font-semibold">
                  URL inválida o no disponible para:{" "}
                  {archivo.nombre || `Archivo ${archivoIndex + 1}`}
                </p>
              );
            }
            if (pdfLoadErrorKeys[key]) {
              return (
                <p key={key} className="text-red-600 font-semibold">
                  No se pudo cargar el PDF:{" "}
                  {archivo.nombre || `Archivo ${archivoIndex + 1}`}
                </p>
              );
            }

            const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(
              archivo.url
            )}&embedded=true`;

            return (
              <div key={key} className="mb-6 border rounded p-2 shadow-sm">
                <p className="font-semibold mb-2">
                  {archivo.nombre || `Archivo ${archivoIndex + 1}`}
                </p>

                {/* Eliminar el enlace para abrir o descargar */}

                <iframe
                  src={viewerUrl}
                  title={archivo.nombre || `Archivo PDF ${archivoIndex + 1}`}
                  width="100%"
                  height="600px"
                  frameBorder="0"
                  onError={() => onIframeError(key)}
                  aria-label={`Archivo PDF ${
                    archivo.nombre || archivoIndex + 1
                  }`}
                />
              </div>
            );
          })}
      </div>
    );
  };

  const renderEnlaces = (modulo: Modulo) => {
    if (!modulo.enlaces?.length) return null;

    return (
      <div>
        <h4 className="text-[#1A3D33] font-semibold mb-2">Enlaces útiles:</h4>
        <ul className="list-disc list-inside text-blue-700 space-y-1 text-sm sm:text-base">
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
    );
  };

  if (loading) {
    return <p className="text-center mt-8 text-gray-600">Cargando curso...</p>;
  }

  if (error) {
    return (
      <p className="text-center mt-8 text-red-600 font-semibold">{error}</p>
    );
  }

  if (!curso) {
    return (
      <p className="text-center mt-8 text-gray-600 font-semibold">
        Curso no encontrado
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-white max-w-5xl mx-auto p-4 sm:p-6">
      {/* Banner */}
      <div
        className="relative h-64 sm:h-80 md:h-96 bg-cover bg-center rounded-lg mb-8 shadow-md"
        style={{ backgroundImage: `url(${curso.imagen})` }}
      >
        <div className="absolute inset-0 bg-[#1A3D33] opacity-90 rounded-lg" />
        <div className="relative z-10 text-white p-6 sm:p-8 flex flex-col justify-center h-full">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3">
            {curso.titulo}
          </h1>
          <p className="text-sm sm:text-base mb-2">
            Duración: {curso.duracionHoras} horas
          </p>
          <p className="italic text-xs sm:text-sm mb-4">{curso.bienvenida}</p>
          <span className="inline-block bg-[#8BAE52] px-4 py-2 rounded-full text-xs sm:text-sm uppercase tracking-wide font-semibold">
            Dirigido a: {curso.dirigidoA || "General"}
          </span>
        </div>
      </div>

      {/* Herramientas */}
      <section className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-semibold text-[#1A3D33] mb-4">
          Herramientas
        </h2>
        <p className="text-gray-700 text-sm sm:text-base">
          {curso.herramientas.length
            ? curso.herramientas.join(", ")
            : "No especificado"}
        </p>
      </section>

      {/* Aprenderás */}
      <section className="mb-10">
        <h2 className="text-2xl sm:text-3xl font-semibold text-[#1A3D33] mb-4">
          Aprenderás
        </h2>
        <ul className="list-disc list-inside text-gray-800 space-y-1 text-sm sm:text-base">
          {curso.loAprenderan.length > 0 ? (
            curso.loAprenderan.map((item, idx) => <li key={idx}>{item}</li>)
          ) : (
            <li>No especificado</li>
          )}
        </ul>
      </section>

      {/* Módulos */}
      <section>
        <h2 className="text-2xl sm:text-3xl font-semibold text-[#1A3D33] mb-6">
          Módulos
        </h2>

        {curso.modulos.length === 0 ? (
          <p className="text-gray-600">No hay módulos disponibles.</p>
        ) : (
          <div className="space-y-6">
            {curso.modulos.map((modulo, moduloIndex) => {
              const keyId = modulo.id ?? moduloIndex;
              return (
                <div key={keyId} className="border rounded-lg shadow-sm">
                  <button
                    type="button"
                    aria-expanded={openModulo === moduloIndex}
                    className="w-full p-4 sm:p-5 flex justify-between items-center bg-gray-100 hover:bg-gray-200 text-[#1A3D33] text-sm sm:text-lg font-semibold rounded-t-lg text-left"
                    onClick={() => toggleModulo(moduloIndex)}
                  >
                    <span className="flex-1 break-words pr-2">
                      Módulo {moduloIndex + 1} - {modulo.nombre}
                    </span>
                    <svg
                      className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform ${
                        openModulo === moduloIndex ? "rotate-180" : ""
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
                  {openModulo === moduloIndex && (
                    <div className="p-4 sm:p-6 border-t border-gray-300 bg-white rounded-b-lg space-y-5">
                      <p className="text-gray-700 text-sm sm:text-base">
                        {modulo.descripcion}
                      </p>

                      {renderArchivosPDF(modulo, moduloIndex)}
                      {renderEnlaces(modulo)}

                      {modulo.quiz && modulo.quiz.preguntas.length > 0 && (
                        <>
                          <button
                            type="button"
                            className="mt-2 px-5 py-2 bg-[#1A3D33] text-white font-semibold rounded hover:bg-[#8BAE52] transition text-sm sm:text-base"
                            onClick={() => handleAbrirQuiz(moduloIndex)}
                          >
                            {quizResults[moduloIndex]
                              ? `Evaluación completada - Puntaje: ${quizResults[moduloIndex].score}%`
                              : "Completar Evaluación"}
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <button
        type="button"
        onClick={handleFinalizarCurso}
        className="mt-10 w-full py-3 bg-[#8BAE52] text-white font-semibold rounded hover:bg-[#6f8a3d] transition"
      >
        Finalizar curso
      </button>

      {showQuiz &&
        quizModuloIndex !== null &&
        curso.modulos[quizModuloIndex]?.quiz && (
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
