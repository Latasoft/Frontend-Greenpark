import React, { useState, useEffect } from "react";

interface Enlace {
  nombre: string;
  url: string;
}

interface Pregunta {
  pregunta: string;
  opciones: string[];
  respuestaCorrecta: number;
}

interface Modulo {
  titulo: string;
  enlaces: Enlace[];
  quiz: Pregunta[];
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
  modulos?: Modulo[]; // <- lo haces opcional
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
  const [modulos, setModulos] = useState<Modulo[]>(curso.modulos || []);

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
    setModulos(curso.modulos || []);
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
        modulos,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-auto">
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
          <input className="input" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título" required />
          <textarea className="input" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Descripción" required />
          <input className="input" value={herramientas} onChange={(e) => setHerramientas(e.target.value)} placeholder="Herramientas" />
          <textarea className="input" value={loQueAprenderas} onChange={(e) => setLoQueAprenderas(e.target.value)} placeholder="Lo que aprenderás" />
          <input className="input" value={duracion} onChange={(e) => setDuracion(e.target.value)} placeholder="Duración" />
          <textarea className="input" value={bienvenida} onChange={(e) => setBienvenida(e.target.value)} placeholder="Mensaje de bienvenida" />
          <input className="input" value={dirigidoA} onChange={(e) => setDirigidoA(e.target.value)} placeholder="Dirigido a" />

          {/* Campos básicos de módulos */}
          {modulos.map((modulo, i) => (
            <div key={i} className="border p-3 rounded bg-gray-50">
              <label className="block font-semibold mb-1">Título del módulo {i + 1}</label>
              <input
                type="text"
                value={modulo.titulo}
                onChange={(e) => {
                  const nuevos = [...modulos];
                  nuevos[i].titulo = e.target.value;
                  setModulos(nuevos);
                }}
                className="w-full border px-3 py-2 rounded mb-2"
              />
              {/* No incluimos edición de enlaces ni quiz aquí por simplicidad visual */}
            </div>
          ))}

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
