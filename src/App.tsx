import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

import Header from './components/Header';
import Footer from './components/Footer';
import fondoInicio from './assets/fondo-inicio.jpg';
import eLearning from './assets/e-learning.webp';
import girlProfile from './assets/girl-profile.jpg';
import manProfile from './assets/man-profile.jpg';
import girlProfile2 from './assets/girl-profile-2.jpg';

import Courses from './Courses';
import Contact from './Contact';
import Login from './Login';
import Register from './Register';
import CourseDetail from './CourseDetail';
import AdminPanel from './Admin-Panel/AdminPanel';
import UserPanel from './User-Panel/UserPanel';
import ProtectedRoute from './components/ProtectedRoute';
import TitleHandler from './components/TitleHandler';
import Library from './Library';
import EditCourse from './Admin-Panel/components/EditCourse';

interface Testimonial {
  name: string;
  course: string;
  image: string;
  text: string;
}

const testimonials: Testimonial[] = [
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

interface RoleCardProps {
  title: string;
  onClick: () => void;
}

const RoleCard: React.FC<RoleCardProps> = ({ title, onClick }) => (
  <div className="relative cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105" onClick={onClick}>
    <div className="absolute top-3 left-3 w-full h-full border-2 border-[#8BAE52] rounded-2xl"></div>
    <div className="relative bg-white border-2 border-[#1A3D33] rounded-2xl p-8">
      <h3 className="text-xl font-semibold text-[#1A3D33] text-center">{title}</h3>
    </div>
  </div>
);

const RoleSection = () => {
  const navigate = useNavigate();

  const handleRoleClick = () => {
    navigate('/login');
  };

  return (
    <section className="py-16 bg-[#F0F0F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-[#1A3D33] mb-4 text-center">
          Selecciona tu tipo de perfil
        </h2>
        <p className="text-[#1A3D33] text-center mb-12 max-w-2xl mx-auto">
          Selecciona tu perfil para acceder a los cursos especiales diseñados para tu categoría y comenzar tu experiencia de aprendizaje personalizada
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <RoleCard title="Docente" onClick={handleRoleClick} />
          <RoleCard title="Estudiante" onClick={handleRoleClick} />
          <RoleCard title="Apoderado" onClick={handleRoleClick} />
        </div>
      </div>
    </section>
  );
};

// Wrapper para cargar curso y pasarlo a EditCourse
const EditCourseWrapper = () => {
  const { id } = useParams<{ id: string }>();
  const [cursoInicial, setCursoInicial] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      axios.get(`https://tu-api.com/cursos/${id}`)
        .then(res => {
          setCursoInicial(res.data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [id]);

  if (loading) return <div>Cargando...</div>;
  if (!cursoInicial) return <div>Curso no encontrado</div>;

  return <EditCourse cursoId={id!} cursoInicial={cursoInicial} />;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <TitleHandler />
        <Header />
        <Routes>
          <Route path="/" element={
            <main>
              {/* Aquí va todo el contenido del Home */}
              <section className="relative h-[400px] bg-cover bg-center flex items-center"
                style={{ backgroundImage: `url(${fondoInicio})` }}>
                <div className="absolute inset-0" style={{ backgroundColor: '#1A3D33', opacity: '0.85' }}></div>
                <div className="relative w-full text-center text-white">
                  <h1 className="text-[32px] font-bold mb-4">Conviértete en un Líder de la Innovación</h1>
                  <p className="text-base mb-8 max-w-3xl mx-auto">
                    Cursos prácticos en desarrollo tecnológico, sostenibilidad y transformación urbana, para Docentes, Apoderados y Estudiantes
                  </p>
                  <button className="bg-white text-[#1A3D33] px-6 py-2 rounded-md text-base font-medium hover:bg-[#8BAE52] hover:text-white transition-colors">
                    Explorar cursos
                  </button>
                </div>
              </section>

              <RoleSection />

              <section className="py-16 bg-[#F0F0F0]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <h2 className="text-3xl font-bold text-[#1A3D33] mb-12">Lo que dicen nuestros estudiantes</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, i) => (
                      <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-[#F0F0F0] hover:shadow-md transition-shadow">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 rounded-full overflow-hidden">
                            <img src={testimonial.image} alt={testimonial.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="ml-4">
                            <h3 className="font-semibold text-[#1A3D33]">{testimonial.name}</h3>
                            <p className="text-sm text-[#8BAE52]">{testimonial.course}</p>
                          </div>
                        </div>
                        <p className="text-[#1A3D33] italic">"{testimonial.text}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="relative h-[400px] bg-cover bg-center flex items-center"
                style={{ backgroundImage: `url(${eLearning})` }}>
                <div className="absolute inset-0" style={{ backgroundColor: '#1A3D33', opacity: '0.85' }}></div>
                <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="max-w-lg">
                    <h2 className="text-[32px] text-white font-bold mb-4 text-left">Cursos destacados</h2>
                    <p className="text-base text-white mb-8 text-left">Descubre por qué estos cursos son los favoritos de nuestros alumnos.</p>
                    <button className="bg-white text-[#1A3D33] px-6 py-2 rounded-md text-base font-medium hover:bg-[#8BAE52] hover:text-white transition-colors">
                      Ver destacados
                    </button>
                  </div>
                </div>
              </section>
            </main>
          } />
          
          <Route path="/cursos" element={<Courses />} />
          <Route path="/admin/courses/edit/:id" element={<EditCourseWrapper />} />
          <Route path="/biblioteca" element={<Library />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/cursos/ia-educacion" element={<CourseDetail />} />
          
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRole="admin">
              <AdminPanel />
            </ProtectedRoute>
          } />
          
          <Route path="/user/*" element={
            <ProtectedRoute>
              <UserPanel />
            </ProtectedRoute>
          } />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
