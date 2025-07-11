// src/Admin-Panel/components/EditCourse.tsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
//import CourseCreator from "./CourseCreator";

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [, setCurso] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurso = async () => {
      try {
        const res = await fetch(`https://greenpark-backend-0ua6.onrender.com/api/cursos/${id}`); //se cambia la URL a la correcta
        if (!res.ok) throw new Error("Curso no encontrado");
        const data = await res.json();
        setCurso(data);
        setLoading(false);
      } catch (err) {
        alert("Error al cargar el curso");
        navigate("/admin");
      }
    };

    fetchCurso();
  }, [id, navigate]);

  if (loading) return <p className="text-center py-10">Cargando curso...</p>;

  //*return (
    //<CourseCreator
      //modo="edicion"
      //cursoInicial={curso}
      //onCancel={() => navigate("/admin")}
      //onSuccess={() => navigate("/admin")}
    ///>
  //)*//
};

export default EditCourse;
