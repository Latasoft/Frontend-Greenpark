import React from 'react';

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

const QuizModal: React.FC<QuizModalProps> = ({ isOpen, onClose, quiz,  }) => {
  if (!isOpen) return null;

  // Implementación del modal aquí

  return (
    <div>
      <h2>Quiz</h2>
      {quiz.preguntas.map((preg, i) => (
        <div key={i}>
          <p>{preg.pregunta}</p>
          {/* Aquí las opciones */}
        </div>
      ))}
      <button onClick={onClose}>Cerrar</button>
    </div>
  );
};

export default QuizModal;
