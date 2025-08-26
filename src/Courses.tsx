import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {useAuth} from "./hooks/useAuth";
import axios from "axios";
import "./styles/animations.css";
import Swal from "sweetalert2";

const baseURL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://greenpark-backend-0ua6.onrender.com";

// Modificar la interfaz Curso
interface Curso {
  id: string;
  titulo: string;
  imagen?: string;
  imagenUrl?: string; // en caso que venga con ese nombre
  duracionHoras?: number;
  herramientas?: string[];
  loAprenderan?: string[];
  dirigidoA?: string;
  estado?: string;
  rol?: string;
  fechaInicio?: string; // Fecha de inicio del curso
  inscrito?: boolean;
}

const Courses = () => {
  const { tipo } = useParams<{ tipo: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  useAuth();
  
  // Estados separados para banner y cursos
  const [bannerLoaded, setBannerLoaded] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const destacados = searchParams.get("destacados");

  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [cursosInscritos, setCursosInscritos] = useState<Record<string, boolean>>({});

  // Animación del banner inmediata al montar el componente
  useEffect(() => {
    // Activar banner inmediatamente
    const bannerTimer = setTimeout(() => {
      setBannerLoaded(true);
      
      // Mostrar tarjetas (ya sean skeleton o reales) después del banner
      const cardsTimer = setTimeout(() => {
        setCardsVisible(true);
      }, 800); // Esperar a que termine la animación del banner
      
      return () => clearTimeout(cardsTimer);
    }, 100);
    
    return () => clearTimeout(bannerTimer);
  }, []);

  // Carga de datos independiente
  useEffect(() => {
    const fetchCursos = async () => {
      setLoading(true);
      setError(null);

      try {
        let url = `${baseURL}/api/cursos/`;
        
        if (tipo) {
          // Si viene de la ruta /cursos/dirigido/:tipo
          url += `dirigido/${tipo}?page=${currentPage}&limit=9&sortOrder=${sortOrder}`;
        } else {
          // Ruta normal de cursos
          url += `lista?page=${currentPage}&limit=9&sortOrder=${sortOrder}`;
        }

        if (searchTerm) {
          url += `&search=${encodeURIComponent(searchTerm)}`;
        }

        const response = await axios.get(url);
        const { cursos: cursosData, pagination } = response.data;
        
        setCursos(cursosData);
        setTotalPages(pagination.totalPages);
        setHasNextPage(pagination.hasNextPage);
        setHasPrevPage(pagination.hasPrevPage);

        // Actualizar cursosInscritos usando los datos de la respuesta
        const inscripciones: Record<string, boolean> = {};
        cursosData.forEach((curso: Curso) => {
          inscripciones[curso.id] = curso.inscrito || false;
        });
        setCursosInscritos(inscripciones);

      } catch (err) {
        setError('Error al cargar los cursos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchCursos, 300);
    return () => clearTimeout(timeoutId);
  }, [tipo, currentPage, sortOrder, searchTerm]);
  
  const startCourse = async (cursoId: string) => {
    const token = localStorage.getItem('token') || '';
    const res = await fetch(`${baseURL}/api/cursos/${cursoId}/inscribir`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('No se pudo inscribir');
    return await res.json();
  };

  // ejemplo: usar swal confirm y luego inscribir y navegar
  const handleConfirmStartCourse = async (curso: Curso) => {
    // Obtener el rol del usuario del localStorage
    const userRole = localStorage.getItem('userRole');
    
    // Validar acceso según rol
    if (curso.dirigidoA && curso.dirigidoA !== userRole) {
      await Swal.fire({
        icon: 'error',
        title: 'Acceso Restringido',
        text: `Este curso solo está disponible para usuarios tipo ${curso.dirigidoA}`,
        confirmButtonColor: '#8BAE52'
      });
      return;
    }

    // Si ya está inscrito, navegar directamente
    if (cursosInscritos[curso.id]) {
      navigate(`/cursos/${curso.id}`);
      return;
    }

    // Si no está inscrito, mostrar confirmación
    const r = await Swal.fire({
      title: `¿Estás seguro de comenzar el curso "${curso.titulo}"?`,
      showCancelButton: true,
      confirmButtonText: 'Sí, comenzar',
      confirmButtonColor: '#8BAE52',
      cancelButtonText: 'Cancelar'
    });
    
    if (!r.isConfirmed) return;
    
    try {
      await startCourse(curso.id);
      navigate(`/cursos/${curso.id}`);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo inscribir al curso. Intente nuevamente.',
        confirmButtonColor: '#8BAE52'
      });
    }
  };

  // Agregar función para verificar inscripción
  const verificarInscripcion = async (cursoId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      const response = await axios.get(
        `${baseURL}/api/cursos/${cursoId}/verificar-inscripcion`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      return response.data.inscrito;
    } catch (error) {
      console.error('Error al verificar inscripción:', error);
      return false;
    }
  };

  // Modifica la función de ordenamiento antes del render
  const ordenarCursos = (cursosArray: Curso[]) => {
    return [...cursosArray].sort((a, b) => {
      // Primero ordenar por inscripción
      if (cursosInscritos[a.id] && !cursosInscritos[b.id]) return -1;
      if (!cursosInscritos[a.id] && cursosInscritos[b.id]) return 1;
      
      // Si ambos tienen el mismo estado de inscripción, ordenar por fecha
      const fechaA = new Date(a.fechaInicio || 0).getTime();
      const fechaB = new Date(b.fechaInicio || 0).getTime();
      return sortOrder === 'desc' ? fechaB - fechaA : fechaA - fechaB;
    });
  };

  // Componente principal que incluye el banner y el contenido
  return (
    <div className="min-h-screen bg-white">
      {/* Banner Section - Siempre visible, con animación al cargar */}
      <section
        className={`relative h-[300px] bg-cover bg-center flex items-center transition-all duration-1000 ease-out ${
          bannerLoaded ? 'banner-animation' : 'opacity-0'
        }`}
        style={{
          backgroundImage: `url('/assets/curso-banner.png')`,
        }}
      >
        <div
          className="absolute inset-0 transition-opacity duration-1000 ease-out"
          style={{ 
            backgroundColor: "#1A3D33", 
            opacity: bannerLoaded ? "0.85" : "0" 
          }}
        ></div>
        <div className="relative w-full text-center px-4">
          <h1 
            className={`text-[32px] text-white font-bold mb-4 capitalize transition-all duration-700 ease-out ${
              bannerLoaded ? 'slide-up-animation delay-300' : 'opacity-0 translate-y-8'
            }`}
          >
            {destacados === "true"
              ? "Cursos Destacados"
              : tipo
              ? `Cursos para ${tipo}`
              : "Transforma tu Carrera Educativa"}
          </h1>
          <p 
            className={`text-base text-white max-w-3xl mx-auto transition-all duration-700 ease-out ${
              bannerLoaded ? 'slide-up-animation delay-500' : 'opacity-0 translate-y-8'
            }`}
          >
            {destacados === "true"
              ? "Los 10 cursos con más participantes"
              : tipo
              ? `Cursos especializados para ${tipo}`
              : "Cursos especializados con enfoque práctico y profesional"}
          </p>
        </div>
      </section>

      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12`}>
        {/* Controles de búsqueda y filtrado */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          {/* Barra de búsqueda */}
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Buscar cursos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:border-[#8BAE52] focus:ring-1 focus:ring-[#8BAE52]"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Selector de ordenamiento */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-[#8BAE52] focus:ring-1 focus:ring-[#8BAE52]"
          >
            <option value="desc">Más nuevo primero</option>
            <option value="asc">Más antiguo primero</option>
          </select>
        </div>

        {/* Contenedor de cursos - MODIFICADO para coincidir con Library */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12`}>
          {loading ? (
            // Skeleton loaders actualizados para coincidir con Library
            Array.from({ length: 6 }).map((_, index) => (
              <div 
                key={index} 
                className="bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col h-full animate-pulse"
                style={{ animationDelay: `${200 + index * 100}ms` }}
              >
                {/* Contenido del skeleton sin cambios */}
                <div className="relative">
                  <div className="w-full h-48 bg-gray-200"></div>
                  <div className="absolute top-4 left-4 bg-gray-200 w-20 h-6 rounded-md"></div>
                </div>
                
                <div className="p-6 flex flex-col flex-1">
                  {/* Contenido interno del skeleton sin cambios */}
                  <div className="flex-1">
                    {/* Skeleton title */}
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    
                    {/* Skeleton duration */}
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    
                    {/* Skeleton herramientas */}
                    <div className="mb-4">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                    </div>
                    
                    {/* Skeleton aprenderás */}
                    <div className="mb-4">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                      <div className="space-y-1">
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Skeleton button */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="h-10 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Tarjetas reales actualizadas para coincidir con Library
            ordenarCursos(cursos).map((curso, index) => (
              <div
                key={curso.id}
                className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border ${
                  cursosInscritos[curso.id] 
                    ? 'border-[#8BAE52] border-2' 
                    : 'border-gray-100'
                } flex flex-col h-full fade-in`}
                style={{ animationDelay: `${200 + index * 100}ms` }}
                onClick={() => handleConfirmStartCourse(curso)}
              >
                <div className="relative">
                  {cursosInscritos[curso.id] && (
                    <div className="absolute top-4 right-4 bg-[#8BAE52] text-white px-3 py-1 rounded-md text-sm z-10">
                      Inscrito
                    </div>
                  )}
                  <span className="absolute top-4 left-4 bg-[#8BAE52] text-white px-3 py-1 rounded-md text-sm capitalize z-10">
                    {curso.dirigidoA || "General"}
                  </span>
                  <img
                    src={curso.imagen || curso.imagenUrl || '/assets/curso-placeholder.jpg'}
                    alt={curso.titulo}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/assets/curso-placeholder.jpg';
                    }}
                  />
                </div>
                
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#1A3D33] mb-4">
                      {curso.titulo}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                      <span>
                        Duración: {curso.duracionHoras || "N/A"} horas
                      </span>
                    </div>
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-[#1A3D33] mb-2">
                        Herramientas:
                      </h4>
                      <p className="text-sm text-gray-600">
                        {curso.herramientas?.length
                          ? curso.herramientas.join(", ")
                          : "No especificado"}
                      </p>
                    </div>
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-[#1A3D33] mb-2">
                        Aprenderás:
                      </h4>
                      <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                        {curso.loAprenderan?.length ? (
                          curso.loAprenderan.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))
                        ) : (
                          <li>No especificado</li>
                        )}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <button className="w-full bg-[#1A3D33] text-white py-2 rounded-md hover:bg-[#8BAE52] transition-colors">
                      {cursosInscritos[curso.id] ? 'Ir al curso' : 'Comenzar curso'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Paginación */}
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={!hasPrevPage}
            className="px-4 py-2 rounded-md bg-[#1A3D33] text-white disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="px-4 py-2">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={!hasNextPage}
            className="px-4 py-2 rounded-md bg-[#1A3D33] text-white disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default Courses;