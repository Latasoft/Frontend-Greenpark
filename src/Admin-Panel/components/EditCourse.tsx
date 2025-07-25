import { useState,  } from "react";
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

interface Curso {
  titulo: string;
  herramientas: string[];
  loAprenderan: string[];
  modulos: Modulo[];
  duracionHoras: number;
  bienvenida: string;
  dirigidoA: string;
  fechaInicio?: string | null;
  fechaTermino?: string | null;
  // aquí puedes agregar más campos si tienes
}

interface EditCourseProps {
  cursoId: string;
  cursoInicial: Curso;
}

const baseURL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://greenpark-backend-0ua6.onrender.com';

const EditCourse = ({ cursoId, cursoInicial }: EditCourseProps) => {
  const [titulo, setTitulo] = useState(cursoInicial.titulo || "");
  const [imagen, setImagen] = useState<File | null>(null); // Imagen nueva opcional
  const [herramientas, setHerramientas] = useState<string[]>(
    cursoInicial.herramientas || []
  );
  const [loAprenderan, setLoAprenderan] = useState<string[]>(
    cursoInicial.loAprenderan || []
  );
  const [duracionHoras, setDuracionHoras] = useState(
    cursoInicial.duracionHoras || 0
  );
  const [bienvenida, setBienvenida] = useState(cursoInicial.bienvenida || "");
  const [modulos, setModulos] = useState<Modulo[]>(cursoInicial.modulos || []);
  const [archivosModulo, setArchivosModulo] = useState<File[]>([]);
  const [fechaInicio, setFechaInicio] = useState(cursoInicial.fechaInicio || "");
  const [fechaTermino, setFechaTermino] = useState(
    cursoInicial.fechaTermino || ""
  );
  const [dirigidoA, setDirigidoA] = useState(cursoInicial.dirigidoA || "");
  const [herramientaInput, setHerramientaInput] = useState("");
  const [loAprenderanInput, setLoAprenderanInput] = useState("");
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [quizIndex, setQuizIndex] = useState<number | null>(null);
  const [preguntasTemp, setPreguntasTemp] = useState<Pregunta[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingQuiz, ] = useState(false);
  const [mensajeQuizGuardado, setMensajeQuizGuardado] = useState("");


  // Estados para agregar preguntas en el quiz modal
  const [nuevaPregunta, setNuevaPregunta] = useState("");
  const [nuevasOpciones, setNuevasOpciones] = useState<string[]>(["", ""]);
  const [respuestaCorrectaTemp, setRespuestaCorrectaTemp] = useState(0);

  // Manejo cambio imagen (opcional)
  const handleImagenChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImagen(e.target.files[0]);
    }
  };


  // Manejo archivos de módulo (opcional)
  const handleArchivosModuloChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setArchivosModulo(Array.from(e.target.files));
    }
  };

  // Agregar nuevo módulo vacío
  const agregarModulo = () => {
    setModulos([
      ...modulos,
      { nombre: "", descripcion: "", enlaces: [], quiz: { preguntas: [] } },
    ]);
  };

  // Cambiar campo de módulo
  const cambiarModulo = (
    index: number,
    field: keyof Modulo,
    value: string | Enlace[] | { preguntas: Pregunta[] }
  ) => {
    const nuevosModulos = [...modulos];
    nuevosModulos[index][field] = value as any;
    setModulos(nuevosModulos);
  };

  // Cambiar enlace de módulo
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

  // Quiz Modal: finalizar edición del quiz
  const finalizarQuiz = () => {
    if (quizIndex === null) return;

    const nuevosModulos = [...modulos];
    nuevosModulos[quizIndex].quiz = { preguntas: preguntasTemp };
    setModulos(nuevosModulos); // actualizar en frontend
    setPreguntasTemp([]);
    setQuizIndex(null);
    setIsQuizModalOpen(false);
    setMensajeQuizGuardado("Quiz actualizado localmente");

    setTimeout(() => setMensajeQuizGuardado(""), 3000);
  };





  // Eliminar pregunta temporal del quiz
  const eliminarPreguntaTemp = (index: number) => {
    setPreguntasTemp((prev) => prev.filter((_, i) => i !== index));
  };

  // Enviar formulario de actualización
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!fechaInicio || !fechaTermino) {
      alert("Por favor, ingresa las fechas de inicio y término del curso.");
      return; // No continuar si falta fecha
    }

    if (isQuizModalOpen && quizIndex !== null) {
      await finalizarQuiz();
    }

    setIsSubmitting(true);

    if (!titulo.trim()) {
      alert("El título es obligatorio");
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("titulo", titulo);
      if (imagen) formData.append("imagen", imagen);
      formData.append("herramientas", JSON.stringify(herramientas));
      formData.append("loAprenderan", JSON.stringify(loAprenderan));
      formData.append("duracionHoras", duracionHoras.toString());
      formData.append("bienvenida", bienvenida);
      formData.append("modulos", JSON.stringify(modulos)); // aquí modulos ya tiene quiz actualizado
      if (fechaInicio) formData.append("fechaInicio", fechaInicio);
      if (fechaTermino) formData.append("fechaTermino", fechaTermino);

      formData.append("dirigidoA", dirigidoA);

      archivosModulo.forEach((file) => {
        formData.append("archivosModulo", file);
      });

      const token = localStorage.getItem("token");

      await axios.put(
        `${baseURL}/api/cursos/${cursoId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      alert("Curso actualizado con éxito");
    } catch (error) {
      alert("Error al actualizar el curso");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
  <>
    {mensajeQuizGuardado && (
      <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow z-50">
        {mensajeQuizGuardado}
      </div>
    )}
    <form onSubmit={handleSubmit}>
      <div className="h-[calc(100vh-8rem)] overflow-y-auto">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-[#1A3D33] mb-6">
              Editar Curso
            </h2>

            <div className="space-y-6">
              {/* Información del Curso */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-[#1A3D33] mb-4">
                  Información del curso
                </h3>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título del Curso
                    </label>
                    <input
                      type="text"
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-[#8BAE52] focus:ring-1 focus:ring-[#8BAE52] outline-none"
                      placeholder="Ingrese título del curso"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cambiar Imagen del Curso (opcional)
                    </label>
                    <div
                      className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-[#8BAE52] focus-within:border-[#8BAE52] focus-within:bg-[#8BAE52]/5"
                    >
                      <div className="space-y-1 text-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImagenChange}
                          className="sr-only"
                          id="imagen-cambiar"
                        />
                        <label
                          htmlFor="imagen-cambiar"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-[#8BAE52] hover:text-[#1A3D33] focus-within:outline-none"
                        >
                          <span>Seleccionar nueva imagen</span>
                        </label>
                        <p className="text-xs text-gray-500 mt-2">
                          PNG, JPG, GIF hasta 10MB
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Herramientas
                    </label>
                    <div className="flex flex-wrap items-center gap-2 border border-gray-300 rounded-md p-2 min-h-[42px]">
                      {herramientas.map((herr, idx) => (
                        <span
                          key={idx}
                          className="bg-[#8BAE52] text-white px-2 py-1 rounded-full text-sm flex items-center"
                        >
                          {herr}
                          <button
                            type="button"
                            onClick={() =>
                              setHerramientas(herramientas.filter((_, i) => i !== idx))
                            }
                            className="ml-2 font-bold hover:text-red-200"
                          >
                            ×
                          </button>
                        </span>
                      ))}
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
                        placeholder="Escribe las herramientas a utilizar"
                        className="flex-1 px-2 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Aprenderás
                    </label>
                    <div className="flex flex-wrap items-center gap-2 border border-gray-300 rounded-md p-2 min-h-[42px]">
                      {loAprenderan.map((item, idx) => (
                        <span
                          key={idx}
                          className="bg-[#8BAE52] text-white px-2 py-1 rounded-full text-sm flex items-center"
                        >
                          {item}
                          <button
                            type="button"
                            onClick={() =>
                              setLoAprenderan(loAprenderan.filter((_, i) => i !== idx))
                            }
                            className="ml-2 font-bold hover:text-red-200"
                          >
                            ×
                          </button>
                        </span>
                      ))}
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
                        placeholder="Escribe lo que aprenderán los estudiantes"
                        className="flex-1 px-2 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duración (horas)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={duracionHoras}
                      onChange={(e) => setDuracionHoras(Number(e.target.value))}
                      className="w-32 px-4 py-2 border border-gray-300 rounded-md focus:ring-[#8BAE52] focus:border-[#8BAE52] outline-none"
                      placeholder="40"
                    />
                  </div>
                </div>
              </div>

              {/* Bienvenida */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-[#1A3D33] mb-4">
                  Bienvenida al Curso
                </h3>
                <textarea
                  value={bienvenida}
                  onChange={(e) => setBienvenida(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#8BAE52] focus:border-[#8BAE52] outline-none"
                  placeholder="Escribe un mensaje de bienvenida..."
                />
              </div>

              {/* Módulos */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-[#1A3D33] mb-4">
                  Módulos del Curso
                </h3>
                <div className="space-y-6">
                  {modulos.map((modulo, i) => (
                    <div
                      key={i}
                      className="bg-white p-4 rounded-lg shadow space-y-4"
                    >
                      <input
                        type="text"
                        placeholder="Nombre del módulo"
                        value={modulo.nombre}
                        onChange={(e) =>
                          cambiarModulo(i, "nombre", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#8BAE52] focus:border-[#8BAE52] outline-none"
                      />
                      <textarea
                        placeholder="Descripción del módulo"
                        value={modulo.descripcion}
                        onChange={(e) =>
                          cambiarModulo(i, "descripcion", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#8BAE52] focus:border-[#8BAE52] outline-none resize-none"
                        rows={4}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Título del enlace"
                          value={modulo.enlaces[0]?.nombre || ""}
                          onChange={(e) =>
                            cambiarEnlaceModulo(i, 0, "nombre", e.target.value)
                          }
                          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-[#8BAE52] focus:border-[#8BAE52] outline-none"
                        />
                        <input
                          type="url"
                          placeholder="URL del enlace"
                          value={modulo.enlaces[0]?.url || ""}
                          onChange={(e) =>
                            cambiarEnlaceModulo(i, 0, "url", e.target.value)
                          }
                          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-[#8BAE52] focus:border-[#8BAE52] outline-none"
                        />
                      </div>

                      {/* Quiz */}
                      <button
                        type="button"
                        onClick={() => {
                          setQuizIndex(i);
                          setPreguntasTemp(modulos[i].quiz?.preguntas || []);
                          setIsQuizModalOpen(true);
                        }}
                        className="text-[#8BAE52] hover:text-[#1A3D33] font-medium"
                      >
                        + Editar Quiz
                      </button>
                    </div>
                  ))}

                  <div className="flex gap-4 items-center mt-4">
                    <div className="relative w-fit">
                      <input
                        id="file-upload"
                        type="file"
                        multiple
                        onChange={handleArchivosModuloChange}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                      />
                      <button
                        type="button"
                        className="bg-[#1A3D33] text-white px-4 py-2 rounded-md hover:bg-[#152f27]"
                        onClick={() => document.getElementById("file-upload")?.click()}
                      >
                        Adjuntar Archivos
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={agregarModulo}
                      className="text-[#8BAE52] hover:text-[#1A3D33] font-semibold"
                    >
                      + Agregar módulo
                    </button>
                  </div>
                </div>
              </div>

              {/* Fechas y dirigidoA */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-[#1A3D33] mb-4">
                  Fechas y Público objetivo
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha Inicio
                    </label>
                    <input
                      type="date"
                      value={fechaInicio || ""}
                      onChange={(e) => setFechaInicio(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#8BAE52] focus:border-[#8BAE52] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha Término
                    </label>
                    <input
                      type="date"
                      value={fechaTermino || ""}
                      onChange={(e) => setFechaTermino(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#8BAE52] focus:border-[#8BAE52] outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirigido a
                    </label>
                    <textarea
                      value={dirigidoA}
                      onChange={(e) => setDirigidoA(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#8BAE52] focus:border-[#8BAE52] outline-none"
                      placeholder="Describe el público objetivo..."
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#8BAE52] hover:bg-[#7a9943] text-white font-semibold px-6 py-3 rounded-md"
                >
                  {isSubmitting ? "Actualizando..." : "Actualizar Curso"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Quiz */}
      {isQuizModalOpen && quizIndex !== null && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => setIsQuizModalOpen(false)}
        >
          <div
            className="bg-white rounded-lg p-6 w-[600px] max-w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Spinner */}
            {isSavingQuiz && (
              <div className="absolute inset-0 bg-white bg-opacity-80 flex justify-center items-center z-10">
                <div className="loader border-t-4 border-[#8BAE52] border-solid rounded-full w-12 h-12 animate-spin" />
              </div>
            )}

            <h3 className="text-lg font-semibold mb-4">Editar Quiz - Módulo {quizIndex + 1}</h3>

            {/* Mensaje de guardado */}
            {mensajeQuizGuardado && (
              <div className="mb-4 text-green-600 font-medium">{mensajeQuizGuardado}</div>
            )}

            {/* Listado de preguntas */}
            <div className="max-h-72 overflow-y-auto mb-4">
              {preguntasTemp.length === 0 && (
                <p className="text-gray-500">No hay preguntas agregadas.</p>
              )}
              {preguntasTemp.map((pregunta, i) => (
                <div key={i} className="border rounded p-3 mb-3 relative">
                  <button
                    type="button"
                    onClick={() => eliminarPreguntaTemp(i)}
                    className="absolute top-1 right-2 text-red-500 font-bold"
                  >
                    ×
                  </button>
                  <p className="font-semibold">{pregunta.pregunta}</p>
                  <ul className="list-disc ml-5 mt-2">
                    {pregunta.opciones.map((opcion, j) => (
                      <li
                        key={j}
                        className={
                          j === pregunta.respuestaCorrecta
                            ? "font-bold text-green-600"
                            : ""
                        }
                      >
                        {opcion}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Formulario nueva pregunta */}
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Nueva pregunta"
                value={nuevaPregunta}
                onChange={(e) => setNuevaPregunta(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none"
              />
              {nuevasOpciones.map((opt, i) => (
                <input
                  key={i}
                  type="text"
                  placeholder={`Opción ${i + 1}`}
                  value={opt}
                  onChange={(e) => {
                    const nuevas = [...nuevasOpciones];
                    nuevas[i] = e.target.value;
                    setNuevasOpciones(nuevas);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none"
                />
              ))}
              <button
                type="button"
                onClick={() => setNuevasOpciones([...nuevasOpciones, ""])}
                className="text-[#8BAE52] hover:text-[#1A3D33] font-medium"
              >
                + Agregar opción
              </button>

              <div className="mt-2">
                <label className="block font-semibold mb-1">Respuesta correcta</label>
                <select
                  value={respuestaCorrectaTemp}
                  onChange={(e) => setRespuestaCorrectaTemp(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none"
                >
                  {nuevasOpciones.map((_, i) => (
                    <option key={i} value={i}>
                      Opción {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!nuevaPregunta.trim()) {
                    alert("La pregunta no puede estar vacía");
                    return;
                  }
                  if (nuevasOpciones.some((opt) => !opt.trim())) {
                    alert("Todas las opciones deben estar completas");
                    return;
                  }
                  setPreguntasTemp([
                    ...preguntasTemp,
                    {
                      pregunta: nuevaPregunta.trim(),
                      opciones: nuevasOpciones,
                      respuestaCorrecta: respuestaCorrectaTemp,
                    },
                  ]);
                  setNuevaPregunta("");
                  setNuevasOpciones(["", ""]);
                  setRespuestaCorrectaTemp(0);
                }}
                className="bg-[#8BAE52] hover:bg-[#7a9943] text-white font-semibold px-4 py-2 rounded-md"
              >
                + Agregar pregunta
              </button>
            </div>

            {/* Acciones */}
            <div className="mt-6 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setIsQuizModalOpen(false)}
                className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={finalizarQuiz}
                disabled={isSavingQuiz}
                className="bg-[#8BAE52] hover:bg-[#7a9943] text-white font-semibold px-4 py-2 rounded-md"
              >
                Guardar Quiz
              </button>
            </div>
          </div>
        </div>
      )}

    </form>
  </>
  );
};

export default EditCourse;
