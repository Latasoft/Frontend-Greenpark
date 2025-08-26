import React, { useState } from "react";
import axios from "axios";

const baseURL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://greenpark-backend-0ua6.onrender.com";

// Updated interface structure to match actual data
interface OpcionQuiz {
  texto: string;
  correcta?: boolean;
}

interface Pregunta {
  texto: string;  // Changed from pregunta to texto
  opciones: OpcionQuiz[] | string[];
  respuestaCorrecta: number;
}

interface Quiz {
  preguntas: Pregunta[];
}

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: Quiz;
  cursoId: string;
  moduloIndex: number;
  onQuizComplete: (passed: boolean, score: number, respuestas: number[]) => void;
}

// Interface para respuestas guardadas en la base de datos
interface RespuestaPregunta {
  pregunta: string;
  respuestaUsuario: number;
  esCorrecta: boolean;
}

interface IntentosPrevios {
  intentosPrevios: number;
  ultimoIntento: {
    id: string;
    fecha: string;
    porcentaje: number;
    puntajeTotal: number;
    totalPreguntas: number;
  } | null;
  aprobado: boolean;
}

const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  quiz,
  cursoId,
  moduloIndex,
  onQuizComplete,
}) => {
  const [respuestas, setRespuestas] = useState<number[]>([]);
  const [finalizado, setFinalizado] = useState(false);
  const [score, setScore] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [intentosPrevios, setIntentosPrevios] = useState<IntentosPrevios | null>(null);
  const [cargandoIntentos, setCargandoIntentos] = useState(false);

  // Initialize respuestas when quiz changes
  React.useEffect(() => {
    if (quiz && quiz.preguntas) {
      setRespuestas(Array(quiz.preguntas.length).fill(-1));
      console.log("Quiz preguntas:", quiz.preguntas);
    }
  }, [quiz]);

  // Verificar intentos previos cuando se abre el modal
  React.useEffect(() => {
    if (isOpen && cursoId && moduloIndex !== undefined) {
      console.log("QuizModal opened with quiz:", quiz);
      verificarIntentosPrevios();
    }
  }, [isOpen, cursoId, moduloIndex]);
  
  // Función para verificar intentos previos
  const verificarIntentosPrevios = async () => {
    try {
      setCargandoIntentos(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        console.error("No hay token de autenticación disponible");
        return;
      }
      
      const response = await axios.get(
        `${baseURL}/api/quiz/intentos/${cursoId}/${moduloIndex}`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("Intentos previos:", response.data);
      setIntentosPrevios(response.data);
      
      // Si ya aprobó este quiz previamente, informamos al usuario
      if (response.data.aprobado) {
        setScore(response.data.ultimoIntento.porcentaje);
        setFinalizado(true);
      }
      
    } catch (error) {
      console.error("Error al verificar intentos previos:", error);
    } finally {
      setCargandoIntentos(false);
    }
  };

  // Guardar respuestas en el backend
  const guardarRespuestasQuiz = async (respuestasPreguntas: RespuestaPregunta[], porcentaje: number, puntajeTotal: number) => {
    try {
      setGuardando(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No hay token de autenticación disponible");
        setError("Error de autenticación. Por favor, inicia sesión nuevamente.");
        return false;
      }

      // Get user ID from localStorage
      const usuarioId = localStorage.getItem("userId");
      if (!usuarioId) {
        console.error("No hay ID de usuario disponible");
        setError("No se pudo identificar al usuario. Por favor, inicia sesión nuevamente.");
        return false;
      }

      console.log("ID de usuario:", usuarioId);

      const payload = {
        cursoId,
        moduloIndex,
        usuarioId, // Include user ID in the payload
        respuestas: respuestasPreguntas,
        porcentaje,
        puntajeTotal,
        totalPreguntas: quiz.preguntas.length
      };

      console.log("Enviando respuestas al servidor:", payload);
      console.log("URL de la API:", `${baseURL}/api/quiz/respuestas`);
      console.log("Token de autenticación disponible:", !!token);

      try {
        const response = await axios.post(
          `${baseURL}/api/quiz/respuestas`,
          payload,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log("Respuesta del servidor:", response.status, response.data);
        return true;
      } catch (axiosError: any) {
        console.error("Error de Axios:", axiosError);
        if (axiosError.response) {
          // El servidor respondió con un código de error
          console.error("Datos de respuesta:", axiosError.response.data);
          console.error("Estado HTTP:", axiosError.response.status);
          setError(`Error del servidor: ${axiosError.response.status} - ${axiosError.response.data.mensaje || 'Error desconocido'}`);
        } else if (axiosError.request) {
          // La petición fue hecha pero no se recibió respuesta
          console.error("No se recibió respuesta del servidor");
          setError("No se pudo conectar con el servidor. Verifica tu conexión a internet.");
        } else {
          // Error al configurar la petición
          console.error("Error de configuración:", axiosError.message);
          setError(`Error al enviar la solicitud: ${axiosError.message}`);
        }
        return false;
      }
    } catch (err) {
      console.error("Error general al guardar respuestas:", err);
      setError("Error al guardar las respuestas. Intenta nuevamente.");
      return false;
    } finally {
      setGuardando(false);
    }
  };

  if (!isOpen) {
    console.log("QuizModal not showing because isOpen is false");
    return null;
  }
  
  // Update the getOptionText function to handle different option formats
  const getOptionText = (option: any): string => {
    if (option === null || option === undefined) {
      return 'Opción no disponible';
    }
    
    if (typeof option === 'string') {
      return option;
    }
    
    if (typeof option === 'object') {
      // Try to get the texto property first
      if (option.texto !== undefined) {
        return option.texto;
      }
      
      // Then try other common properties
      if (option.text !== undefined) {
        return option.text;
      }
      
      // If it has a 'label' property, use that
      if (option.label !== undefined) {
        return option.label;
      }
    }
    
    // Last resort, try to convert to string
    try {
      return String(option);
    } catch (e) {
      return 'Opción sin texto';
    }
  };
  
  const seleccionarRespuesta = (pregIndex: number, opcionIndex: number) => {
    if (finalizado) return;
    const nuevasRespuestas = [...respuestas];
    nuevasRespuestas[pregIndex] = opcionIndex;
    setRespuestas(nuevasRespuestas);
  };

  // Update the calcularResultado function to handle various formats of respuestaCorrecta
  const calcularResultado = async () => {
    console.log("Calculando resultado...");
    console.log("Respuestas seleccionadas:", respuestas);
    
    // Si ya había aprobado el quiz anteriormente y no ha respondido nada nuevo,
    // simplemente notificamos el resultado anterior
    if (intentosPrevios?.aprobado && respuestas.every(r => r === -1)) {
      console.log("Quiz ya aprobado anteriormente, no se requiere cálculo nuevo");
      setScore(intentosPrevios.ultimoIntento?.porcentaje || 0);
      setFinalizado(true);
      onQuizComplete(true, intentosPrevios.ultimoIntento?.porcentaje || 0, respuestas);
      return;
    }
    
    let correctas = 0;
    // Interface for respuestasPreguntas items
    interface RespuestaPreguntaItem {
      pregunta: string;
      respuestaUsuario: number;
      esCorrecta: boolean;
    }
    const respuestasPreguntas: RespuestaPreguntaItem[] = [];
    
    quiz.preguntas.forEach((pregunta, i) => {
      // Get user's selected answer
      const respuestaSeleccionada = respuestas[i];
      
      // Extract the correct answer, handling different possible formats
      let respuestaCorrecta;
      
      if (pregunta.respuestaCorrecta !== undefined) {
        // Try to parse as number if it's a string
        if (typeof pregunta.respuestaCorrecta === 'string') {
          respuestaCorrecta = parseInt(pregunta.respuestaCorrecta, 10);
        } else {
          respuestaCorrecta = pregunta.respuestaCorrecta;
        }
      }
      
      // If we can't get a valid number, try looking for option with correcta=true
      if (isNaN(respuestaCorrecta ?? NaN) && Array.isArray(pregunta.opciones)) {
        const correctIndex = pregunta.opciones.findIndex(
          opcion => typeof opcion === 'object' && opcion.correcta === true
        );
        if (correctIndex !== -1) {
          respuestaCorrecta = correctIndex;
        }
      }
      
      console.log(`Pregunta ${i}: Seleccionada=${respuestaSeleccionada}, Correcta=${respuestaCorrecta}`);
      
      // Check if answer is correct (using == to do type coercion)
      const esCorrecta = respuestaSeleccionada == respuestaCorrecta;
      if (esCorrecta) {
        console.log(`Pregunta ${i} correcta!`);
        correctas++;
      }
      
      respuestasPreguntas.push({
        pregunta: pregunta.texto,
        respuestaUsuario: respuestaSeleccionada,
        esCorrecta
      });
    });
    
    const porcentaje = Math.round((correctas / quiz.preguntas.length) * 100);
    console.log(`Porcentaje final: ${porcentaje}% (${correctas}/${quiz.preguntas.length} correctas)`);
    
    setScore(porcentaje);
    setFinalizado(true);

    // Guardar respuestas en el backend solo si es un nuevo intento o si mejoró su calificación
    const debeGuardar = !intentosPrevios?.aprobado || 
                      (intentosPrevios?.ultimoIntento?.porcentaje || 0) < porcentaje;
                      
    if (debeGuardar) {
      console.log("Guardando nuevo intento en el backend");
      await guardarRespuestasQuiz(respuestasPreguntas, porcentaje, correctas);
    } else {
      console.log("No se guarda el nuevo intento porque ya había aprobado con mejor calificación");
    }
    
    // Notificar resultado. Si ya había aprobado antes, mantener ese estado aprobado
    // independientemente del resultado actual
    const aprobado = porcentaje >= 70 || intentosPrevios?.aprobado || false;
    onQuizComplete(aprobado, porcentaje, respuestas);
  };

  const reiniciarQuiz = () => {
    setRespuestas(Array(quiz.preguntas.length).fill(-1));
    setFinalizado(false);
    setScore(0);
  };

  return (
    <div
      className="fixed inset-0 flex justify-center items-center z-50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-full overflow-auto p-6 relative shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 font-bold text-xl"
          aria-label="Cerrar modal"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-4 text-[#1A3D33]">Evaluación del Curso</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {/* Mostrar información de intentos previos */}
        {intentosPrevios && intentosPrevios.intentosPrevios > 0 && (
          <div className={`p-4 mb-4 rounded ${intentosPrevios.aprobado ? 'bg-green-100' : 'bg-yellow-100'}`}>
            <h3 className="font-semibold text-lg mb-2">
              {intentosPrevios.aprobado 
                ? '✅ Ya has completado esta evaluación' 
                : '⚠️ Tienes intentos previos en esta evaluación'}
            </h3>
            <p>
              {intentosPrevios.aprobado 
                ? `Aprobaste este quiz con ${intentosPrevios.ultimoIntento?.porcentaje || 0}% de calificación.`
                : `Has realizado ${intentosPrevios.intentosPrevios} intento(s) previo(s). Tu última calificación fue de ${intentosPrevios.ultimoIntento?.porcentaje || 0}%.`}
            </p>
            {intentosPrevios.aprobado && (
              <p className="mt-2 text-sm text-gray-700">
                Puedes volver a tomar el quiz si deseas mejorar tu calificación, pero tu progreso ya ha sido registrado.
              </p>
            )}
          </div>
        )}
        
        {cargandoIntentos && (
          <div className="flex justify-center items-center mb-4 p-2">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1A3D33]"></div>
            <span className="ml-2">Verificando intentos previos...</span>
          </div>
        )}

        {quiz.preguntas.map((pregunta, i) => (
          <div key={i} className="mb-6">
            <p className="font-semibold text-[#1A3D33] mb-2">
              {i + 1}. {pregunta.texto}
            </p>
            <ul>
              {Array.isArray(pregunta.opciones) && pregunta.opciones.map((opcion, j) => {
                const isSelected = respuestas[i] === j;
                
                // Get the correct answer index, handling different formats
                let correctIndex;
                if (typeof pregunta.respuestaCorrecta === 'string') {
                  correctIndex = parseInt(pregunta.respuestaCorrecta, 10);
                } else {
                  correctIndex = pregunta.respuestaCorrecta;
                }
                
                // If we couldn't parse the respuestaCorrecta, try to find an option with correcta=true
                if (isNaN(correctIndex)) {
                  const idx = pregunta.opciones.findIndex(
                    op => typeof op === 'object' && op.correcta === true
                  );
                  if (idx !== -1) correctIndex = idx;
                }
                
                const isCorrect = finalizado && j === correctIndex;
                const isWrongSelected = finalizado && isSelected && j !== correctIndex;

                return (
                  <li
                    key={j}
                    className={`cursor-pointer border rounded px-3 py-2 mb-1 transition-colors
                      ${
                        isCorrect
                          ? "bg-green-200 border-green-500"
                          : isWrongSelected
                          ? "bg-red-200 border-red-500"
                          : isSelected
                          ? "bg-gray-200"
                          : "hover:bg-gray-100"
                      }`}
                    onClick={() => seleccionarRespuesta(i, j)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") seleccionarRespuesta(i, j);
                    }}
                  >
                    <div>{getOptionText(opcion)}</div>
                    {finalizado && (
                      <div>
                        {isCorrect && (
                          <div className="text-sm text-green-700 mt-1 font-semibold">
                            ✓ Respuesta correcta
                          </div>
                        )}
                        {isWrongSelected && (
                          <div className="text-sm text-red-700 mt-1 font-semibold">
                            ✗ Respuesta incorrecta
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {!finalizado ? (
          <>
            <button
              onClick={calcularResultado}
              disabled={respuestas.includes(-1) || guardando}
              className={`w-full py-2 rounded text-white font-semibold transition-colors ${
                respuestas.includes(-1) || guardando
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#1A3D33] hover:bg-[#8BAE52]"
              }`}
            >
              {guardando ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </span>
              ) : (
                "Finalizar Evaluación"
              )}
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Al finalizar, tus resultados se guardarán en tu perfil de estudiante
            </p>
          </>
        ) : (
          <div className="text-center mt-6">
            <p className="mb-4 text-lg font-semibold text-[#1A3D33]">
              Puntaje: {score}% {score >= 70 ? "(Aprobado)" : "(No aprobado)"}
            </p>
            <button
              onClick={reiniciarQuiz}
              className="mr-3 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              disabled={guardando}
            >
              Reintentar
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#1A3D33] text-white rounded hover:bg-[#8BAE52]"
              disabled={guardando}
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizModal;
