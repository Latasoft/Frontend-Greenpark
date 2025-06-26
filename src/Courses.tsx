import courseBanner from './assets/curso-banner.png'
import iaCard from './assets/ia-card.png'
import { useNavigate } from 'react-router-dom'

const Courses = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-white">
      <section className="relative h-[300px] bg-cover bg-center flex items-center"
        style={{ backgroundImage: `url(${courseBanner})` }}>
        <div className="absolute inset-0" style={{ backgroundColor: '#1A3D33', opacity: '0.85' }}></div>
        <div className="relative w-full">
          <div className="text-center">
            <h1 className="text-[32px] text-white font-bold mb-4">
              Transforma tu Carrera Educativa
            </h1>
            <p className="text-base text-white max-w-3xl mx-auto">
              Cursos especializados con enfoque práctico y profesional
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="relative">
                <span className="absolute top-4 left-4 bg-[#8BAE52] text-white px-3 py-1 rounded-md text-sm">
                  Docente
                </span>
                <img 
                  src={iaCard} 
                  alt="IA en Educación" 
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-[#1A3D33] mb-4">
                  Inteligencia Artificial aplicada a la educación
                </h3>
                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <span className="flex items-center">
                    Duración: 8 semanas
                  </span>
                </div>
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-[#1A3D33] mb-2">Herramientas:</h4>
                  <p className="text-sm text-gray-600">
                    ChatGPT Educativo, Automatizadores IA, Generación de Contenido
                  </p>
                </div>
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-[#1A3D33] mb-2">Aprenderás:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-[#8BAE52]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      Crear planes de clase con asistencia de IA
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-[#8BAE52]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      Automatizar evaluaciones con NLP
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-[#8BAE52]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      Diseñar actividades interactivas
                    </li>
                  </ul>
                </div>
                <button 
                  onClick={() => navigate('/cursos/ia-educacion')} 
                  className="w-full bg-[#1A3D33] text-white py-2 rounded-md hover:bg-[#8BAE52] transition-colors"
                >
                  Comenzar Curso
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Courses;
