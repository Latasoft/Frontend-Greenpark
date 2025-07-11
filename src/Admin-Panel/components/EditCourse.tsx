import React, { useState, useEffect } from "react";

interface Curso {
  id: string;
  titulo: string;
  descripcion?: string;
  // Otros campos que necesites
}

interface EditCourseProps {
  curso: Curso;
  onCerrar: () => void;
  onGuardado: () => void;
}

const EditCourse: React.FC<EditCourseProps> = ({ curso, onCerrar, onGuardado }) => {
  // Inicializa estado con props.curso
  const [titulo, setTitulo] = useState(curso.titulo || "");
  const [descripcion, setDescripcion] = useState(curso.descripcion || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Si cambia el curso, actualiza los campos
    setTitulo(curso.titulo || "");
    setDescripcion(curso.descripcion || "");
  }, [curso]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const body = {
        titulo,
        descripcion,
        // otros campos...
      };

      const res = await fetch(`https://greenpark-backend-0ua6.onrender.com/api/cursos/${curso.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.mensaje || "Error al actualizar curso");
      }

      setSaving(false);
      alert("Curso actualizado con éxito");
      onGuardado(); // Notificar al padre que se guardó para refrescar lista y cerrar modal
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg max-w-3xl w-full p-6 relative">
        <button
          onClick={onCerrar}
          className="absolute top-4 right-4 text-gray-700 hover:text-gray-900"
          aria-label="Cerrar modal"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-4">Editar Curso</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1" htmlFor="titulo">
              Título
            </label>
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
            <label className="block font-semibold mb-1" htmlFor="descripcion">
              Descripción
            </label>
            <textarea
              id="descripcion"
              className="w-full border px-3 py-2 rounded"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={4}
              required
            />
          </div>

          {/* Agrega aquí más campos si es necesario */}

          {error && <p className="text-red-600">{error}</p>}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCerrar}
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
    </div>
  );
};

export default EditCourse;
