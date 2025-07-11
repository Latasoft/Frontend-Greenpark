import  { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import EditCourse from './EditCourse';

interface Curso {
  // define aquí las propiedades que usa tu curso
  titulo: string;
  herramientas: any[];
  loAprenderan: any[];
  modulos: any[];
  duracionHoras: number;
  bienvenida: string;
  dirigidoA: string;
  fechaInicio?: string | null;
  fechaTermino?: string | null;
  // etc
}

const EditCourseWrapper = () => {
  const { id } = useParams<{ id: string }>();
  const [curso, setCurso] = useState<Curso | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    axios.get(`https://greenpark-backend-0ua6.onrender.com/api/cursos/${id}`)
      .then(res => {
        setCurso(res.data);
      })
      .catch(() => {
        setCurso(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

    if (loading) return <p>Cargando curso...</p>;
    if (!curso) return <p>Curso no encontrado</p>;

    // Aquí TS sabe que curso NO es null
    return <EditCourse cursoId={id!} cursoInicial={curso} />

};

export default EditCourseWrapper;
