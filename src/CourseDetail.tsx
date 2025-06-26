import { useState, useEffect } from 'react'
import walle from './assets/walle.jpg'
import QuizModal from './components/QuizModal'

interface ModuleProgress {
  [key: number]: boolean;
}

const CourseDetail = () => {
  const [openModule, setOpenModule] = useState<number | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress>({
    1: true,
    2: true,
    3: false
  });
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  useEffect(() => {
    const completedModules = Object.values(moduleProgress).filter(value => value).length;
    const totalModules = Object.keys(moduleProgress).length;
    const percentage = (completedModules / totalModules) * 100;
    setProgressPercentage(percentage);
  }, [moduleProgress]);

  const handleQuizComplete = (passed: boolean, score: number) => {
    setQuizScore(score);
    setQuizCompleted(true);
    if (passed) {
      setModuleProgress(prev => ({
        ...prev,
        3: true
      }));
    }
  };

  const handleQuizContinue = () => {
    setShowQuiz(true);
  };

  const modules = [
    {
      id: 1,
      title: "Módulo 1: ¿Qué entendemos por inteligencia artificial (IA)?",
      content: "Métodos que aprenden y toman decisiones. Aprender mediante virtual, recomendaciones online."
    },
    {
      id: 2,
      title: "Módulo 2: ¿Por qué IA en la educación?",
      content: "Adaptar al aprendizaje: nuevos desafíos para los docentes frente a la IA, redefinición de roles, actualización profesional continua, y necesidad de diseñar estrategias de evaluación integrativas y éticas."
    },
    {
      id: 3,
      title: "Módulo 3: IA Generativa en la educación infantil",
      content: "La aplicación de la IA generativa en la educación infantil tiene el potencial de transformar radicalmente la forma en que se crea y"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="relative h-[250px] bg-cover bg-center" style={{ backgroundImage: `url(${walle})` }}>
        <div className="absolute inset-0" style={{ backgroundColor: '#1A3D33', opacity: '0.85' }}></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-white mb-4">
            Hacia una educación digital: Inteligencia Artificial aplicada a la Educación
          </h1>
          <p className="text-white mb-6">Duración: 8 Semanas</p>
          
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-white">Progreso general:</span>
              <span className="text-sm text-white">{Math.round(progressPercentage)}% Completado</span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-2.5">
              <div 
                className="bg-[#8BAE52] h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold text-[#1A3D33] mb-4">¡Bienvenidos!</h2>
            <p className="text-gray-600">
              Un uso ético de las IA es posible. La inteligencia artificial ya acompaña a los docentes, pero si este reconfigurar la práctica pedagógica con nuevos saberes y enfoques. Acompañar este proceso requiere políticas educativas que promuevan la formación docente y espacios de colaboración profesional.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-[#1A3D33] mb-4">Módulos del Curso</h2>
            {modules.map((module) => (
              <div key={module.id} 
                   className={`border rounded-lg ${!moduleProgress[module.id as keyof ModuleProgress] ? 'opacity-50' : ''}`}
              >
                <button
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50"
                  onClick={() => {
                    if (moduleProgress[module.id]) {
                      setOpenModule(openModule === module.id ? null : module.id);
                    }
                  }}
                  disabled={!moduleProgress[module.id]}
                >
                  <div className="flex items-center">
                    {moduleProgress[module.id] ? (
                      <svg className="w-5 h-5 text-[#8BAE52] mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    )}
                    <span className="font-medium text-[#1A3D33]">{module.title}</span>
                  </div>
                  {moduleProgress[module.id] && (
                    <svg
                      className={`w-5 h-5 transform transition-transform ${openModule === module.id ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>
                {openModule === module.id && moduleProgress[module.id] && (
                  <div className="p-4 bg-gray-50 border-t">
                    <p className="text-gray-600">{module.content}</p>
                    {module.id === 2 && (
                      <button
                        onClick={handleQuizContinue}
                        className={`mt-4 px-4 py-2 rounded transition-colors ${
                          quizCompleted 
                            ? 'bg-[#8BAE52] hover:bg-[#1A3D33]' 
                            : 'bg-[#1A3D33] hover:bg-[#8BAE52]'
                        } text-white`}
                      >
                        {quizCompleted 
                          ? `Evaluación completada - Puntaje: ${quizScore}%` 
                          : 'Completar evaluación'
                        }
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div id="contact-admin" className="mt-8">
            <h3 className="text-lg font-semibold text-[#1A3D33] mb-4">
              Enviar mensaje al Administrador del curso
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asunto
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#8BAE52] focus:border-[#8BAE52]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#8BAE52] focus:border-[#8BAE52]"
                />
              </div>
              <button className="w-full bg-[#1A3D33] text-white py-2 rounded-md hover:bg-[#8BAE52] transition-colors">
                Enviar mensaje
              </button>
            </div>
          </div>
        </div>
      </section>

      <QuizModal
        isOpen={showQuiz}
        onClose={() => setShowQuiz(false)}
        onQuizComplete={handleQuizComplete}
        initialScore={quizScore}
      />
    </div>
  );
};

export default CourseDetail;
