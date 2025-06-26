import { useState, useEffect } from 'react';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuizComplete: (passed: boolean, score: number) => void;
  initialScore: number;
}

const QuizModal = ({ isOpen, onClose, onQuizComplete, initialScore }: QuizModalProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(initialScore);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  const questions = [
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
    }
  }, [isOpen, initialScore]);

  const handleSaveAndClose = () => {
    const currentScore = (score / questions.length) * 100;
    onQuizComplete(currentScore >= 51, currentScore);
    onClose();
  };

  const handleAnswer = (selectedOption: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = selectedOption;
    setAnswers(newAnswers);

    if (selectedOption === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
      const passed = (score / questions.length) >= 0.51;
      onQuizComplete(passed, score);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
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
              className="bg-[#1A3D33] text-white px-6 py-2 rounded hover:bg-[#8BAE52]"
            >
              Guardar progreso y cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizModal;
