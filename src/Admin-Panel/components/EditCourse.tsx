import React, { useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";
import axios from "axios";

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
  nombre: string;
  descripcion: string;
  enlaces: Enlace[];
  quiz?: {
    preguntas: Pregunta[];
  };
}

interface CursoEditar {
  titulo: string;
  herramientas: string[];
  loAprenderan: string[];
  duracionHoras: number;
  bienvenida: string;
  modulos: Modulo[];
  fechaInicio: string;
  fechaTermino: string;
  dirigidoA: string;
  imagenUrl?: string;
}

interface EditCourseProps {
  cursoId: string;
}

const EditCourse: React.FC<EditCourseProps> = ({ cursoId }) => {
  const [curso, setCurso] = useState<CursoEditar | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [imagenArchivo, setImagenArchivo] = useState<File | null>(null);

  // Estado local para formulario, para manejar cambios antes de enviar
  const [titulo, setTitulo] = useState("");
  const [herramientas, setHerramientas] = useState<string[]>([]);
  const [loAprenderan, setLoAprenderan] = useState<string[]>([]);
  const [duracionHoras, setDuracionHoras] = useState(0);
  const [bienvenida, setBienvenida] = useState("");
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaTermino, setFechaTermino] = useState("");
  const [dirigidoA, setDirigidoA] = useState("");
  const [herramientaInput, setHerramientaInput] = useState("");
  const [loAprenderanInput, setLoAprenderanInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quiz modal y preguntas, puedes implementar igual que en CrearCurso

  // Cargar curso al montar componente
  useEffect(() => {
    async function fetchCurso() {
      try {
        setLoading(true);
        const baseURL =
          window.location.hostname === "localhost"
            ? "http://localhost:3000"
            : "https://greenpark-0ua6-backend.onrender.com";

        const res = await axios.get<CursoEditar>(`${baseURL}/api/cursos/${cursoId}`);
        const data = res.data;

        setCurso(data);
        setTitulo(data.titulo);
        setHerramientas(data.herramientas || []);
        setLoAprenderan(data.loAprenderan || []);
        setDuracionHoras(data.duracionHoras);
        setBienvenida(data.bienvenida);
        setModulos(data.modulos || []);
        setFechaInicio(data.fechaInicio);
        setFechaTermino(data.fechaTermino);
        setDirigidoA(data.dirigidoA);
        setError(null);
      } catch (err) {
        setError("Error al cargar curso");
      } finally {
        setLoading(false);
      }
    }
    fetchCurso();
  }, [cursoId]);

  const handleImagenChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImagenArchivo(e.target.files[0]);
    }
  };
  

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const baseURL =
        window.location.hostname === "localhost"
          ? "http://localhost:3000"
          : "https://greenpark-0ua6-backend.onrender.com";

      const formData = new FormData();
      formData.append("titulo", titulo);
      if (imagenArchivo) {
        formData.append("imagen", imagenArchivo);
      }
      formData.append("herramientas", JSON.stringify(herramientas));
      formData.append("loAprenderan", JSON.stringify(loAprenderan));
      formData.append("duracionHoras", duracionHoras.toString());
      formData.append("bienvenida", bienvenida);
      formData.append("modulos", JSON.stringify(modulos));
      formData.append("fechaInicio", fechaInicio);
      formData.append("fechaTermino", fechaTermino);
      formData.append("dirigidoA", dirigidoA);

      const token = localStorage.getItem("token");

      await axios.put(`${baseURL}/api/cursos/${cursoId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      alert("Curso actualizado correctamente");
    } catch (error) {
      alert("Error al actualizar curso");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <p>Cargando curso...</p>;
  if (error) return <p>{error}</p>;
  if (!curso) return <p>No se encontró el curso</p>;

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-[#1A3D33]">Editar Curso</h1>

      <div className="mb-4">
        <label className="block mb-2 font-semibold">Título</label>
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8BAE52]"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-semibold">Imagen</label>
        {curso.imagenUrl && !imagenArchivo && (
          <img src={curso.imagenUrl} alt="Imagen actual" className="mb-2 max-h-48 object-contain" />
        )}
        <input type="file" accept="image/*" onChange={handleImagenChange} />
      </div>

      {/* Aquí continúa con inputs para herramientas, loAprenderan, duración, bienvenida, modulos, fechas y dirigidoA */}

      {/* Herramientas */}
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Herramientas</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {herramientas.map((herr, i) => (
            <span
              key={i}
              className="bg-[#8BAE52] text-white px-2 py-1 rounded-full flex items-center"
            >
              {herr}
              <button
                type="button"
                className="ml-2 font-bold hover:text-red-300"
                onClick={() =>
                  setHerramientas(herramientas.filter((_, idx) => idx !== i))
                }
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={herramientaInput}
          onChange={(e) => setHerramientaInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && herramientaInput.trim()) {
              e.preventDefault();
              if (!herramientas.includes(herramientaInput.trim())) {
                setHerramientas([...herramientas, herramientaInput.trim()]);
              }
              setHerramientaInput("");
            }
          }}
          placeholder="Agregar herramienta y presiona Enter"
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8BAE52]"
        />
      </div>

      {/* Similar para loAprenderan */}
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Aprenderás</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {loAprenderan.map((item, i) => (
            <span
              key={i}
              className="bg-[#8BAE52] text-white px-2 py-1 rounded-full flex items-center"
            >
              {item}
              <button
                type="button"
                className="ml-2 font-bold hover:text-red-300"
                onClick={() =>
                  setLoAprenderan(loAprenderan.filter((_, idx) => idx !== i))
                }
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={loAprenderanInput}
          onChange={(e) => setLoAprenderanInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && loAprenderanInput.trim()) {
              e.preventDefault();
              if (!loAprenderan.includes(loAprenderanInput.trim())) {
                setLoAprenderan([...loAprenderan, loAprenderanInput.trim()]);
              }
              setLoAprenderanInput("");
            }
          }}
          placeholder="Agregar item y presiona Enter"
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8BAE52]"
        />
      </div>

      {/* Duración */}
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Duración (horas)</label>
        <input
          type="number"
          min={0}
          value={duracionHoras}
          onChange={(e) => setDuracionHoras(Number(e.target.value))}
          className="w-32 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8BAE52]"
        />
      </div>

      {/* Bienvenida */}
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Bienvenida</label>
        <textarea
          value={bienvenida}
          onChange={(e) => setBienvenida(e.target.value)}
          rows={4}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8BAE52]"
        />
      </div>

      {/* Aquí puedes agregar el manejo de módulos igual que en CrearCurso */}

      {/* Fechas */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-2 font-semibold">Fecha de Inicio</label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8BAE52]"
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold">Fecha de Término</label>
          <input
            type="date"
            value={fechaTermino}
            onChange={(e) => setFechaTermino(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8BAE52]"
          />
        </div>
      </div>

      {/* Dirigido a */}
      <div className="mb-6">
        <label className="block mb-2 font-semibold">Dirigido a</label>
        <select
          value={dirigidoA}
          onChange={(e) => setDirigidoA(e.target.value)}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8BAE52]"
        >
          <option value="">Seleccione una opción</option>
          <option value="docente">Docente</option>
          <option value="estudiante">Estudiante</option>
          <option value="apoderado">Apoderado</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`bg-[#8BAE52] text-white font-semibold px-6 py-3 rounded hover:bg-[#769e3f] transition-colors ${
          isSubmitting ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {isSubmitting ? "Guardando..." : "Guardar Cambios"}
      </button>
    </form>
  );
};

export default EditCourse;

