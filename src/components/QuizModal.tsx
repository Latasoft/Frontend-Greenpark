import { useState, useEffect } from 'react';
import axios from 'axios';

interface OpcionQuiz {
  texto: string;
  correcta?: boolean;
}

interface Pregunta {
  texto: string;
  opciones: OpcionQuiz[] | string[];
  respuestaCorrecta: number | string;
}

interface Quiz {
  preguntas: Pregunta[];
}


interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuizComplete: (passed: boolean, score: number) => void;
  initialScore: number;
  quiz?: Quiz;
  cursoId?: string;
  moduloIndex?: number;
}

const QuizModal = ({ 
  isOpen, 
  onClose, 
  onQuizComplete, 
  initialScore, 
  quiz, 
  cursoId, 
  moduloIndex 
}: QuizModalProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(initialScore);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use default questions if no quiz is provided
  const questions = quiz?.preguntas ? quiz.preguntas.map(p => ({
    question: p.texto,
    options: Array.isArray(p.opciones) ? 
      p.opciones.map(opt => typeof opt === 'string' ? opt : opt.texto) : [],
    correctAnswer: Number(p.respuestaCorrecta)
  })) : [
    {
      question: "¿Qué es el aprendizaje automático (Machine Learning)?",
      options: [
        "Un tipo de robot físico",
        "Un subcampo de la IA que permite a las máquinas aprender de los datos",
        "Un lenguaje de programación",
        "Un dispositivo electrónico"
      ],
      correctAnswer: 1
    },
    {
      question: "¿Cuál es el principal beneficio de la IA en la educación personalizada?",
      options: [
        "Reemplazar completamente a los profesores",
        "Reducir costos administrativos",
        "Adaptar el contenido al ritmo y estilo de aprendizaje de cada estudiante",
        "Eliminar la necesidad de evaluaciones"
      ],
      correctAnswer: 2
    },
    {
      question: "¿Qué es la retroalimentación adaptativa en educación con IA?",
      options: [
        "Comentarios automáticos aleatorios",
        "Feedback personalizado basado en el desempeño individual",
        "Calificaciones numéricas",
        "Correos electrónicos automatizados"
      ],
      correctAnswer: 1
    },
    {
      question: "¿Cuál es un desafío ético en el uso de IA en educación?",
      options: [
        "La privacidad y protección de datos de los estudiantes",
        "El costo del hardware",
        "La velocidad de internet",
        "El tamaño de las pantallas"
      ],
      correctAnswer: 0
    },
    {
      question: "¿Qué es un sistema de tutoría inteligente (ITS)?",
      options: [
        "Un profesor robot físico",
        "Un programa que proporciona instrucción personalizada",
        "Una tablet educativa",
        "Un libro digital"
      ],
      correctAnswer: 1
    }
  ];

  useEffect(() => {
    if (isOpen) {
      setScore(initialScore);
      setShowResults(false);
      setCurrentQuestion(0);
      setAnswers([]);
      setError(null);
    }
  }, [isOpen, initialScore]);

  // Guardar respuestas en el backend
  const guardarRespuestasQuiz = async () => {
    if (!cursoId || moduloIndex === undefined) return true;
    
    try {
      setGuardando(true);
      setError(null);
      
      // Obtener token y userData del localStorage
      const token = localStorage.getItem("token");
      const userDataStr = localStorage.getItem("userData");
      
      if (!token) {
        console.error("No hay token de autenticación");
        setError("No hay sesión activa. Inicie sesión nuevamente.");
        return false;
      }
      
      // Obtener el ID de usuario desde localStorage
      let usuarioId = null;
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          usuarioId = userData.uid || userData.id;
          console.log("ID de usuario obtenido:", usuarioId);
        } catch (e) {
          console.error("Error al parsear userData:", e);
        }
      }
      
      // Mapear las respuestas para enviarlas al backend
      const respuestasPreguntas = questions.map((question, i) => ({
        pregunta: question.question,
        respuestaUsuario: answers[i] !== undefined ? answers[i] : 0,
        esCorrecta: answers[i] === question.correctAnswer
      }));

      const porcentaje = Math.round((score / questions.length) * 100);
      
      // Definir la URL base
      const baseURL =
        window.location.hostname === "localhost"
          ? "http://localhost:3000"
          : "https://backend-greenpark.onrender.com";
      
      // Construir el payload con todos los datos necesarios
      const payload = {
        cursoId,
        moduloIndex,
        respuestas: respuestasPreguntas,
        porcentaje,
        puntajeTotal: score,
        totalPreguntas: questions.length,
        usuarioId // Incluir el ID de usuario como fallback
      };
      
      console.log("Enviando respuestas al servidor:", payload);
      
      // Hacer la petición al servidor con el token en las cabeceras
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
      
      console.log("Respuestas guardadas:", response.data);
      return true;
    } catch (err: any) {
      console.error("Error al guardar respuestas:", err);
      let errorMsg = "Error al guardar las respuestas. Los resultados podrían no haberse registrado.";
      
      // Mostrar mensaje más específico si está disponible
      if (err.response && err.response.data && err.response.data.mensaje) {
        errorMsg = `Error: ${err.response.data.mensaje}`;
      }
      
      setError(errorMsg);
      return false;
    } finally {
      setGuardando(false);
    }
  };

  const handleSaveAndClose = async () => {
    const currentScore = (score / questions.length) * 100;
    
    if (cursoId && moduloIndex !== undefined) {
      await guardarRespuestasQuiz();
    }
    
    onQuizComplete(currentScore >= 51, currentScore);
    onClose();
  };

  const handleAnswer = (selectedOption: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = selectedOption;
    setAnswers(newAnswers);

    // Incrementar la puntuación si la respuesta es correcta
    const newScore = selectedOption === questions[currentQuestion].correctAnswer ? 
      score + 1 : score;
    setScore(newScore);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
      const finalScore = newScore; // Usar la nueva puntuación que acabamos de calcular
      const passed = (finalScore / questions.length) >= 0.51;
      
      // Solo guardamos al final del quiz
      if (cursoId && moduloIndex !== undefined) {
        // Esperar a que todas las actualizaciones de estado se completen
        setTimeout(() => {
          guardarRespuestasQuiz().then(() => {
            onQuizComplete(passed, finalScore);
          });
        }, 0);
      } else {
        onQuizComplete(passed, finalScore);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#1A3D33]">
            Pregunta {currentQuestion + 1} de {questions.length}
          </h2>
          <button 
            onClick={handleSaveAndClose}
            className="text-gray-500 hover:text-[#1A3D33]"
          >
            Guardar y cerrar
          </button>
        </div>
        {!showResults ? (
          <>
            <p className="text-lg mb-4">{questions[currentQuestion].question}</p>
            <div className="space-y-3">
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className="w-full text-left p-3 border rounded hover:bg-gray-50"
                >
                  {option}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#1A3D33] mb-4">
              Resultados
            </h2>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <p className="text-lg mb-4">
              Has acertado {score} de {questions.length} preguntas
            </p>
            <p className="text-lg mb-6">
              {(score / questions.length) >= 0.51 
                ? "¡Felicitaciones! Has desbloqueado el siguiente módulo" 
                : "Necesitas al menos 51% para desbloquear el siguiente módulo"}
            </p>
            <button
              onClick={handleSaveAndClose}
              disabled={guardando}
              className={`bg-[#1A3D33] text-white px-6 py-2 rounded hover:bg-[#8BAE52] ${
                guardando ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {guardando ? 'Guardando...' : 'Guardar progreso y cerrar'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizModal;
