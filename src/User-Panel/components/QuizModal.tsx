import { useEffect, useState } from "react";

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
  onQuizComplete: (passed: boolean, score: number) => void;
}

const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  quiz,
  onQuizComplete,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentQuestion(0);
      setScore(0);
      setAnswers([]);
      setShowResults(false);
    }
  }, [isOpen]);

  const handleAnswer = (selectedOption: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = selectedOption;
    setAnswers(newAnswers);

    if (selectedOption === quiz.preguntas[currentQuestion].respuestaCorrecta) {
      setScore((prev) => prev + 1);
    }

    if (currentQuestion < quiz.preguntas.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
      const finalScore = ((score + 1) / quiz.preguntas.length) * 100;
      const passed = finalScore >= 51;
      onQuizComplete(passed, finalScore);
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-xl w-full shadow-xl relative">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-xl"
        >
          ×
        </button>

        {!showResults ? (
          <>
            <h2 className="text-2xl font-bold text-[#1A3D33] mb-4">
              Pregunta {currentQuestion + 1} de {quiz.preguntas.length}
            </h2>
            <p className="text-lg text-gray-800 mb-6">
              {quiz.preguntas[currentQuestion].pregunta}
            </p>
            <div className="space-y-3">
              {quiz.preguntas[currentQuestion].opciones.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className="w-full text-left p-3 border border-gray-300 rounded hover:bg-gray-50 transition"
                >
                  {option}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#1A3D33] mb-4">
              Resultados del Quiz
            </h2>
            <p className="text-lg mb-3">
              Has respondido correctamente {score} de {quiz.preguntas.length} preguntas.
            </p>
            <p className="text-lg mb-6">
              {(score / quiz.preguntas.length) * 100 >= 51
                ? "✅ ¡Aprobaste el quiz!"
                : "❌ No alcanzaste el mínimo de 51% para aprobar."}
            </p>
            <button
              onClick={handleClose}
              className="bg-[#1A3D33] text-white px-6 py-2 rounded hover:bg-[#8BAE52] transition"
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
