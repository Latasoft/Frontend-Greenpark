import React, { useState, useEffect, } from "react";
import type { ChangeEvent, FormEvent } from "react";
import axios from "axios";

// Definición de interfaces
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
  titulo: string; // Usamos 'titulo' como en tu último snippet
  descripcion: string; // Reincorporamos la descripción del módulo
  enlaces: Enlace[];
  quiz?: { // Reincorporamos el quiz
    preguntas: Pregunta[];
  };
}

interface Curso {
  titulo: string;
  herramientas: string[];
  loAprenderan: string[];
  duracionHoras: number;
  bienvenida: string;
  modulos: Modulo[];
  fechaInicio: string;
  fechaTermino: string;
  dirigidoA: string;
  // La imagen y archivos se manejan aparte, no están en la interfaz del curso directamente
}

interface EditCourseProps {
  cursoId: string;
}

// URL base dinámica según entorno
const baseURL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://greenpark-backend-0ua6.onrender.com";

// Función para parsear fechas, mantenida de tu snippet
function parseFechaInput(fecha?: string | null | any): string {
  if (!fecha) return "";
  if (typeof fecha === "string") return fecha.substring(0, 10);
  if (typeof fecha.toDate === "function") {
    return fecha.toDate().toISOString().substring(0, 10);
  }
  if (fecha instanceof Date) {
    return fecha.toISOString().substring(0, 10);
  }
  try {
    const d = new Date(fecha);
    if (!isNaN(d.getTime())) return d.toISOString().substring(0, 10);
  } catch {}
  return "";
}

const EditCourse: React.FC<EditCourseProps> = ({ cursoId }) => {
  // Estados del formulario
  const [titulo, setTitulo] = useState("");
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [herramientas, setHerramientas] = useState<string[]>([]);
  const [loAprenderan, setLoAprenderan] = useState<string[]>([]);
  const [duracionHoras, setDuracionHoras] = useState(0);
  const [bienvenida, setBienvenida] = useState("");
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [archivosModuloFiles, setArchivosModuloFiles] = useState<File[]>([]);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaTermino, setFechaTermino] = useState("");
  const [dirigidoA, setDirigidoA] = useState("");

  // Estados para inputs temporales de "Herramientas" y "Lo que aprenderán"
  const [herramientaInput, setHerramientaInput] = useState("");
  const [loAprenderanInput, setLoAprenderanInput] = useState("");

  // Estados para el modal del quiz
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [quizIndex, setQuizIndex] = useState<number | null>(null);
  const [preguntasTemp, setPreguntasTemp] = useState<Pregunta[]>([]);
  const [nuevaPregunta, setNuevaPregunta] = useState("");
  const [nuevasOpciones, setNuevasOpciones] = useState<string[]>(["", ""]);
  const [respuestaCorrectaTemp, setRespuestaCorrectaTemp] = useState(0);

  // Estado para el indicador de carga al enviar el formulario
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar datos del curso para editar al montar el componente
  useEffect(() => {
    const fetchCurso = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get<Curso>(`${baseURL}/api/cursos/${cursoId}`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        setTitulo(data.titulo || "");
        setHerramientas(data.herramientas || []);
        setLoAprenderan(data.loAprenderan || []);
        setDuracionHoras(data.duracionHoras || 0);
        setBienvenida(data.bienvenida || "");
        // Asegúrate de que los módulos tengan la estructura completa esperada
        setModulos(data.modulos.length ? data.modulos : [{ titulo: "", descripcion: "", enlaces: [], quiz: { preguntas: [] } }]);
        setFechaInicio(parseFechaInput(data.fechaInicio));
        setFechaTermino(parseFechaInput(data.fechaTermino));
        setDirigidoA(data.dirigidoA || "");
      } catch (error) {
        console.error("Error cargando curso:", error);
        // Usar un sistema de notificación en lugar de alert
        alert("No se pudo cargar el curso para editar");
      }
    };

    fetchCurso();
  }, [cursoId, baseURL]); // Dependencias para recargar si cursoId o baseURL cambian

  // Manejo de archivos e imagen
  const handleImagenChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImagenFile(e.target.files[0]);
    }
  };

  const handleArchivosModuloChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setArchivosModuloFiles(Array.from(e.target.files));
    }
  };

  // Manejo de Herramientas (tags)
  const addHerramientaFromInput = () => {
    if (herramientaInput.trim()) {
      if (!herramientas.includes(herramientaInput.trim())) {
        setHerramientas([...herramientas, herramientaInput.trim()]);
      }
      setHerramientaInput("");
    }
  };

  const removeHerramienta = (index: number) => {
    setHerramientas(herramientas.filter((_, i) => i !== index));
  };

  // Manejo de Lo que Aprenderán (tags)
  const addLoAprenderanFromInput = () => {
    if (loAprenderanInput.trim()) {
      if (!loAprenderan.includes(loAprenderanInput.trim())) {
        setLoAprenderan([...loAprenderan, loAprenderanInput.trim()]);
      }
      setLoAprenderanInput("");
    }
  };

  const removeLoAprenderan = (index: number) => {
    setLoAprenderan(loAprenderan.filter((_, i) => i !== index));
  };

  // Manejo de Módulos
  const agregarModulo = () => {
    setModulos([
      ...modulos,
      { titulo: "", descripcion: "", enlaces: [], quiz: { preguntas: [] } },
    ]);
  };

  const eliminarModulo = (index: number) => {
    setModulos(modulos.filter((_, i) => i !== index));
  };

  const cambiarModulo = (
    index: number,
    field: keyof Modulo,
    value: string | Enlace[] | { preguntas: Pregunta[] }
  ) => {
    const nuevosModulos = [...modulos];
    // Aseguramos que el tipo sea correcto para la asignación
    (nuevosModulos[index] as any)[field] = value;
    setModulos(nuevosModulos);
  };

  // Manejo de Enlaces por Módulo
  const agregarEnlaceModulo = (moduloIndex: number) => {
    const nuevosModulos = [...modulos];
    nuevosModulos[moduloIndex].enlaces.push({ nombre: "", url: "" });
    setModulos(nuevosModulos);
  };

  const eliminarEnlaceModulo = (moduloIndex: number, enlaceIndex: number) => {
    const nuevosModulos = [...modulos];
    nuevosModulos[moduloIndex].enlaces = nuevosModulos[moduloIndex].enlaces.filter(
      (_, i) => i !== enlaceIndex
    );
    setModulos(nuevosModulos);
  };

  const cambiarEnlaceModulo = (
    moduloIndex: number,
    enlaceIndex: number,
    field: keyof Enlace,
    value: string
  ) => {
    const nuevosModulos = [...modulos];
    if (!nuevosModulos[moduloIndex].enlaces[enlaceIndex]) {
      nuevosModulos[moduloIndex].enlaces[enlaceIndex] = { nombre: "", url: "" };
    }
    nuevosModulos[moduloIndex].enlaces[enlaceIndex][field] = value;
    setModulos(nuevosModulos);
  };

  // Manejo de Quiz
  const finalizarQuiz = () => {
    if (quizIndex === null) return;
    const nuevosModulos = [...modulos];
    nuevosModulos[quizIndex].quiz = { preguntas: preguntasTemp };
    setModulos(nuevosModulos);
    setPreguntasTemp([]); // Limpiar preguntas temporales
    setNuevaPregunta(""); // Limpiar input de nueva pregunta
    setNuevasOpciones(["", ""]); // Limpiar opciones
    setRespuestaCorrectaTemp(0); // Resetear respuesta correcta
    setQuizIndex(null);
    setIsQuizModalOpen(false);
  };

  const addPreguntaToQuiz = () => {
    if (!nuevaPregunta.trim() || nuevasOpciones.some((op) => !op.trim())) {
      alert("Completa todos los campos de la pregunta y sus opciones.");
      return;
    }

    const nueva: Pregunta = {
      pregunta: nuevaPregunta.trim(),
      opciones: nuevasOpciones,
      respuestaCorrecta: respuestaCorrectaTemp,
    };

    setPreguntasTemp((prev) => [...prev, nueva]);
    setNuevaPregunta("");
    setNuevasOpciones(["", ""]);
    setRespuestaCorrectaTemp(0);
  };

  const removePreguntaFromQuiz = (index: number) => {
    setPreguntasTemp((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit - actualizar curso
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    if (!titulo.trim()) {
      alert("El título es obligatorio");
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("titulo", titulo);
      if (imagenFile) formData.append("imagen", imagenFile);
      formData.append("herramientas", JSON.stringify(herramientas));
      formData.append("loAprenderan", JSON.stringify(loAprenderan));
      formData.append("duracionHoras", duracionHoras.toString());
      formData.append("bienvenida", bienvenida);
      formData.append("modulos", JSON.stringify(modulos)); // Incluye descripcion y quiz
      formData.append("fechaInicio", fechaInicio);
      formData.append("fechaTermino", fechaTermino);
      formData.append("dirigidoA", dirigidoA);

      archivosModuloFiles.forEach((file) => {
        formData.append("archivosModulo", file);
      });

      const token = localStorage.getItem("token");

      await axios.put(`${baseURL}/api/cursos/${cursoId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      alert("Curso actualizado con éxito");
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.mensaje || error.message || "Error al actualizar el curso");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="h-[calc(100vh-8rem)] overflow-y-auto font-inter">
        <div className="bg-white rounded-lg shadow p-6 max-w-4xl mx-auto my-8">
          <h2 className="text-3xl font-bold text-[#1A3D33] mb-8 text-center">Editar Curso</h2>

          <div className="space-y-8">
            {/* Información del Curso */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-[#1A3D33] mb-5">Información General del Curso</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-2">Título del Curso</label>
                  <input
                    id="titulo"
                    type="text"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-[#8BAE52] focus:ring-1 focus:ring-[#8BAE52] outline-none transition duration-150 ease-in-out"
                    placeholder="Ingrese título del curso"
                  />
                </div>

                <div>
                  <label htmlFor="imagen" className="block text-sm font-medium text-gray-700 mb-2">Imagen del Curso (Opcional)</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-[#8BAE52] focus-within:border-[#8BAE52] focus-within:bg-[#8BAE52]/5 transition duration-150 ease-in-out">
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600 justify-center items-center">
                        <label htmlFor="imagen-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-[#8BAE52] hover:text-[#1A3D33] focus-within:outline-none">
                          <span>Subir archivo</span>
                          <input
                            id="imagen-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImagenChange}
                            className="sr-only"
                          />
                        </label>
                        <span className="pl-1">o arrastrar y soltar</span>
                      </div>
                      {imagenFile && (
                        <p className="mt-2 text-sm text-gray-600">Archivo seleccionado: <span className="font-medium">{imagenFile.name}</span></p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Herramientas</label>
                  <div className="flex flex-wrap items-center gap-2 border border-gray-300 rounded-md p-2 min-h-[42px] focus-within:border-[#8BAE52] focus-within:ring-1 focus-within:ring-[#8BAE52] transition duration-150 ease-in-out">
                    {herramientas.map((herr, idx) => (
                      <span key={idx} className="bg-[#8BAE52] text-white px-3 py-1 rounded-full text-sm flex items-center shadow-sm">
                        {herr}
                        <button
                          type="button"
                          onClick={() => removeHerramienta(idx)}
                          className="ml-2 font-bold text-white hover:text-red-200 transition-colors duration-200"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={herramientaInput}
                      onChange={(e) => setHerramientaInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addHerramientaFromInput();
                        }
                      }}
                      placeholder="Presiona Enter para agregar"
                      className="flex-1 px-2 py-1 outline-none bg-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lo que Aprenderán</label>
                  <div className="flex flex-wrap items-center gap-2 border border-gray-300 rounded-md p-2 min-h-[42px] focus-within:border-[#8BAE52] focus-within:ring-1 focus-within:ring-[#8BAE52] transition duration-150 ease-in-out">
                    {loAprenderan.map((item, idx) => (
                      <span key={idx} className="bg-[#8BAE52] text-white px-3 py-1 rounded-full text-sm flex items-center shadow-sm">
                        {item}
                        <button
                          type="button"
                          onClick={() => removeLoAprenderan(idx)}
                          className="ml-2 font-bold text-white hover:text-red-200 transition-colors duration-200"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={loAprenderanInput}
                      onChange={(e) => setLoAprenderanInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addLoAprenderanFromInput();
                        }
                      }}
                      placeholder="Presiona Enter para agregar tag"
                      className="flex-1 px-2 py-1 outline-none bg-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="duracionHoras" className="block text-sm font-medium text-gray-700 mb-2">Duración (horas)</label>
                  <input
                    id="duracionHoras"
                    type="number"
                    min={0}
                    value={duracionHoras}
                    onChange={(e) => setDuracionHoras(Number(e.target.value))}
                    className="w-32 px-4 py-2 border border-gray-300 rounded-md focus:ring-[#8BAE52] focus:border-[#8BAE52] outline-none transition duration-150 ease-in-out"
                    placeholder="40"
                  />
                </div>
              </div>
            </div>

            {/* Bienvenida */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-[#1A3D33] mb-5">Mensaje de Bienvenida</h3>
              <textarea
                value={bienvenida}
                onChange={(e) => setBienvenida(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#8BAE52] focus:border-[#8BAE52] outline-none resize-none transition duration-150 ease-in-out"
                placeholder="Escribe un mensaje de bienvenida para el curso..."
              />
            </div>

            {/* Módulos */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-[#1A3D33] mb-5">Módulos del Curso</h3>
              <div className="space-y-6">
                {modulos.map((modulo, i) => (
                  <div key={i} className="bg-white p-5 rounded-lg shadow-md border border-gray-200 relative">
                    <button
                      type="button"
                      onClick={() => eliminarModulo(i)}
                      className="absolute top-3 right-3 text-red-500 hover:text-red-700 text-lg font-bold transition-colors duration-200"
                      aria-label="Eliminar módulo"
                    >
                      &times;
                    </button>
                    <h4 className="text-lg font-semibold text-[#1A3D33] mb-3">Módulo {i + 1}</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Título del Módulo</label>
                        <input
                          type="text"
                          placeholder="Nombre del módulo"
                          value={modulo.titulo}
                          onChange={(e) => cambiarModulo(i, "titulo", e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#8BAE52] focus:border-[#8BAE52] outline-none transition duration-150 ease-in-out"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Descripción del Módulo</label>
                        <textarea
                          placeholder="Descripción del módulo"
                          value={modulo.descripcion}
                          onChange={(e) => cambiarModulo(i, "descripcion", e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#8BAE52] focus:border-[#8BAE52] outline-none resize-none transition duration-150 ease-in-out"
                          rows={3}
                        />
                      </div>

                      {/* Enlaces del Módulo */}
                      <div className="border border-gray-200 p-4 rounded-md space-y-3">
                        <h5 className="text-md font-semibold text-gray-700 mb-2">Enlaces del Módulo</h5>
                        {modulo.enlaces.map((enlace, ei) => (
                          <div key={ei} className="flex flex-col md:flex-row gap-3 items-center">
                            <input
                              type="text"
                              placeholder="Nombre del enlace"
                              value={enlace.nombre || ""}
                              onChange={(e) => cambiarEnlaceModulo(i, ei, "nombre", e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-[#8BAE52] focus:border-[#8BAE52] outline-none transition duration-150 ease-in-out"
                              required
                            />
                            <input
                              type="url"
                              placeholder="URL del enlace"
                              value={enlace.url || ""}
                              onChange={(e) => cambiarEnlaceModulo(i, ei, "url", e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-[#8BAE52] focus:border-[#8BAE52] outline-none transition duration-150 ease-in-out"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => eliminarEnlaceModulo(i, ei)}
                              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors duration-200 shadow-sm"
                            >
                              Eliminar
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => agregarEnlaceModulo(i)}
                          className="text-[#8BAE52] hover:text-[#1A3D33] font-medium mt-2 transition-colors duration-200"
                        >
                          + Agregar nuevo enlace
                        </button>
                      </div>

                      {/* Archivos del Módulo */}
                      <div>
                        <label htmlFor={`file-upload-${i}`} className="block text-sm font-medium text-gray-700 mb-2">Archivos del Módulo (Opcional)</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-[#8BAE52] focus-within:border-[#8BAE52] focus-within:bg-[#8BAE52]/5 transition duration-150 ease-in-out">
                          <div className="space-y-1 text-center">
                            <svg
                              className="mx-auto h-12 w-12 text-gray-400"
                              stroke="currentColor"
                              fill="none"
                              viewBox="0 0 48 48"
                              aria-hidden="true"
                            >
                              <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <div className="flex text-sm text-gray-600 justify-center items-center">
                              <label htmlFor={`file-upload-${i}`} className="relative cursor-pointer bg-white rounded-md font-medium text-[#8BAE52] hover:text-[#1A3D33] focus-within:outline-none">
                                <span>Subir archivos</span>
                                <input
                                  id={`file-upload-${i}`}
                                  type="file"
                                  multiple
                                  accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.7z"
                                  onChange={handleArchivosModuloChange}
                                  className="sr-only"
                                />
                              </label>
                              <span className="pl-1">o arrastrar y soltar</span>
                            </div>
                            {archivosModuloFiles.length > 0 && (
                              <p className="mt-2 text-sm text-gray-600">Archivos seleccionados: <span className="font-medium">{archivosModuloFiles.map(f => f.name).join(', ')}</span></p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Botón para Quiz */}
                      <div className="pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setQuizIndex(i);
                            setPreguntasTemp(modulo.quiz?.preguntas || []);
                            setIsQuizModalOpen(true);
                          }}
                          className="text-[#8BAE52] hover:text-[#1A3D33] font-semibold transition-colors duration-200"
                        >
                          {modulo.quiz && modulo.quiz.preguntas.length > 0 ? "Editar Quiz" : "Crear Quiz"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={agregarModulo}
                  className="bg-[#1A3D33] text-white px-6 py-3 rounded-md hover:bg-[#152f27] transition-colors duration-200 shadow-lg text-lg w-full"
                >
                  + Agregar Nuevo Módulo
                </button>
              </div>
            </div>

            {/* Configuración del Curso */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-[#1A3D33] mb-5">Configuración del Curso</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fechaInicio" className="block text-sm font-medium text-gray-700 mb-2">Fecha de Inicio</label>
                  <input
                    id="fechaInicio"
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#8BAE52] focus:border-[#8BAE52] outline-none transition duration-150 ease-in-out"
                  />
                </div>
                <div>
                  <label htmlFor="fechaTermino" className="block text-sm font-medium text-gray-700 mb-2">Fecha de Término</label>
                  <input
                    id="fechaTermino"
                    type="date"
                    value={fechaTermino}
                    onChange={(e) => setFechaTermino(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#8BAE52] focus:border-[#8BAE52] outline-none transition duration-150 ease-in-out"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="dirigidoA" className="block text-sm font-medium text-gray-700 mb-2">Dirigido a</label>
                  <select
                    id="dirigidoA"
                    value={dirigidoA}
                    onChange={(e) => setDirigidoA(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#8BAE52] focus:border-[#8BAE52] outline-none bg-white transition duration-150 ease-in-out"
                  >
                    <option value="">Seleccione una opción</option>
                    <option value="docente">Docente</option>
                    <option value="estudiante">Estudiante</option>
                    <option value="comunidad">Comunidad</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-8 py-3 rounded-md text-white font-semibold transition-all duration-300 ease-in-out shadow-lg ${
                  isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-[#8BAE52] hover:bg-[#1A3D33] transform hover:scale-105"
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    Actualizando...
                  </div>
                ) : (
                  "Actualizar Curso"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Quiz */}
        {isQuizModalOpen && quizIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
            <div
              className="relative bg-white rounded-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl transform transition-all duration-300 scale-100 opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsQuizModalOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold transition-colors duration-200"
                aria-label="Cerrar modal"
              >
                &times;
              </button>

              <h2 className="text-2xl font-bold text-[#1A3D33] mb-6 text-center">Editar Quiz del Módulo {quizIndex + 1}</h2>

              {preguntasTemp.length > 0 && (
                <div className="mb-8 border-b pb-6 border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Preguntas Añadidas:</h3>
                  <div className="space-y-4">
                    {preguntasTemp.map((q, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg relative shadow-sm border border-gray-100">
                        <button
                          onClick={() => removePreguntaFromQuiz(index)}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold text-xl transition-colors duration-200"
                          aria-label="Eliminar pregunta"
                        >
                          &times;
                        </button>
                        <p className="font-medium text-gray-900 mb-2">
                          Pregunta {index + 1}: {q.pregunta}
                        </p>
                        <ul className="ml-4 space-y-1 text-gray-700">
                          {q.opciones.map((opt, idx) => (
                            <li key={idx} className={idx === q.respuestaCorrecta ? "text-[#8BAE52] font-semibold" : ""}>
                              • {opt} {idx === q.respuestaCorrecta && "(Correcta)"}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label htmlFor="nuevaPregunta" className="block text-sm font-medium text-gray-700 mb-2">Nueva Pregunta:</label>
                  <input
                    id="nuevaPregunta"
                    type="text"
                    value={nuevaPregunta}
                    onChange={(e) => setNuevaPregunta(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-[#8BAE52] focus:border-[#8BAE52] outline-none transition duration-150 ease-in-out"
                    placeholder="Escribe la nueva pregunta"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Opciones:</label>
                  {nuevasOpciones.map((opt, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const updated = [...nuevasOpciones];
                          updated[idx] = e.target.value;
                          setNuevasOpciones(updated);
                        }}
                        className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-[#8BAE52] focus:border-[#8BAE52] outline-none transition duration-150 ease-in-out"
                        placeholder={`Opción ${idx + 1}`}
                        required
                      />
                      <label className="flex items-center space-x-1 cursor-pointer text-gray-700">
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={respuestaCorrectaTemp === idx}
                          onChange={() => setRespuestaCorrectaTemp(idx)}
                          className="form-radio text-[#8BAE52] h-4 w-4"
                        />
                        <span>Correcta</span>
                      </label>
                      {nuevasOpciones.length > 2 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newOptions = nuevasOpciones.filter((_, i) => i !== idx);
                            setNuevasOpciones(newOptions);
                            if (respuestaCorrectaTemp === idx) {
                              setRespuestaCorrectaTemp(0); // Resetear a la primera opción si la correcta es eliminada
                            } else if (respuestaCorrectaTemp > idx) {
                                setRespuestaCorrectaTemp(prev => prev - 1); // Ajustar índice si la opción eliminada estaba antes
                            }
                          }}
                          className="text-red-500 hover:text-red-700 font-bold text-xl transition-colors duration-200"
                          aria-label="Eliminar opción"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center pt-4 gap-4">
                  <div className="flex space-x-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setNuevasOpciones([...nuevasOpciones, ""])}
                      className="bg-[#1A3D33] text-white px-5 py-2 rounded-md hover:bg-[#152f27] transition-colors duration-200 shadow-md flex-1"
                    >
                      Agregar Opción
                    </button>
                    <button
                      type="button"
                      onClick={addPreguntaToQuiz}
                      className="bg-[#8BAE52] text-white px-5 py-2 rounded-md hover:bg-[#7a9947] transition-colors duration-200 shadow-md flex-1"
                    >
                      Agregar Pregunta
                    </button>
                  </div>

                  {preguntasTemp.length > 0 && (
                    <button
                      type="button"
                      onClick={finalizarQuiz}
                      className="bg-[#1A3D33] text-white px-6 py-3 rounded-md hover:bg-[#152f27] transition-colors duration-200 shadow-lg border-2 border-red-500 font-semibold w-full sm:w-auto"
                    >
                      Finalizar Quiz
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </form>
  );
};

export default EditCourse;
