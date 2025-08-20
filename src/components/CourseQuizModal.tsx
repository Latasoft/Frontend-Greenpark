import React from "react";
import QuizModal from "../components/QuizModal";
import UserPanelQuizModal from "../User-Panel/components/QuizModal";

interface Quiz {
  preguntas: any[];
}

interface CourseQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: Quiz;
  onQuizComplete: (passed: boolean, score: number, respuestas: number[]) => void;
  cursoId?: string;
  moduloIndex?: number;
}

/**
 * Wrapper component that chooses the correct QuizModal implementation based on available props
 */
const CourseQuizModal: React.FC<CourseQuizModalProps> = (props) => {
  const { isOpen, onClose, quiz, onQuizComplete, cursoId, moduloIndex } = props;
  
  // If we're in the user panel context, use that component
  if (typeof cursoId !== 'undefined' && typeof moduloIndex !== 'undefined') {
    return (
      <UserPanelQuizModal
        isOpen={isOpen}
        onClose={onClose}
        quiz={quiz}
        onQuizComplete={onQuizComplete}
        cursoId={cursoId}
        moduloIndex={moduloIndex}
      />
    );
  }
  
  // Otherwise use the standard component
  return (
    <QuizModal
      isOpen={isOpen}
      onClose={onClose}
      initialScore={0}
      onQuizComplete={(passed, score) => onQuizComplete(passed, score, [])}
    />
  );
};

export default CourseQuizModal;
