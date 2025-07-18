import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

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
import EditCourseWrapper from './Admin-Panel/components/EditCourseWrapper';
import HomePage from './HomePage';
import ParticipantesCurso from './Admin-Panel/components/ParticipantesCurso';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <TitleHandler />
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cursos" element={<Courses />} />
          <Route path="/admin/courses/participantes/:id" element={<ParticipantesCurso />} />

          {/* Ruta dinámica para detalle de curso */}
          <Route path="/cursos/:cursoId" element={<CourseDetail />} />
          <Route path="/biblioteca" element={<Library />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/admin/courses/participantes/:id" element={<ParticipantesCurso />} />
          <Route path="/admin/courses/edit/:id" element={<EditCourseWrapper />} />

          {/* Panel admin solo para rol admin */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminPanel />
              </ProtectedRoute>
            }
          />

          {/* Panel user para estudiante, docente, apoderado */}
          <Route
            path="/user/*"
            element={
              <ProtectedRoute allowedRoles={['estudiante', 'docente', 'comunidad']}>
                <UserPanel />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
