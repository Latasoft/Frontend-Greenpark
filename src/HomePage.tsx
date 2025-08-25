// src/HomePage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import fondoInicio from './assets/fondo-inicio.jpg';
import eLearning from './assets/e-learning.webp';
import girlProfile from './assets/girl-profile.jpg';
import manProfile from './assets/man-profile.jpg';
import girlProfile2 from './assets/girl-profile-2.jpg';

interface RoleCardProps {
  title: string;
  onClick: () => void;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const testimonials = [
    {
      name: "Ana Martínez",
      course: "Curso Diseño Sostenible",
      image: girlProfile,
      text: "Experimenté un crecimiento significativo a nivel personal y profesional gracias a este curso gratuito."
    },
    {
      name: "Martín Morales",
      course: "Curso Inteligencia Artificial Aplicada a la educación",
      image: manProfile,
      text: "Excelente curso para docentes que buscan integrar la IA de manera práctica y efectiva. Aprendí estrategias concretas para optimizar mi trabajo y potenciar el aprendizaje de mis estudiantes."
    },
    {
      name: "Isidora Gutiérrez",
      course: "Curso Ecología Urbana",
      image: girlProfile2,
      text: "Excelente curso para quienes desean comprender y abordar los desafíos ambientales en el contexto urbano. Me brindó herramientas y conocimientos clave para promover ciudades más sostenibles."
    }
  ];

  const RoleCard: React.FC<RoleCardProps> = ({ title, onClick }) => (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
      className="relative cursor-pointer hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#8BAE52]"
      aria-label={`Seleccionar perfil ${title}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute top-3 left-3 w-full h-full border-2 border-[#8BAE52] rounded-2xl"></div>
      <div className="relative bg-white border-2 border-[#1A3D33] rounded-2xl p-8">
        <h3 className="text-xl font-semibold text-[#1A3D33] text-center">{title}</h3>
      </div>
    </motion.div>
  );

  const handleRoleClick = () => {
    navigate('/login');
  };

  return (
    <main>
      <section
        className="relative h-[400px] bg-cover bg-center flex items-center"
        style={{ backgroundImage: `url(${fondoInicio})` }}
      >
        <div className="absolute inset-0" style={{ backgroundColor: '#1A3D33', opacity: 0.85 }}></div>
        <div className="relative w-full">
          <div className="text-center px-4">
            <motion.h1 
              className="text-[32px] text-white font-bold mb-4"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Conviértete en un Líder de la Innovación
            </motion.h1>
            <motion.p 
              className="text-base text-white mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Cursos prácticos en desarrollo tecnológico, sostenibilidad y <br />
              transformación urbana, para Docentes, Apoderados y Estudiantes
            </motion.p>
            <motion.button
              type="button"
              onClick={() => navigate('/cursos')}
              className="bg-white text-[#1A3D33] px-6 py-2 rounded-md text-base font-medium hover:bg-[#8BAE52] hover:text-white transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Explorar cursos
            </motion.button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#F0F0F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            className="text-3xl font-bold text-[#1A3D33] mb-4 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Selecciona tu tipo de perfil
          </motion.h2>
          <motion.p 
            className="text-[#1A3D33] text-center mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Selecciona tu perfil para acceder a los cursos especiales diseñados para tu categoría y comenzar tu experiencia de aprendizaje personalizada
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* RoleCard components already have animations */}
            <RoleCard title="Docente" onClick={handleRoleClick} />
            <RoleCard title="Estudiante" onClick={handleRoleClick} />
            <RoleCard title="Comunidad" onClick={handleRoleClick} />
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#F0F0F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            className="text-3xl font-bold text-[#1A3D33] mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Lo que dicen nuestros estudiantes
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm border border-[#F0F0F0] hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                whileHover={{ y: -5 }}
              >
                {/* Testimonial content */}
                <div className="flex items-center mb-4">
                  <motion.div 
                    className="w-12 h-12 rounded-full overflow-hidden"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 + (0.1 * index), duration: 0.4, type: "spring" }}
                  >
                    <img src={testimonial.image} alt={testimonial.name} className="w-full h-full object-cover" />
                  </motion.div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-[#1A3D33]">{testimonial.name}</h3>
                    <p className="text-sm text-[#8BAE52]">{testimonial.course}</p>
                  </div>
                </div>
                <p className="text-[#1A3D33] italic">"{testimonial.text}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="relative h-[400px] bg-cover bg-center flex items-center"
        style={{ backgroundImage: `url(${eLearning})` }}
      >
        <div className="absolute inset-0" style={{ backgroundColor: '#1A3D33', opacity: 0.85 }}></div>
        <div className="relative w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="max-w-lg"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-[32px] text-white font-bold mb-4 text-left">Cursos destacados</h2>
              <p className="text-base text-white mb-8 text-left">
                Descubre por qué estos cursos son los favoritos de nuestros alumnos.
              </p>
              <div className="text-left">
                <motion.button
                  type="button"
                  onClick={() => navigate('/cursos?destacados=true')}
                  className="bg-white text-[#1A3D33] px-6 py-2 rounded-md text-base font-medium hover:bg-[#8BAE52] hover:text-white transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Ver destacados
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
