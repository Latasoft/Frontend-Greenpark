import React, { useState, useEffect } from "react";

interface Modulo {
  id: string;
  titulo: string;
  // otros campos si necesitas
}

interface Curso {
  id: string;
  titulo: string;
  descripcion?: string;
  herramientas?: string;
  loQueAprenderas?: string;
  duracion?: string;
  bienvenida?: string;
  dirigidoA: string;
  modulos?: Modulo[];
}

interface EditCourseProps {
  curso: Curso;
  onCerrar: () => void;
  onGuardado: () => void;
}

const EditCourse: React.FC<EditCourseProps> = ({ curso, onCerrar, onGuardado }) => {
  const [titulo, setTitulo] = useState(curso.titulo || "");
  const [descripcion, setDescripcion] = useState(curso.descripcion || "");
  const [herramientas, setHerramientas] = useState(curso.herramientas || "");
  const [loQueAprenderas, setLoQueAprenderas] = useState(curso.loQueAprenderas || "");
  const [duracion, setDuracion] = useState(curso.duracion || "");
  const [bienvenida, setBienvenida] = useState(curso.bienvenida || "");
  const [dirigidoA, setDirigidoA] = useState(curso.dirigidoA || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitulo(curso.titulo || "");
    setDescripcion(curso.descripcion || "");
    setHerramientas(curso.herramientas || "");
    setLoQueAprenderas(curso.loQueAprenderas || "");
    setDuracion(curso.duracion || "");
    setBienvenida(curso.bienvenida || "");
    setDirigidoA(curso.dirigidoA || "");
  }, [curso]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const body = {
        titulo,
        descripcion,
        herramientas,
        loQueAprenderas,
        duracion,
        bienvenida,
        dirigidoA,
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
      onGuardado();
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl p-8 relative overflow-y-auto max-h-[90vh]">
        <button
          onClick={onCerrar}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl"
        >
          ×
        </button>

        <h2 className="text-2xl font-semibold text-[#1A3D33] mb-6">Editar Curso</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* FILA 1: TÍTULO Y DURACIÓN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Título</label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full border px-3 py-2 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Duración</label>
              <input
                type="text"
                value={duracion}
                onChange={(e) => setDuracion(e.target.value)}
                className="w-full border px-3 py-2 rounded-md"
              />
            </div>
          </div>

          {/* FILA 2: DESCRIPCIÓN */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full border px-3 py-2 rounded-md"
              rows={3}
              required
            />
          </div>

          {/* FILA 3: HERRAMIENTAS Y LO QUE APRENDERÁS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Herramientas necesarias</label>
              <input
                type="text"
                value={herramientas}
                onChange={(e) => setHerramientas(e.target.value)}
                className="w-full border px-3 py-2 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Lo que aprenderás</label>
              <input
                type="text"
                value={loQueAprenderas}
                onChange={(e) => setLoQueAprenderas(e.target.value)}
                className="w-full border px-3 py-2 rounded-md"
              />
            </div>
          </div>

          {/* FILA 4: BIENVENIDA Y DIRIGIDO A */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Texto de bienvenida</label>
              <input
                type="text"
                value={bienvenida}
                onChange={(e) => setBienvenida(e.target.value)}
                className="w-full border px-3 py-2 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Dirigido a</label>
              <input
                type="text"
                value={dirigidoA}
                onChange={(e) => setDirigidoA(e.target.value)}
                className="w-full border px-3 py-2 rounded-md"
              />
            </div>
          </div>

          {/* ERROR */}
          {error && <p className="text-red-600">{error}</p>}

          {/* BOTONES */}
          <div className="flex justify-end gap-3 pt-4">
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
              className="px-4 py-2 bg-[#8BAE52] text-white rounded hover:bg-[#1A3D33] disabled:opacity-50"
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
