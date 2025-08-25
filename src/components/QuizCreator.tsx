// (or whatever file contains your question adding logic)

import { useState } from 'react';

const QuizCreator = () => {
  type Question = {
    // Define your question properties here, e.g.:
    // id: number;
    // text: string;
  };

  const [questions, setQuestions] = useState<Question[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleAddQuestion = () => {
    // Prevent double submissions
    if (isSubmitting) return;
    
    // Set flag to prevent additional submissions
    setIsSubmitting(true);
    
    // Add your question to state
    const newQuestion = { /* your question data */ };
    setQuestions([...questions, newQuestion]);
    
    // Reset the flag after a short delay
    setTimeout(() => {
      setIsSubmitting(false);
    }, 300);
  };
  
  return (
    <div>
      {/* Your form fields */}
      <button 
        onClick={handleAddQuestion}
        disabled={isSubmitting}
        className="bg-[#8BAE52] text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {isSubmitting ? 'Agregando...' : 'Agregar Pregunta'}
      </button>
    </div>
  );
};

export default QuizCreator;