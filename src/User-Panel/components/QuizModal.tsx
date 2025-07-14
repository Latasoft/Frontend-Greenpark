import React, { useState } from "react";

interface Pregunta {
  pregunta: string;
  opciones: string[];
  respuestaCorrecta: number;
}

interface Quiz {
  preguntas: Pregunta[];
}

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: Quiz;
  onQuizComplete: (passed: boolean, score: number, respuestas: number[]) => void;
}

const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  quiz,
  onQuizComplete,
}) => {
  const [respuestas, setRespuestas] = useState<number[]>(
    Array(quiz.preguntas.length).fill(-1)
  );
  const [finalizado, setFinalizado] = useState(false);
  const [score, setScore] = useState(0);

  if (!isOpen) return null;

  const seleccionarRespuesta = (pregIndex: number, opcionIndex: number) => {
    if (finalizado) return;
    const nuevasRespuestas = [...respuestas];
    nuevasRespuestas[pregIndex] = opcionIndex;
    setRespuestas(nuevasRespuestas);
  };

  const calcularResultado = () => {
    let correctas = 0;
    quiz.preguntas.forEach((pregunta, i) => {
      if (respuestas[i] === pregunta.respuestaCorrecta) correctas++;
    });
    const porcentaje = Math.round((correctas / quiz.preguntas.length) * 100);
    setScore(porcentaje);
    setFinalizado(true);
    onQuizComplete(porcentaje >= 70, porcentaje, respuestas);
  };

  const reiniciarQuiz = () => {
    setRespuestas(Array(quiz.preguntas.length).fill(-1));
    setFinalizado(false);
    setScore(0);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-full overflow-auto p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 font-bold text-xl"
          aria-label="Cerrar modal"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-4 text-[#1A3D33]">Evaluación del Curso</h2>

        {quiz.preguntas.map((pregunta, i) => (
          <div key={i} className="mb-6">
            <p className="font-semibold text-[#1A3D33] mb-2">
              {i + 1}. {pregunta.pregunta}
            </p>
            <ul>
              {pregunta.opciones.map((opcion, j) => {
                const isSelected = respuestas[i] === j;
                const isCorrect = finalizado && j === pregunta.respuestaCorrecta;
                const isWrongSelected = finalizado && isSelected && j !== pregunta.respuestaCorrecta;

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
                    <div>{opcion}</div>
                    {isWrongSelected && (
                      <div className="text-sm text-red-700 mt-1 font-semibold">
                        Respuesta incorrecta
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {!finalizado ? (
          <button
            onClick={calcularResultado}
            disabled={respuestas.includes(-1)}
            className={`w-full py-2 rounded text-white font-semibold transition-colors ${
              respuestas.includes(-1)
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#1A3D33] hover:bg-[#8BAE52]"
            }`}
          >
            Finalizar Evaluación
          </button>
        ) : (
          <div className="text-center mt-6">
            <p className="mb-4 text-lg font-semibold text-[#1A3D33]">
              Puntaje: {score}% {score >= 70 ? "(Aprobado)" : "(No aprobado)"}
            </p>
            <button
              onClick={reiniciarQuiz}
              className="mr-3 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Reintentar
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#1A3D33] text-white rounded hover:bg-[#8BAE52]"
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
