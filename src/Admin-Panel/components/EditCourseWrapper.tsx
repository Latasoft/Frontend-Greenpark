
import { useParams } from "react-router-dom";
import EditCourse from "./EditCourse"; // Asegúrate de que la ruta sea correcta

const EditCourseWrapper = () => {
  // Obtenemos el ID del curso de los parámetros de la URL
  const { id } = useParams<{ id: string }>();

  // Si no hay ID, podríamos mostrar un mensaje o redirigir.
  // EditCourse ya maneja la lógica de carga y errores internamente,
  // por lo que este wrapper solo necesita asegurarse de que el ID exista.
  if (!id) {
    return <p className="text-red-600 text-center mt-8">Error: ID de curso no proporcionado.</p>;
  }

  // Simplemente renderizamos EditCourse y le pasamos el ID.
  // EditCourse se encargará de cargar los datos y mostrar el formulario.
  return <EditCourse cursoId={id} />;
};

export default EditCourseWrapper;