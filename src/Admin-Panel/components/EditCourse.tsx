import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface Curso {
  id: string;
  titulo: string;
  descripcion?: string;
  estado: string;
  dirigidoA: string;
  cantidadAccesosQuiz: number;
  // otros campos necesarios, incluido 'modulos' si aplica
}

const EditCourse: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [curso, setCurso] = useState<Curso | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // estados para inputs, ejemplo:
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) {
      setError("No se recibió ID del curso");
      setLoading(false);
      return;
    }

    const fetchCurso = async () => {
      try {
        const res = await fetch(`https://greenpark-backend-0ua6.onrender.com/api/cursos/${id}`);
        if (!res.ok) throw new Error("Error al cargar curso");
        const data: Curso = await res.json();

        setCurso(data);
        setTitulo(data.titulo);
        setDescripcion(data.descripcion || "");
        setError(null);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCurso();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const body = {
        titulo,
        descripcion,
        // otros campos que quieras actualizar
      };

      const res = await fetch(`https://greenpark-backend-0ua6.onrender.com/api/cursos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.mensaje || "Error al actualizar curso");
      }

      alert("Curso actualizado con éxito");
      navigate("/admin/courses"); // volver a lista al guardar
    } catch (e: any) {
      setError(e.message);
      setSaving(false);
    }
  };

  if (loading) return <p>Cargando curso...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  if (!curso) return <p>No se encontró el curso</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h2 className="text-2xl font-bold mb-4">Editar Curso</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1" htmlFor="titulo">Título</label>
          <input
            id="titulo"
            type="text"
            className="w-full border px-3 py-2 rounded"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1" htmlFor="descripcion">Descripción</label>
          <textarea
            id="descripcion"
            className="w-full border px-3 py-2 rounded"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={4}
          />
        </div>
        {/* Agrega más campos según tu modelo */}

        {error && <p className="text-red-600">{error}</p>}

        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => navigate("/admin/courses")}
            className="px-4 py-2 border rounded hover:bg-gray-100"
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            disabled={saving}
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCourse;
