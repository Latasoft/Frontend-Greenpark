import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";


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

const CrearCurso = () => {
  const [titulo, setTitulo] = useState("");
  const [imagen, setImagen] = useState<File | null>(null);
  const [herramientas, setHerramientas] = useState<string[]>([]);
  const [loAprenderan, setLoAprenderan] = useState<string[]>([]);
  const [duracionHoras, setDuracionHoras] = useState<number>(0);
  const [bienvenida, setBienvenida] = useState("");
  const [modulos, setModulos] = useState<Modulo[]>([
    { nombre: "", descripcion: "", enlaces: [], quiz: { preguntas: [] } },
  ]);
  const [archivosModulo, setArchivosModulo] = useState<File[]>([]);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaTermino, setFechaTermino] = useState("");
  const [dirigidoA, setDirigidoA] = useState("");
  const [herramientaInput, setHerramientaInput] = useState("");
  const [loAprenderanInput, setLoAprenderanInput] = useState("");
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [quizIndex, setQuizIndex] = useState<number | null>(null);
  const [preguntasTemp, setPreguntasTemp] = useState<Pregunta[]>([]);

  const [nuevaPregunta, setNuevaPregunta] = useState("");
  const [nuevasOpciones, setNuevasOpciones] = useState<string[]>(["", ""]);
  const [respuestaCorrectaTemp, setRespuestaCorrectaTemp] = useState<number>(0);



  // Manejo archivos e imagen
  const handleImagenChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImagen(e.target.files[0]);
    }
  };

  const handleArchivosModuloChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setArchivosModulo(Array.from(e.target.files));
    }
  };

  // Manejo módulos
  const agregarModulo = () => {
    setModulos([
      ...modulos,
      { nombre: "", descripcion: "", enlaces: [], quiz: { preguntas: [] } },
    ]);
  };

  const cambiarModulo = (
    index: number,
    field: keyof Modulo,
    value: string | Enlace[] | { preguntas: Pregunta[] }
  ) => {
    const nuevosModulos = [...modulos];
    nuevosModulos[index][field] = value as any;
    setModulos(nuevosModulos);
  };

  // Manejo enlaces por módulo
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


  // Enviar formulario
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!titulo.trim()) {
      alert("El título es obligatorio");
      return;
    }
    if (!imagen) {
      alert("La imagen es obligatoria");
      return;
    }

    const formData = new FormData();
    formData.append("titulo", titulo);
    formData.append("imagen", imagen);
    formData.append("herramientas", JSON.stringify(herramientas));
    formData.append("loAprenderan", JSON.stringify(loAprenderan));
    formData.append("duracionHoras", duracionHoras.toString());
    formData.append("bienvenida", bienvenida);
    formData.append("modulos", JSON.stringify(modulos));
    formData.append("fechaInicio", fechaInicio);
    formData.append("fechaTermino", fechaTermino);
    formData.append("dirigidoA", dirigidoA);

    archivosModulo.forEach((file) => {
      formData.append("archivosModulo", file);
    });

    try {
      const res = await fetch("https://greenpark-0ua6-backend.onrender.com/api/cursos", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        alert("Error: " + errorText);
        return;
      }

      alert("Curso creado con éxito");

      // Reset formulario (opcional)
      setTitulo("");
      setImagen(null);
      setHerramientas([]);
      setLoAprenderan([]);
      setDuracionHoras(0);
      setBienvenida("");
      setModulos([{ nombre: "", descripcion: "", enlaces: [], quiz: { preguntas: [] } }]);
      setArchivosModulo([]);
      setFechaInicio("");
      setFechaTermino("");
      setDirigidoA("");
    } catch (error) {
      alert("Error al crear curso");
      console.error(error);
    }
  };
  const finalizarQuiz = () => {
    if (quizIndex === null) return;

    const nuevosModulos = [...modulos];
    nuevosModulos[quizIndex].quiz = { preguntas: preguntasTemp };
    setModulos(nuevosModulos);

    setPreguntasTemp([]);
    setQuizIndex(null);
    setIsQuizModalOpen(false);
  };


  return (
    <form onSubmit={handleSubmit}>
      <div className="h-[calc(100vh-8rem)] overflow-y-auto">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-[#1A3D33] mb-6">Nuevo Curso</h2>

            <div className="space-y-6">
              {/* Información del Curso */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-[#1A3D33] mb-4">Información del curso</h3>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Título del Curso</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Imagen del Curso</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-[#8BAE52] focus-within:border-[#8BAE52] focus-within:bg-[#8BAE52]/5">
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
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-[#8BAE52] hover:text-[#1A3D33] focus-within:outline-none">
                            <span>Subir archivo</span>
                            <input
                              type="file"
                              accept="image/*"
                              required
                              onChange={handleImagenChange}
                              className="sr-only"
                            />


                          </label>
                          <span className="pl-1">o arrastrar y soltar</span>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 10MB</p>
                        {imagen && (
                          <p className="mt-2 text-sm text-gray-600">Archivo seleccionado: <span className="font-medium">{imagen.name}</span></p>
                        )}
                      </div>
                    </div>
                  </div>


                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Herramientas</label>
                    <div className="flex flex-wrap items-center gap-2 border border-gray-300 rounded-md p-2 min-h-[42px]">
                      {herramientas.map((herr, idx) => (
                        <span key={idx} className="bg-[#8BAE52] text-white px-2 py-1 rounded-full text-sm flex items-center">
                          {herr}
                          <button
                            type="button"
                            onClick={() => setHerramientas(herramientas.filter((_, i) => i !== idx))}
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
                        placeholder="Presiona Enter para agregar"
                        className="flex-1 px-2 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Aprenderás</label>
                    <div className="flex flex-wrap items-center gap-2 border border-gray-300 rounded-md p-2 min-h-[42px]">
                      {loAprenderan.map((item, idx) => (
                        <span key={idx} className="bg-[#8BAE52] text-white px-2 py-1 rounded-full text-sm flex items-center">
                          {item}
                          <button
                            type="button"
                            onClick={() => setLoAprenderan(loAprenderan.filter((_, i) => i !== idx))}
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
                        placeholder="Presiona Enter para agregar"
                        className="flex-1 px-2 outline-none"
                      />
                    </div>
                  </div>




                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duración (horas)</label>
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
                <h3 className="text-lg font-semibold text-[#1A3D33] mb-4">Bienvenida al Curso</h3>
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
                <h3 className="text-lg font-semibold text-[#1A3D33] mb-4">Módulos del Curso</h3>
                <div className="space-y-6">
                  {modulos.map((modulo, i) => (
                    <div key={i} className="bg-white p-4 rounded-lg shadow space-y-4">
                      <input
                        type="text"
                        placeholder="Nombre del módulo"
                        value={modulo.nombre}
                        onChange={(e) => cambiarModulo(i, "nombre", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#8BAE52] focus:border-[#8BAE52] outline-none"
                      />
                      <textarea
                        placeholder="Descripción del módulo"
                        value={modulo.descripcion}
                        onChange={(e) => cambiarModulo(i, "descripcion", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#8BAE52] focus:border-[#8BAE52] outline-none resize-none"
                        rows={4}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Título del enlace"
                          value={modulo.enlaces[0]?.nombre || ""}
                          onChange={(e) => cambiarEnlaceModulo(i, 0, "nombre", e.target.value)}
                          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-[#8BAE52] focus:border-[#8BAE52] outline-none"
                        />
                        <input
                          type="url"
                          placeholder="URL del enlace"
                          value={modulo.enlaces[0]?.url || ""}
                          onChange={(e) => cambiarEnlaceModulo(i, 0, "url", e.target.value)}
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
                        + Agregar Quiz
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
                      className="text-[#8BAE52] hover:text-[#1A3D33] font-medium"
                    >
                      + Agregar nuevo módulo
                    </button>
                  </div>
                </div>
              </div>


              {/* Configuración */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-[#1A3D33] mb-4">Configuración del curso</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Inicio</label>
                    <input
                      type="date"
                      value={fechaInicio}
                      onChange={(e) => setFechaInicio(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#8BAE52] focus:border-[#8BAE52] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Término</label>
                    <input
                      type="date"
                      value={fechaTermino}
                      onChange={(e) => setFechaTermino(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#8BAE52] focus:border-[#8BAE52] outline-none"
                    />
                  </div>
                  <div className="md:col-span-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirigido a
                    </label>

                    <select
                      value={dirigidoA}
                      onChange={(e) => setDirigidoA(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#8BAE52] focus:border-[#8BAE52] outline-none"
                    >
                      <option value="">Seleccione una opción</option>
                      <option value="docente">Docente</option>
                      <option value="estudiante">Estudiante</option>
                      <option value="apoderado">Apoderado</option>
                    </select>
                  </div>



                </div>
              </div>




              {/* Botones */}
              <div className="flex justify-end space-x-4">
                <button type="button" className="px-6 py-2 border border-[#1A3D33] text-[#1A3D33] rounded-md hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit" className="px-6 py-2 bg-[#8BAE52] text-white rounded-md hover:bg-[#1A3D33]">
                  Crear Curso
                </button>
              </div>
            </div>
          </div>
        </div>


        {isQuizModalOpen && quizIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Fondo oscuro que cierra el modal al hacer clic */}
            <div
              className="absolute inset-0 bg-black opacity-50"
              onClick={() => setIsQuizModalOpen(false)}
            ></div>

            {/* Contenido del modal */}
            <div
              className="relative bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()} // Evita que el clic cierre el modal
            >
              {/* Botón de cerrar */}
              <button
                onClick={() => setIsQuizModalOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>

              <h2 className="text-2xl font-bold mb-4">Crear Quiz</h2>

              {/* Lista de preguntas agregadas */}
              {preguntasTemp.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Preguntas Añadidas:</h3>
                  {preguntasTemp.map((q, index) => (
                    <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg relative">
                      <button
                        onClick={() =>
                          setPreguntasTemp((prev) => prev.filter((_, i) => i !== index))
                        }
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                      <p className="font-medium">Pregunta {index + 1}: {q.pregunta}</p>
                      <ul className="ml-4 mt-2">
                        {q.opciones.map((opt, idx) => (
                          <li
                            key={idx}
                            className={idx === q.respuestaCorrecta ? "text-[#8BAE52]" : ""}
                          >
                            • {opt} {idx === q.respuestaCorrecta && "(Correcta)"}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Formulario para agregar preguntas */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();

                  if (!nuevaPregunta.trim() || nuevasOpciones.some((op) => !op.trim())) {
                    alert("Completa todos los campos");
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
                }}
                className="space-y-4 pb-10"
              >
                {/* Campo de nueva pregunta */}
                <div className="space-y-4 pb-10">
                  {/* Campo de nueva pregunta */}
                  <div>
                    <label className="block mb-2">Nueva Pregunta:</label>
                    <input
                      type="text"
                      value={nuevaPregunta}
                      onChange={(e) => setNuevaPregunta(e.target.value)}
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>

                  {/* Opciones de respuesta */}
                  <div className="space-y-3">
                    <label className="block mb-2">Opciones:</label>
                    {nuevasOpciones.map((opt, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const updated = [...nuevasOpciones];
                            updated[idx] = e.target.value;
                            setNuevasOpciones(updated);
                          }}
                          className="flex-1 p-2 border rounded-md"
                          placeholder={`Opción ${idx + 1}`}
                          required
                        />
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={respuestaCorrectaTemp === idx}
                          onChange={() => setRespuestaCorrectaTemp(idx)}
                        />
                        <span>Correcta</span>
                        {nuevasOpciones.length > 2 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newOptions = nuevasOpciones.filter((_, i) => i !== idx);
                              setNuevasOpciones(newOptions);
                              if (respuestaCorrectaTemp === idx) {
                                setRespuestaCorrectaTemp(0);
                              }
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Botones */}
                  <div className="flex items-center justify-between pt-4">
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setNuevasOpciones([...nuevasOpciones, ""])}
                        className="bg-[#1A3D33] text-white px-4 py-2 rounded hover:bg-[#152f27]"
                      >
                        Agregar Opción
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!nuevaPregunta.trim() || nuevasOpciones.some((op) => !op.trim())) {
                            alert("Completa todos los campos");
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
                        }}
                        className="bg-[#8BAE52] text-white px-4 py-2 rounded hover:bg-[#7a9947]"
                      >
                        Agregar Pregunta
                      </button>
                    </div>

                    {preguntasTemp.length > 0 && (
                      <button
                        type="button"
                        onClick={finalizarQuiz}
                        className="bg-[#1A3D33] text-white px-4 py-2 rounded hover:bg-[#152f27] border-4 border-red-500"
                      >
                        Finalizar Quiz
                      </button>
                    )}
                  </div>
                </div>

              </form>
            </div>
          </div>
        )}



      </div>
    </form>


  );
};
export default CrearCurso;
