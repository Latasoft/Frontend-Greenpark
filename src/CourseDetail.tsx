import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import CourseQuizModal from "./components/CourseQuizModal";
import './styles/animations.css';

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
  texto: string; // Changed from pregunta to texto
  opciones: string[]; // If OpcionQuiz is imported, use that type
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

interface ModuloCompletado {
  moduloIndex: number;
  aprobado: boolean;
  porcentaje: number;
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
  const [modulosCompletados, setModulosCompletados] = useState<ModuloCompletado[]>([]);
  const [diplomaUrl, setDiplomaUrl] = useState<string | null>(null);
  const [finalizandoCurso, setFinalizandoCurso] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState(false);

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
              ? {
                  ...modulo.quiz,
                  preguntas: modulo.quiz.preguntas.map((preg: any) => ({
                    texto: preg.texto ?? preg.pregunta ?? "",
                    opciones: preg.opciones,
                    respuestaCorrecta: preg.respuestaCorrecta,
                  })),
                }
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
  
  // Función para cargar intentos previos de los módulos y verificar certificados existentes
  const cargarIntentosPrevios = async () => {
    if (!curso || !cursoId) return;
    
    const usuarioId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    
    if (!usuarioId || !token) {
      console.error("Usuario no autenticado");
      return;
    }
    
    // Verificar si ya existe un certificado para este curso
    try {
      const certificadosResponse = await axios.get(
        `${baseURL}/api/certificados/usuario/${usuarioId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const certificados = certificadosResponse.data.certificados || [];
      const certificadoCurso = certificados.find((cert: { cursoId: string; }) => cert.cursoId === cursoId);
      
      if (certificadoCurso && certificadoCurso.diplomaUrl) {
        setDiplomaUrl(certificadoCurso.diplomaUrl);
      }
    } catch (error) {
      console.error("Error al cargar certificados:", error);
    }
    
    const intentosModulos: ModuloCompletado[] = [];
    
    try {
      // Para cada módulo con quiz, verificar si ya tiene intentos previos
      for (let i = 0; i < curso.modulos.length; i++) {
        if (!curso.modulos[i].quiz) continue;
        
        try {
          const response = await axios.get(
            `${baseURL}/api/quiz/intentos/${cursoId}/${i}`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          
          const { aprobado, ultimoIntento } = response.data;
          
          if (ultimoIntento) {
            intentosModulos.push({
              moduloIndex: i,
              aprobado,
              porcentaje: ultimoIntento.porcentaje || 0
            });
          }
        } catch (error) {
          console.error(`Error al verificar intentos para módulo ${i}:`, error);
        }
      }
      
      setModulosCompletados(intentosModulos);
    } catch (error) {
      console.error("Error al cargar intentos previos:", error);
    }
  };
  
  // Cargar intentos previos cuando el curso esté listo
  useEffect(() => {
    if (curso) {
      cargarIntentosPrevios();
    }
  }, [curso]);

  // Update the toggleModulo function to show PDFs when a module is opened
  const toggleModulo = (index: number) => {
    const newValue = openModulo === index ? null : index;
    setOpenModulo(newValue);

    // Automatically show PDFs when opening a module
    if (newValue !== null) {
      setPdfVisibleModules((prev) => ({
        ...prev,
        [index]: true, // Make PDFs visible when opening a module
      }));
    }
  };

  const handleAbrirQuiz = (index: number) => {
    console.log("Opening quiz for module:", index);
    setQuizModuloIndex(index);
    setShowQuiz(true);

    // Verify the quiz exists in this module
    if (curso?.modulos[index]?.quiz) {
      console.log("Quiz found:", curso.modulos[index].quiz);
      
      // Si hay un intento previo aprobado, lo mostramos en los resultados
      const intentoPrevio = modulosCompletados.find(m => m.moduloIndex === index && m.aprobado);
      if (intentoPrevio) {
        setQuizResults(prev => ({
          ...prev,
          [index]: { 
            passed: true, 
            score: intentoPrevio.porcentaje, 
            respuestas: [] // No tenemos las respuestas específicas
          }
        }));
      }
    } else {
      console.error("No quiz found for this module!");
    }
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
      // Primero registramos la respuesta al quiz
      await axios.post(
        `${baseURL}/api/cursos/${cursoId}/modulos/${quizModuloIndex}/responder`,
        {
          usuarioId,
          cursoId,
          moduloIndex: quizModuloIndex,
          respuestas,
          aprobado: passed,
          calificacion: score
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // Luego actualizamos el progreso general del curso
      await axios.post(
        `${baseURL}/api/cursos/${cursoId}/usuarios/${usuarioId}/progreso`,
        { progreso },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      
      console.log("Progreso actualizado:", progreso);
      
      // Actualizamos el estado local para mostrar el progreso actualizado inmediatamente
      if (curso) {
        // Actualizar el progreso en el estado local (el nombre del campo puede variar)
        // Si hay un error de TypeScript, es posible que el campo se llame diferente
        setCurso({
          ...curso,
          // Intentamos actualizar el campo que corresponda al progreso
          ...(curso.hasOwnProperty('porcentajeProgreso') ? { porcentajeProgreso: progreso } : {}),
          ...(curso.hasOwnProperty('progreso') ? { progreso: progreso } : {})
        });
      }
    } catch (error) {
      console.error("Error al actualizar progreso:", error);
    }
  };

  const handleFinalizarCurso = async () => {
    if (!cursoId || !curso || finalizandoCurso) return;

    const usuarioId = localStorage.getItem("userId");
    if (!usuarioId) {
      alert("Debes iniciar sesión para finalizar el curso.");
      return;
    }
    
    // Activar estado de carga
    setFinalizandoCurso(true);
    
    // Mostrar mensaje de carga
    alert("Procesando solicitud de certificado. Por favor espera...");

    // Contar los módulos con quiz
    const modulosConQuiz = curso.modulos.filter(m => m.quiz && m.quiz.preguntas.length > 0).length;
    
    if (modulosConQuiz === 0) {
      alert("Este curso no tiene evaluaciones para completar.");
      return;
    }
    
    // Contar módulos aprobados (combinar intentos previos y resultados actuales)
    const modulosAprobados = new Set();
    
    // Añadir módulos aprobados de intentos previos
    modulosCompletados.forEach(m => {
      if (m.aprobado) {
        modulosAprobados.add(m.moduloIndex);
      }
    });
    
    // Añadir módulos aprobados en esta sesión
    Object.entries(quizResults).forEach(([idx, result]) => {
      if (result.passed) {
        modulosAprobados.add(parseInt(idx));
      }
    });

    const porcentajeFinal = Math.round((modulosAprobados.size / modulosConQuiz) * 100);

    try {
      // Si el curso está 100% completado, usamos la ruta de finalizar para generar certificado
      if (porcentajeFinal === 100) {
        const response = await axios.post(
          `${baseURL}/api/cursos/finalizar`,
          { 
            cursoId,
            usuarioId
          },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        
        console.log("Respuesta de finalizar curso:", response.data);
        
        // Si se generó el certificado, guardamos la URL del diploma
        if (response.data.diplomaUrl) {
          setDiplomaUrl(response.data.diplomaUrl);
          
          // Abrir el diploma en una nueva pestaña
          const diplomaFullUrl = `${baseURL}${response.data.diplomaUrl}`;
          console.log("Abriendo diploma en:", diplomaFullUrl);
          
          try {
            window.open(diplomaFullUrl, '_blank');
            alert(`¡Felicidades! Has completado el curso. Tu certificado ha sido generado y se ha abierto en una nueva pestaña.`);
          } catch (e) {
            console.error("Error al abrir la ventana:", e);
            alert(`¡Felicidades! Has completado el curso. Tu certificado ha sido generado. Puedes acceder a él desde el botón "Ver certificado" en esta página.`);
          }
        } else {
          console.error("No se encontró diplomaUrl en la respuesta:", response.data);
          alert(`¡Felicidades! Has completado el curso. Pero hubo un problema al generar el certificado. Por favor, contacta con soporte.`);
        }
      } else {
        // El curso no está completado al 100%, solo actualizamos el progreso
        console.log(`El progreso actual es ${porcentajeFinal}%. No se puede generar el certificado hasta completar el 100%.`);
        
        // Actualizamos el progreso en la base de datos
        await axios.post(
          `${baseURL}/api/cursos/${cursoId}/usuarios/${usuarioId}/progreso`,
          { progreso: porcentajeFinal },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        
        alert(`Has completado ${porcentajeFinal}% del curso. Necesitas completar el 100% para obtener tu certificado.`);
      }
    } catch (error) {
      console.error("Error al finalizar curso:", error);
      alert("No se pudo finalizar el curso. Intenta más tarde.");
    } finally {
      // Desactivar estado de carga
      setFinalizandoCurso(false);
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

  // Replace the renderArchivosPDF function with this improved version
  const renderArchivosPDF = (modulo: Modulo, moduloIndex: number) => {
    if (!modulo.archivosModulo?.length) return null;

    const isVisible = pdfVisibleModules[moduloIndex] !== false; // Default to true if undefined

    return (
      <div>
        <h4 className="text-[#1A3D33] font-semibold mb-2 flex items-center justify-between">
          Archivos PDF
          <button
            type="button"
            onClick={() => togglePdfVisibility(moduloIndex)}
            className="text-sm  text-white px-3 py-1 rounded hover:bg-[#8BAE52] transition"
          >
            {isVisible ? "Ocultar" : "Mostrar"}
          </button>
        </h4>
        {isVisible &&
          modulo.archivosModulo.map((archivo, archivoIndex) => {
            const key = `${moduloIndex}-${archivoIndex}`;

            if (!archivo.url || typeof archivo.url !== "string" || archivo.url.trim() === "") {
              return (
                <p key={key} className="text-red-600 font-semibold">
                  URL inválida o no disponible para: {archivo.nombre || `Archivo ${archivoIndex + 1}`}
                </p>
              );
            }

            // Add a direct download link for the PDF
            const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(archivo.url)}&embedded=true`;

            return (
              <div key={key} className="mb-6 border rounded p-2 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-semibold">
                    {archivo.nombre || `Archivo ${archivoIndex + 1}`}
                  </p>

                  {/* Add direct download link */}
                  <a
                    href={archivo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline text-sm"
                  >
                    Abrir/Descargar PDF
                  </a>
                </div>

                {pdfLoadErrorKeys[key] ? (
                  // Fallback to object tag if iframe fails
                  <object
                    data={archivo.url}
                    type="application/pdf"
                    width="100%"
                    height="600px"
                    className="border"
                  >
                    <p>
                      No se pudo cargar el PDF.
                      <a href={archivo.url} target="_blank" rel="noopener noreferrer" className="ml-1 text-blue-600 hover:text-blue-800 underline">
                        Haga clic aquí para descargar el PDF
                      </a>
                    </p>
                  </object>
                ) : (
                  <iframe
                    src={viewerUrl}
                    title={archivo.nombre || `Archivo PDF ${archivoIndex + 1}`}
                    width="100%"
                    height="600px"
                    frameBorder="0"
                    onError={() => {
                      console.error(`Error loading PDF: ${archivo.url}`);
                      onIframeError(key);
                    }}
                    aria-label={`Archivo PDF ${archivo.nombre || archivoIndex + 1}`}
                    className="border"
                  />
                )}
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

  useEffect(() => {
    setIsVisible(true);
  }, []);

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
    <div className={`min-h-screen bg-white max-w-5xl mx-auto p-4 sm:p-6 opacity-0 ${
      isVisible ? 'animate-fade-in-scale' : ''
    }`}>
      {/* Banner con animación */}
      <div className={`relative h-64 sm:h-80 md:h-96 rounded-lg mb-8 shadow-md overflow-hidden opacity-0 ${
        isVisible ? 'animate-banner' : ''
      }`}>
        <div 
          className="absolute inset-0 bg-cover bg-center blur-md scale-110"
          style={{ backgroundImage: `url(${curso.imagen})` }}
        />
        <div className="absolute inset-0 bg-[#1A3D33] opacity-75 rounded-lg" />
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
      <section className={`mb-8 opacity-0 ${
        isVisible ? 'animate-slide-in' : ''
      }`} style={{ animationDelay: '0.3s' }}>
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
      <section className={`mb-10 opacity-0 ${
        isVisible ? 'animate-slide-in' : ''
      }`} style={{ animationDelay: '0.4s' }}>
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

      {/* Módulos con animación */}
      <section className={`opacity-0 ${
        isVisible ? 'animate-slide-in' : ''
      }`} style={{ animationDelay: '0.5s' }}>
        <h2 className="text-2xl sm:text-3xl font-semibold text-[#1A3D33] mb-6">
          Módulos
        </h2>

        <div className="space-y-6">
          {curso.modulos.map((modulo, moduloIndex) => (
            <div 
              key={modulo.id ?? moduloIndex} 
              className="border rounded-lg shadow-sm opacity-0 animate-slide-in"
              style={{ animationDelay: `${0.6 + moduloIndex * 0.1}s` }}
            >
              <button
                type="button"
                aria-expanded={openModulo === moduloIndex}
                className="w-full p-4 sm:p-5 flex justify-between items-center bg-gray-100 hover:bg-gray-200 text-[#1A3D33] text-sm sm:text-lg font-semibold rounded-t-lg text-left"
                onClick={() => toggleModulo(moduloIndex)}
              >
                <span className="flex-1 break-words pr-2 flex items-center">
                  {modulosCompletados.some(m => m.moduloIndex === moduloIndex && m.aprobado) && (
                    <span className="w-4 h-4 bg-green-500 rounded-full mr-2 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
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
                      {/* Verificar si hay un intento previo aprobado para este módulo */}
                      {modulosCompletados.some(m => m.moduloIndex === moduloIndex && m.aprobado) ? (
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center">
                            <div className="w-5 h-5 bg-green-500 rounded-full mr-2 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <span className="text-green-700 font-medium">
                              Módulo completado - Puntaje: {modulosCompletados.find(m => m.moduloIndex === moduloIndex)?.porcentaje || 0}%
                            </span>
                          </div>
                          <button
                            type="button"
                            className="px-5 py-2 bg-[#8BAE52] text-white font-semibold rounded hover:bg-[#1A3D33] transition text-sm sm:text-base"
                            onClick={() => handleAbrirQuiz(moduloIndex)}
                          >
                            Ver intento previo
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="mt-2 px-5 py-2 bg-[#1A3D33] text-white font-semibold rounded hover:bg-[#8BAE52] transition text-sm sm:text-base"
                          onClick={() => handleAbrirQuiz(moduloIndex)}
                        >
                          {quizResults[moduloIndex]
                            ? `Evaluación completada - Puntaje: ${quizResults[moduloIndex].score}%`
                            : "Completar Evaluación"}
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Botones con animación */}
      <div className={`mt-10 space-y-4 opacity-0 ${
        isVisible ? 'animate-slide-in' : ''
      }`} style={{ animationDelay: '0.7s' }}>
        <button
          type="button"
          onClick={handleFinalizarCurso}
          disabled={finalizandoCurso}
          className={`w-full py-3 ${
            finalizandoCurso 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-[#8BAE52] hover:bg-[#6f8a3d]"
          } text-white font-semibold rounded transition`}
        >
          {finalizandoCurso ? "Procesando solicitud..." : "Finalizar curso"}
        </button>

        {diplomaUrl && (
          <>
            <a
              href={`${baseURL}${diplomaUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 bg-[#1A3D33] text-white font-semibold rounded hover:bg-[#325b4e] transition text-center"
              onClick={(e) => {
                e.preventDefault();
                const url = `${baseURL}${diplomaUrl}`;
                console.log("Abriendo certificado en:", url);
                window.open(url, '_blank');
              }}
            >
              Ver Certificado
            </a>
            <div className="p-4 border border-gray-300 rounded bg-gray-50">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Link directo al certificado:</strong>
              </p>
              <input 
                type="text" 
                readOnly 
                value={`${baseURL}${diplomaUrl}`} 
                className="w-full p-2 border border-gray-300 rounded text-sm bg-white"
                onClick={(e) => {
                  // Seleccionar todo el texto al hacer clic
                  (e.target as HTMLInputElement).select();
                }}
              />
              <button
                type="button"
                className="mt-2 px-3 py-1 bg-gray-200 text-gray-800 rounded text-sm hover:bg-gray-300 transition"
                onClick={() => {
                  // Copiar al portapapeles
                  navigator.clipboard.writeText(`${baseURL}${diplomaUrl}`);
                  alert("URL copiada al portapapeles");
                }}
              >
                Copiar URL
              </button>
            </div>
          </>
        )}
      </div>

      {showQuiz && quizModuloIndex !== null && (
        <CourseQuizModal
          isOpen={showQuiz}
          onClose={handleCerrarQuiz}
          quiz={curso.modulos[quizModuloIndex].quiz || { preguntas: [] }}
          onQuizComplete={handleQuizComplete}
          cursoId={cursoId}
          moduloIndex={quizModuloIndex}
        />
      )}
    </div>
  );
};

export default CourseDetail;
