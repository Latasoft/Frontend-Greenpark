import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";

interface Enlace {
  nombre: string;
  url: string;
}

interface QuizOpcion {
  texto: string;
  correcta: boolean;
}

interface QuizPregunta {
  texto: string;
  opciones: QuizOpcion[];
}

interface Quiz {
  preguntas: QuizPregunta[];
}

interface Archivo {
  nombre: string;
  url: string;
  file?: File;
}

interface Modulo {
  id?: string;
  titulo: string;
  descripcion: string;
  enlaces: Enlace[];
  quiz: Quiz;
  archivos: Archivo[];
  archivosNuevos: File[];
  // Auxiliares para UI:
  nuevaPregunta?: string;
  opciones?: QuizOpcion[];
  editandoPreguntaIndex?: number | null;
  editPreguntaTexto?: string;
  editOpciones?: QuizOpcion[];
}

interface EditCourseProps {
  cursoId: string;
}

const baseURL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://greenpark-backend-0ua6.onrender.com";

const EditCourse = ({ cursoId }: EditCourseProps) => {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false); // nuevo estado para controlar actualización
  const [error, setError] = useState<string | null>(null);

  // Campos controlados
  const [titulo, setTitulo] = useState("");
  const [bienvenida, setBienvenida] = useState("");
  const [duracionHoras, setDuracionHoras] = useState<number | "">("");
  const [dirigidoA, setDirigidoA] = useState("comunidad");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaTermino, setFechaTermino] = useState("");
  const [herramientas, setHerramientas] = useState<string[]>([]);
  const [herramientaInput, setHerramientaInput] = useState("");
  const [loAprenderan, setLoAprenderan] = useState<string[]>([]);
  const [aprenderInput, setAprenderInput] = useState("");
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string>("");

  useEffect(() => {
    const fetchCurso = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${baseURL}/api/cursos/${cursoId}`);
        const data = res.data;

        const toDateInput = (fecha: any) => {
          if (!fecha) return "";
          if (fecha._seconds) {
            const d = new Date(fecha._seconds * 1000);
            return d.toISOString().split("T")[0];
          }
          return fecha.split ? fecha.split("T")[0] : "";
        };

        const modulosParsed: Modulo[] = (data.modulos || []).map((m: any) => ({
          ...m,
          archivosNuevos: [],
          archivos: m.archivos || [],
          nuevaPregunta: "",
          opciones: [
            { texto: "", correcta: false },
            { texto: "", correcta: false },
          ],
          editandoPreguntaIndex: null,
          editPreguntaTexto: "",
          editOpciones: [],
        }));

        setTitulo(data.titulo || "");
        setBienvenida(data.bienvenida || "");
        setDuracionHoras(data.duracionHoras || "");
        setDirigidoA(data.dirigidoA || "comunidad");
        setFechaInicio(toDateInput(data.fechaInicio));
        setFechaTermino(toDateInput(data.fechaTermino));
        setHerramientas(data.herramientas || []);
        setLoAprenderan(data.loAprenderan || []);
        setModulos(modulosParsed);
        setImagenPreview(data.imagenUrl || "");
      } catch (err) {
        console.error("Error cargando curso:", err);
        setError("Error cargando curso");
      } finally {
        setLoading(false);
      }
    };
    fetchCurso();
  }, [cursoId]);

  // Agregar herramienta
  const agregarHerramienta = () => {
    const value = herramientaInput.trim();
    if (value && !herramientas.includes(value)) {
      setHerramientas([...herramientas, value]);
      setHerramientaInput("");
    }
  };

  // Eliminar herramienta
  const eliminarHerramienta = (item: string) => {
    setHerramientas(herramientas.filter((h) => h !== item));
  };

  // Agregar "Lo aprenderán"
  const agregarAprender = () => {
    const value = aprenderInput.trim();
    if (value && !loAprenderan.includes(value)) {
      setLoAprenderan([...loAprenderan, value]);
      setAprenderInput("");
    }
  };

  // Eliminar "Lo aprenderán"
  const eliminarAprender = (item: string) => {
    setLoAprenderan(loAprenderan.filter((l) => l !== item));
  };

  // Módulos
  const handleModuloChange = (index: number, field: keyof Modulo, value: any) => {
    const updated = [...modulos];
    updated[index] = { ...updated[index], [field]: value };
    setModulos(updated);
  };

  const handleFileChange = (index: number, files: FileList | null) => {
    if (!files) return;
    const updated = [...modulos];
    updated[index].archivosNuevos = [...updated[index].archivosNuevos, ...Array.from(files)];
    setModulos(updated);
  };

  const eliminarModulo = (index: number) => {
    if (!window.confirm("¿Eliminar módulo?")) return;
    const updated = [...modulos];
    updated.splice(index, 1);
    setModulos(updated);
  };

  const eliminarArchivoExistente = (moduloIndex: number, archivoIndex: number) => {
    if (!window.confirm("¿Eliminar archivo?")) return;
    const updated = [...modulos];
    updated[moduloIndex].archivos.splice(archivoIndex, 1);
    setModulos(updated);
  };

  // Imagen
  const handleImagenChange = (file: File | null) => {
    setImagenFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagenPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagenPreview("");
    }
  };

  // Enviar formulario con control de estado updating
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setUpdating(true);  // bloquear formulario y mostrar spinner

    try {
      const token = localStorage.getItem("token"); // Ajusta según donde guardes el token

      if (!token) {
        alert("No autorizado. Por favor inicia sesión.");
        setUpdating(false);
        return;
      }

      const formData = new FormData();
      formData.append("titulo", titulo);
      formData.append("bienvenida", bienvenida);
      formData.append("duracionHoras", duracionHoras.toString());
      formData.append("dirigidoA", dirigidoA);
      formData.append("fechaInicio", fechaInicio);
      formData.append("fechaTermino", fechaTermino);
      formData.append("herramientas", JSON.stringify(herramientas));
      formData.append("loAprenderan", JSON.stringify(loAprenderan));

      if (imagenFile) {
        formData.append("imagen", imagenFile);
      }

      const modulosParaEnviar = modulos.map(({ archivosNuevos, ...rest }) => rest);
      formData.append("modulos", JSON.stringify(modulosParaEnviar));

      modulos.forEach((modulo, i) => {
        modulo.archivosNuevos.forEach((file) => {
          formData.append(`archivosModulo_${i}`, file);
        });
      });

      await axios.put(`${baseURL}/api/cursos/${cursoId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (window.confirm("Curso actualizado con éxito")) {
        window.location.reload();
      }
    } catch (error: any) {
      console.error("Error actualizando curso:", error);
      if (error.response?.status === 401) {
        alert("No autorizado. Por favor inicia sesión de nuevo.");
      } else {
        alert("Error al actualizar el curso. Intenta nuevamente.");
      }
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <p>Cargando curso...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl mx-auto p-8 space-y-8 bg-white rounded-2xl shadow-lg border border-green-100"
    >
      <h2 className="text-3xl font-bold text-green-700 border-b pb-4">Editar Curso</h2>

      <input
        type="text"
        placeholder="Título del curso"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        className="w-full border border-green-300 focus:ring-2 focus:ring-green-400 p-3 rounded-lg outline-none"
        required
        disabled={updating}
      />

      {/* Imagen y preview */}
      <div>
        <label className="block text-green-700 font-semibold mb-2">Imagen del curso</label>
        {imagenPreview && (
          <img
            src={imagenPreview}
            alt="Vista previa"
            className="w-full h-64 object-cover rounded-xl border mb-4"
          />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleImagenChange(e.target.files?.[0] || null)}
          className="w-full text-green-700"
          disabled={updating}
        />
      </div>

      <textarea
        placeholder="Mensaje de bienvenida"
        value={bienvenida}
        onChange={(e) => setBienvenida(e.target.value)}
        className="w-full border border-green-300 focus:ring-2 focus:ring-green-400 p-3 rounded-lg outline-none"
        disabled={updating}
      />

      <input
        type="number"
        min={0}
        placeholder="Duración en horas"
        value={duracionHoras}
        onChange={(e) => {
          const val = e.target.value;
          setDuracionHoras(val === "" ? "" : Number(val));
        }}
        className="w-full border border-green-300 focus:ring-2 focus:ring-green-400 p-3 rounded-lg outline-none"
        disabled={updating}
      />

      <select
        value={dirigidoA}
        onChange={(e) => setDirigidoA(e.target.value)}
        className="w-full border border-green-300 focus:ring-2 focus:ring-green-400 p-3 rounded-lg outline-none"
        disabled={updating}
      >
        <option value="comunidad">Comunidad</option>
        <option value="estudiante">Estudiante</option>
        <option value="docente">Docente</option>
      </select>

      <div className="flex gap-4">
        <input
          type="date"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
          className="border border-green-300 focus:ring-2 focus:ring-green-400 p-3 rounded-lg outline-none w-1/2"
          disabled={updating}
        />
        <input
          type="date"
          value={fechaTermino}
          onChange={(e) => setFechaTermino(e.target.value)}
          className="border border-green-300 focus:ring-2 focus:ring-green-400 p-3 rounded-lg outline-none w-1/2"
          disabled={updating}
        />
      </div>

      {/* Herramientas */}
      <div>
        <label className="block font-semibold text-green-700 mb-2">Herramientas</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={herramientaInput}
            onChange={(e) => setHerramientaInput(e.target.value)}
            className="flex-grow border border-green-300 p-2 rounded-lg outline-none"
            placeholder="Agregar herramienta"
            disabled={updating}
          />
          <button
            type="button"
            onClick={agregarHerramienta}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            disabled={updating}
          >
            +
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {herramientas.map((h) => (
            <span
              key={h}
              className="bg-green-200 text-green-900 px-3 py-1 rounded-full cursor-pointer select-none"
              onClick={() => !updating && eliminarHerramienta(h)}
              title="Eliminar"
            >
              {h} &times;
            </span>
          ))}
        </div>
      </div>

      {/* Lo aprenderán */}
      <div>
        <label className="block font-semibold text-green-700 mb-2">Lo aprenderán</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={aprenderInput}
            onChange={(e) => setAprenderInput(e.target.value)}
            className="flex-grow border border-green-300 p-2 rounded-lg outline-none"
            placeholder="Agregar elemento"
            disabled={updating}
          />
          <button
            type="button"
            onClick={agregarAprender}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            disabled={updating}
          >
            +
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {loAprenderan.map((l) => (
            <span
              key={l}
              className="bg-green-200 text-green-900 px-3 py-1 rounded-full cursor-pointer select-none"
              onClick={() => !updating && eliminarAprender(l)}
              title="Eliminar"
            >
              {l} &times;
            </span>
          ))}
        </div>
      </div>

      {/* Módulos */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-green-700">Módulos</h3>
        {modulos.map((modulo, index) => (
          <div
            key={index}
            className="border border-green-200 bg-green-50 p-4 rounded-xl shadow-sm space-y-3 relative"
          >
            <button
              type="button"
              onClick={() => eliminarModulo(index)}
              className="absolute top-2 right-2 text-red-600 font-bold hover:text-red-800"
              title="Eliminar módulo"
              disabled={updating}
            >
              ×
            </button>

            <input
              type="text"
              placeholder="Título del módulo"
              value={modulo.titulo}
              onChange={(e) => handleModuloChange(index, "titulo", e.target.value)}
              className="w-full border border-green-300 focus:ring-2 focus:ring-green-400 p-2 rounded-lg outline-none"
              required
              disabled={updating}
            />
            <textarea
              placeholder="Descripción del módulo"
              value={modulo.descripcion}
              onChange={(e) => handleModuloChange(index, "descripcion", e.target.value)}
              className="w-full border border-green-300 focus:ring-2 focus:ring-green-400 p-2 rounded-lg outline-none"
              disabled={updating}
            />

            <div>
              <label className="block mb-1 font-semibold text-green-700">Archivos existentes:</label>
              {modulo.archivos.length === 0 && (
                <p className="text-sm text-gray-600">No hay archivos.</p>
              )}
              <ul className="list-disc pl-5 space-y-1 max-h-32 overflow-auto">
                {modulo.archivos.map((archivo, i) => (
                  <li key={i} className="flex justify-between items-center">
                    <a
                      href={archivo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-700 underline"
                    >
                      {archivo.nombre}
                    </a>
                    <button
                      type="button"
                      onClick={() => eliminarArchivoExistente(index, i)}
                      className="text-red-600 hover:text-red-800 ml-4 font-bold"
                      title="Eliminar archivo"
                      disabled={updating}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <label className="block mt-2 mb-1 font-semibold text-green-700">
                Agregar archivos nuevos:
              </label>

              <input
                type="file"
                multiple
                id={`file-input-${index}`}
                className="hidden"
                onChange={(e) => handleFileChange(index, e.target.files)}
                disabled={updating}
              />

              <button
                type="button"
                onClick={() => document.getElementById(`file-input-${index}`)?.click()}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                disabled={updating}
              >
                Seleccionar archivos
              </button>

              {modulo.archivosNuevos.length > 0 && (
                <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 max-h-20 overflow-auto">
                  {modulo.archivosNuevos.map((file, i) => (
                    <li key={i}>{file.name}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Quiz del módulo */}
            <div className="mt-4 p-3 bg-white rounded border border-green-200">
              <h4 className="font-semibold text-green-700 mb-2">Quiz del módulo</h4>
              {/* Si no hay preguntas */}
              {modulo.quiz.preguntas.length === 0 && (
                <div className="text-gray-500 italic mb-2">No hay preguntas relacionadas.</div>
              )}
              {/* Lista de preguntas ya agregadas */}
              {modulo.quiz.preguntas.map((pregunta, pi) => (
                <div key={pi} className="mb-2 flex flex-col gap-1 border-b pb-2">
                  {modulo.editandoPreguntaIndex === pi ? (
                    <>
                      <input
                        type="text"
                        value={modulo.editPreguntaTexto}
                        onChange={e => {
                          const value = e.target.value;
                          setModulos(prev => {
                            const nuevos = [...prev];
                            nuevos[index].editPreguntaTexto = value;
                            return nuevos;
                          });
                        }}
                        className="border border-green-300 p-2 rounded-lg outline-none mb-2"
                        disabled={updating}
                      />
                      <div className="flex flex-col gap-2">
                        {(modulo.editOpciones ?? []).map((op, oi) => (
                          <div key={oi} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={op.texto}
                              onChange={e => {
                                const value = e.target.value;
                                updateEditOpcionTexto(setModulos, index, oi, value);
                              }}
                              className="border border-green-300 p-2 rounded-lg outline-none w-60"
                              disabled={updating}
                            />
                            <input
                              type="radio"
                              name={`edit-correcta-${index}-${pi}`}
                              checked={op.correcta}
                              onChange={() => setEditOpcionCorrecta(setModulos, index, oi)}
                              disabled={updating}
                            />
                            <span className="text-xs">Correcta</span>
                            {(modulo.editOpciones?.length ?? 0) > 2 && (
                              <button
                                type="button"
                                className="text-red-500 hover:underline ml-2"
                                onClick={() => removeEditOpcion(setModulos, index, oi)}
                                disabled={updating}
                              >
                                Eliminar
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          className="text-green-700 hover:underline w-fit"
                          onClick={() => {
                            setModulos(prev => {
                              const nuevos = [...prev];
                              if (!nuevos[index].editOpciones) {
                                nuevos[index].editOpciones = [];
                              }
                              nuevos[index].editOpciones.push({ texto: "", correcta: false });
                              return nuevos;
                            });
                          }}
                          disabled={updating}
                        >
                          + Agregar opción
                        </button>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button
                          type="button"
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          disabled={
                            updating ||
                            !modulo.editPreguntaTexto ||
                            (modulo.editOpciones ?? []).some((op) => !op.texto) ||
                            !(modulo.editOpciones ?? []).some((op) => op.correcta)
                          }
                          onClick={() => {
                            setModulos(prev => {
                              const nuevos = [...prev];
                              nuevos[index].quiz.preguntas[pi] = {
                                texto: nuevos[index].editPreguntaTexto ?? "",
                                opciones: (nuevos[index].editOpciones ?? []).map(op => ({ ...op })),
                              };
                              nuevos[index].editandoPreguntaIndex = null;
                              nuevos[index].editPreguntaTexto = "";
                              nuevos[index].editOpciones = [];
                              return nuevos;
                            });
                          }}
                        >
                          Guardar cambios
                        </button>
                        <button
                          type="button"
                          className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                          onClick={() => {
                            setModulos(prev => {
                              const nuevos = [...prev];
                              nuevos[index].editandoPreguntaIndex = null;
                              nuevos[index].editPreguntaTexto = "";
                              nuevos[index].editOpciones = [];
                              return nuevos;
                            });
                          }}
                        >
                          Cancelar
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex gap-2 items-center">
                        <span className="font-medium">Pregunta {pi + 1}:</span>
                        <span>{pregunta.texto}</span>
                        <button
                          type="button"
                          className="ml-2 text-blue-500 hover:underline"
                          onClick={() => {
                            setModulos(prev => {
                              const nuevos = [...prev];
                              nuevos[index].editandoPreguntaIndex = pi;
                              nuevos[index].editPreguntaTexto = pregunta.texto;
                              nuevos[index].editOpciones = pregunta.opciones.map(op => ({ ...op }));
                              return nuevos;
                            });
                          }}
                          disabled={updating}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="ml-2 text-red-500 hover:underline"
                          onClick={() => {
                            setModulos(prev => {
                              const nuevos = [...prev];
                              // Copia el array de preguntas para evitar referencias compartidas
                              const preguntas = [...nuevos[index].quiz.preguntas];
                              preguntas.splice(pi, 1); // Elimina solo la pregunta seleccionada
                              nuevos[index] = {
                                ...nuevos[index],
                                quiz: { ...nuevos[index].quiz, preguntas },
                              };
                              // Limpia edición si corresponde
                              if (nuevos[index].editandoPreguntaIndex === pi) {
                                nuevos[index].editandoPreguntaIndex = null;
                                nuevos[index].editPreguntaTexto = "";
                                nuevos[index].editOpciones = [];
                              } else if (
                                typeof nuevos[index].editandoPreguntaIndex === "number" &&
                                nuevos[index].editandoPreguntaIndex > pi
                              ) {
                                nuevos[index].editandoPreguntaIndex = nuevos[index].editandoPreguntaIndex - 1;
                              }
                              return nuevos;
                            });
                          }}
                          disabled={updating}
                        >
                          Eliminar
                        </button>
                      </div>
                      {/* Si no hay respuestas para la pregunta */}
                      {(!pregunta.opciones || pregunta.opciones.length === 0) ? (
                        <div className="ml-6 text-gray-400 italic">No hay respuestas para esta pregunta.</div>
                      ) : (
                        <div className="flex gap-2 ml-6 text-sm flex-wrap">
                          {pregunta.opciones.map((op, oi) => (
                            <span key={oi}>
                              <b>{String.fromCharCode(97 + oi)})</b> {op.texto}
                              {op.correcta && (
                                <span className="ml-1 text-green-700 font-bold">(Correcta)</span>
                              )}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}

              {/* Formulario para agregar nueva pregunta */}
              <div className="flex flex-col gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Texto de la pregunta"
                  value={modulo.nuevaPregunta || ""}
                  onChange={e => {
                    const value = e.target.value;
                    setModulos(prev => {
                      const nuevos = [...prev];
                      nuevos[index].nuevaPregunta = value;
                      return nuevos;
                    });
                  }}
                  className="border border-green-300 p-2 rounded-lg outline-none"
                  disabled={updating}
                />
                <div className="flex flex-col gap-2">
                  {(modulo.opciones || []).map((op, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={`Opción ${String.fromCharCode(97 + oi)}`}
                        value={op.texto}
                        onChange={e => {
                          const value = e.target.value;
                          setModulos(prev => {
                            const nuevos = [...prev];
                            nuevos[index].opciones![oi].texto = value;
                            return nuevos;
                          });
                        }}
                        className="border border-green-300 p-2 rounded-lg outline-none w-60"
                        disabled={updating}
                      />
                      <input
                        type="radio"
                        name={`correcta-nueva-${index}`}
                        checked={op.correcta}
                        onChange={() => {
                          setModulos(prev => {
                            const nuevos = [...prev];
                            nuevos[index].opciones = nuevos[index].opciones!.map((o, i) => ({
                              ...o,
                              correcta: i === oi,
                            }));
                            return nuevos;
                          });
                        }}
                        disabled={updating}
                      />
                      <span className="text-xs">Correcta</span>
                      {(modulo.opciones?.length || 0) > 2 && (
                        <button
                          type="button"
                          className="text-red-500 hover:underline ml-2"
                          onClick={() => {
                            setModulos(prev => {
                              const nuevos = [...prev];
                              nuevos[index].opciones = nuevos[index].opciones!.filter((_, i) => i !== oi);
                              return nuevos;
                            });
                          }}
                          disabled={updating}
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    className="text-green-700 hover:underline w-fit"
                    onClick={() => {
                      setModulos(prev => {
                        const nuevos = [...prev];
                        const opciones = [...(nuevos[index].opciones || [])];
                        opciones.push({ texto: "", correcta: false });
                        nuevos[index] = {
                          ...nuevos[index],
                          opciones: opciones.map(op => ({ ...op })), // <-- fuerza nuevos objetos
                        };
                        return nuevos;
                      });
                    }}
                    disabled={updating}
                  >
                    + Agregar opción
                  </button>
                </div>
                <button
                  type="button"
                  className="ml-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 w-fit"
                  disabled={
                    updating ||
                    !modulo.nuevaPregunta ||
                    (modulo.opciones || []).some((op) => !op.texto) ||
                    !(modulo.opciones || []).some((op) => op.correcta)
                  }
                  onClick={() => {
                    setModulos(prev => {
                      const nuevos = [...prev];
                      const preguntas = [...nuevos[index].quiz.preguntas];
                      preguntas.push({
                        texto: nuevos[index].nuevaPregunta ?? "",
                        opciones: (nuevos[index].opciones || []).map(op => ({ ...op })), // <-- fuerza nuevos objetos
                      });
                      nuevos[index] = {
                        ...nuevos[index],
                        quiz: { ...nuevos[index].quiz, preguntas },
                        nuevaPregunta: "",
                        opciones: [
                          { texto: "", correcta: false },
                          { texto: "", correcta: false },
                        ].map(op => ({ ...op })), // <-- fuerza nuevos objetos
                      };
                      return nuevos;
                    });
                  }}
                >
                  Agregar pregunta
                </button>
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() =>
            setModulos([
              ...modulos,
              {
                titulo: "",
                descripcion: "",
                enlaces: [],
                quiz: { preguntas: [] },
                archivos: [],
                archivosNuevos: [],
              },
            ])
          }
          className="px-6 py-2 bg-green-600 text-white rounded-full shadow hover:bg-green-700 transition"
          disabled={updating}
        >
          + Agregar Módulo
        </button>
      </div>

      <button
        type="submit"
        className="w-full bg-green-600 text-white py-3 rounded-full font-semibold hover:bg-green-700 transition flex justify-center items-center gap-2"
        disabled={updating}
      >
        {updating ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
            Guardando...
          </>
        ) : (
          "Guardar Cambios"
        )}
      </button>
    </form>
  );
};

function updateEditOpcionTexto(
  setModulos: React.Dispatch<React.SetStateAction<Modulo[]>>,
  moduloIndex: number,
  opcionIndex: number,
  value: string
) {
  setModulos(prev => {
    const nuevos = [...prev];
    if (nuevos[moduloIndex].editOpciones) {
      nuevos[moduloIndex].editOpciones[opcionIndex].texto = value;
    }
    return nuevos;
  });
}

function setEditOpcionCorrecta(
  setModulos: React.Dispatch<React.SetStateAction<Modulo[]>>,
  moduloIndex: number,
  opcionIndex: number
) {
  setModulos(prev => {
    const nuevos = [...prev];
    if (nuevos[moduloIndex].editOpciones) {
      nuevos[moduloIndex].editOpciones = nuevos[moduloIndex].editOpciones.map((o, i) => ({
        ...o,
        correcta: i === opcionIndex,
      }));
    }
    return nuevos;
  });
}

function removeEditOpcion(
  setModulos: React.Dispatch<React.SetStateAction<Modulo[]>>,
  moduloIndex: number,
  opcionIndex: number
) {
  setModulos(prev => {
    const nuevos = [...prev];
    if (nuevos[moduloIndex].editOpciones) {
      nuevos[moduloIndex].editOpciones = nuevos[moduloIndex].editOpciones.filter((_, i) => i !== opcionIndex);
    }
    return nuevos;
  });
}

export default EditCourse;
