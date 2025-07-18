import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import EditCourse from "./EditCourse";

interface Curso {
  titulo: string;
  herramientas: any[];
  loAprenderan: any[];
  modulos: any[];
  duracionHoras: number;
  bienvenida: string;
  dirigidoA: string;
  fechaInicio?: string | null;
  fechaTermino?: string | null;
  // agrega otros campos si tienes
}

const baseURL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://greenpark-backend-0ua6.onrender.com';

const EditCourseWrapper = () => {
  const { id } = useParams<{ id: string }>();
  const [curso, setCurso] = useState<Curso | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Obtener token antes para evitar recargas innecesarias
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!id) return;

    if (!token) {
      setError("No estás autenticado. Por favor, inicia sesión.");
      setLoading(false);
      // Si quieres redirigir al login automáticamente:
      // navigate('/login');
      return;
    }

    setLoading(true);
    axios
      .get(`${baseURL}/api/cursos/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setCurso(res.data);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError("No se pudo cargar el curso. Verifica tu sesión o el ID.");
        setCurso(null);
      })
      .finally(() => setLoading(false));
  }, [id, token, navigate]);

  if (loading) return <p>Cargando curso...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!curso) return <p>Curso no encontrado</p>;

  return <EditCourse cursoId={id!} cursoInicial={curso} />;
};

export default EditCourseWrapper;
