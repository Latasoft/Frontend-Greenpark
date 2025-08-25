import { useState } from "react";
import axios from "axios";

const baseURL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://greenpark-backend-0ua6.onrender.com";

interface Quiz {
  preguntas: any[]; // Puedes mejorar el tipado cuando definas la estructura exacta
}

interface Modulo {
  titulo: string;
  descripcion: string;
  enlaces: any[];
  quiz: Quiz;
  archivos: File[];
  nuevaPregunta?: string;
  opciones: { texto: string; correcta: boolean }[];
}

const CourseCreator = () => {
  const [titulo, setTitulo] = useState("");
  const [imagen, setImagen] = useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
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

  const [loading, setLoading] = useState(false);

  // --- Handlers ---

  const handleImagenChange = (file: File | null) => {
    setImagen(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagenPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagenPreview(null);
    }
  };

  const handleAgregarModulo = () => {
    setModulos((prev) => [
      ...prev,
      { titulo: "", descripcion: "", enlaces: [], quiz: { preguntas: [] }, archivos: [], nuevaPregunta: "", opciones: [{ texto: "", correcta: false }, { texto: "", correcta: false }] },
    ]);
  };

  const handleModuloChange = (
    index: number,
    field: "titulo" | "descripcion",
    value: string
  ) => {
    setModulos((prev) => {
      const nuevos = [...prev];
      nuevos[index][field] = value;
      return nuevos;
    });
  };

  const handleFileChange = (index: number, files: FileList | null) => {
    setModulos((prev) => {
      const nuevos = [...prev];
      nuevos[index].archivos = files ? Array.from(files) : [];
      return nuevos;
    });
  };

  const agregarHerramienta = () => {
    const value = herramientaInput.trim();
    if (value && !herramientas.includes(value)) {
      setHerramientas((prev) => [...prev, value]);
      setHerramientaInput("");
    }
  };

  const eliminarHerramienta = (item: string) => {
    setHerramientas((prev) => prev.filter((h) => h !== item));
  };

  const agregarAprender = () => {
    const value = aprenderInput.trim();
    if (value && !loAprenderan.includes(value)) {
      setLoAprenderan((prev) => [...prev, value]);
      setAprenderInput("");
    }
  };

  const eliminarAprender = (item: string) => {
    setLoAprenderan((prev) => prev.filter((l) => l !== item));
  };

  const validarFormulario = (): boolean => {
    if (duracionHoras === "" || duracionHoras < 0) {
      alert("Por favor ingresa una duración válida.");
      return false;
    }
    if (!imagen) {
      alert("La imagen del curso es obligatoria.");
      return false;
    }
    if (!titulo.trim()) {
      alert("El título del curso es obligatorio.");
      return false;
    }
    if (fechaInicio && fechaTermino && fechaInicio > fechaTermino) {
      alert("La fecha de inicio no puede ser mayor que la fecha de término.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("titulo", titulo.trim());
    if (imagen) formData.append("imagen", imagen);
    formData.append("bienvenida", bienvenida.trim());
    formData.append("duracionHoras", duracionHoras.toString());
    formData.append("dirigidoA", dirigidoA);
    formData.append("fechaInicio", fechaInicio);
    formData.append("fechaTermino", fechaTermino);
    formData.append("herramientas", JSON.stringify(herramientas));
    formData.append("loAprenderan", JSON.stringify(loAprenderan));

    const modulosSinArchivos = modulos.map(({ archivos, ...rest }) => rest);
    formData.append("modulos", JSON.stringify(modulosSinArchivos));

    modulos.forEach((modulo, i) => {
      modulo.archivos.forEach((archivo) => {
        formData.append(`archivosModulo_${i}`, archivo);
      });
    });

    try {
      const res = await axios.post(`${baseURL}/api/cursos`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Curso creado exitosamente.");
      console.log("Curso creado:", res.data);

      // Resetear formulario
      setTitulo("");
      setImagen(null);
      setImagenPreview(null);
      setBienvenida("");
      setDuracionHoras("");
      setDirigidoA("comunidad");
      setFechaInicio("");
      setFechaTermino("");
      setHerramientas([]);
      setHerramientaInput("");
      setLoAprenderan([]);
      setAprenderInput("");
      setModulos([]);
    } catch (error) {
      console.error("Error al crear curso:", error);
      alert("Hubo un error al crear el curso.");
    } finally {
      setLoading(false);
    }
  };

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl mx-auto p-8 space-y-8 bg-white rounded-2xl shadow-lg border border-green-100"
    >
      <h2 className="text-3xl font-bold text-green-700 border-b pb-4">
        Crear Nuevo Curso
      </h2>

      {/* Título */}
      <input
        type="text"
        placeholder="Título del curso"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        className="w-full border border-green-300 focus:ring-2 focus:ring-green-400 p-3 rounded-lg outline-none disabled:opacity-50"
        required
        disabled={loading}
      />

      {/* Imagen y preview */}
      <div>
        <label className="block text-green-700 font-semibold mb-2">
          Imagen del curso
        </label>
        {imagenPreview && (
          <img
            src={imagenPreview}
            alt="Vista previa"
            className="w-full h-64 object-cover rounded-xl border mb-4"
          />
        )}
        <label
          htmlFor="input-imagen"
          className={`inline-block cursor-pointer bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition select-none ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Seleccionar imagen
        </label>
        <input
          id="input-imagen"
          type="file"
          accept="image/*"
          onChange={(e) => handleImagenChange(e.target.files?.[0] || null)}
          className="hidden"
          required
          disabled={loading}
        />
      </div>

      {/* Bienvenida */}
      <textarea
        placeholder="Mensaje de bienvenida"
        value={bienvenida}
        onChange={(e) => setBienvenida(e.target.value)}
        className="w-full border border-green-300 focus:ring-2 focus:ring-green-400 p-3 rounded-lg outline-none disabled:opacity-50"
        disabled={loading}
      />

      {/* Duración */}
      <input
        type="number"
        min={0}
        placeholder="Duración en horas"
        value={duracionHoras}
        onChange={(e) => {
          const val = e.target.value;
          setDuracionHoras(val === "" ? "" : Number(val));
        }}
        className="w-full border border-green-300 focus:ring-2 focus:ring-green-400 p-3 rounded-lg outline-none disabled:opacity-50"
        disabled={loading}
      />

      {/* Dirigido a */}
      <select
        value={dirigidoA}
        onChange={(e) => setDirigidoA(e.target.value)}
        className="w-full border border-green-300 focus:ring-2 focus:ring-green-400 p-3 rounded-lg outline-none disabled:opacity-50"
        disabled={loading}
      >
        <option value="comunidad">Comunidad</option>
        <option value="estudiante">Estudiante</option>
        <option value="docente">Docente</option>
      </select>

      {/* Fechas */}
      <div className="flex gap-4">
        <input
          type="date"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
          min={today} // This prevents selecting dates before today
          className="border border-green-300 focus:ring-2 focus:ring-green-400 p-3 rounded-lg outline-none w-1/2 disabled:opacity-50"
          disabled={loading}
        />
        <input
          type="date"
          value={fechaTermino}
          onChange={(e) => setFechaTermino(e.target.value)}
          min={fechaInicio || today} // Uses startDate if set, otherwise today
          className="border border-green-300 focus:ring-2 focus:ring-green-400 p-3 rounded-lg outline-none w-1/2 disabled:opacity-50"
          disabled={loading}
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
            className="flex-grow border border-green-300 p-2 rounded-lg outline-none disabled:opacity-50"
            placeholder="Agregar herramienta"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                agregarHerramienta();
              }
            }}
            disabled={loading}
          />
          <button
            type="button"
            onClick={agregarHerramienta}
            className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            +
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {herramientas.map((h) => (
            <span
              key={h}
              className="bg-green-200 text-green-900 px-3 py-1 rounded-full cursor-pointer select-none"
              onClick={() => !loading && eliminarHerramienta(h)}
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
            className="flex-grow border border-green-300 p-2 rounded-lg outline-none disabled:opacity-50"
            placeholder="Agregar elemento"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                agregarAprender();
              }
            }}
            disabled={loading}
          />
          <button
            type="button"
            onClick={agregarAprender}
            className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            +
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {loAprenderan.map((l) => (
            <span
              key={l}
              className="bg-green-200 text-green-900 px-3 py-1 rounded-full cursor-pointer select-none"
              onClick={() => !loading && eliminarAprender(l)}
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
            className="border border-green-200 bg-green-50 p-4 rounded-xl shadow-sm space-y-3"
          >
            <input
              type="text"
              placeholder="Título del módulo"
              value={modulo.titulo}
              onChange={(e) => handleModuloChange(index, "titulo", e.target.value)}
              className="w-full border border-green-300 focus:ring-2 focus:ring-green-400 p-2 rounded-lg outline-none disabled:opacity-50"
              disabled={loading}
            />
            <textarea
              placeholder="Descripción del módulo"
              value={modulo.descripcion}
              onChange={(e) => handleModuloChange(index, "descripcion", e.target.value)}
              className="w-full border border-green-300 focus:ring-2 focus:ring-green-400 p-2 rounded-lg outline-none disabled:opacity-50"
              disabled={loading}
            />


{/* Quiz del módulo */}
<div className="mt-4 p-3 bg-white rounded border border-green-200">
  <h4 className="font-semibold text-green-700 mb-2">Quiz del módulo</h4>
  {/* Lista de preguntas ya agregadas */}
  {modulo.quiz.preguntas.map((pregunta, pi) => (
    <div key={pi} className="mb-2 flex flex-col gap-1">
      <div className="flex gap-2 items-center">
        <span className="font-medium">Pregunta {pi + 1}:</span>
        <span>{pregunta.texto}</span>
        <button
          type="button"
          className="ml-2 text-red-500 hover:underline"
          onClick={() => {
            setModulos((prev) => {
              const nuevos = [...prev];
              nuevos[index].quiz.preguntas = nuevos[index].quiz.preguntas.filter((_, i) => i !== pi);
              return nuevos;
            });
          }}
        >
          Eliminar
        </button>
      </div>
      <div className="flex gap-2 ml-6 text-sm flex-wrap">
        {pregunta.opciones.map((op: { texto: string; correcta: boolean }, oi: number) => (
          <span key={oi}>
            <b>{String.fromCharCode(97 + oi)}</b> {op.texto}
            {op.correcta && (
              <span className="ml-1 text-green-700 font-bold">(Correcta)</span>
            )}
          </span>
        ))}
      </div>
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
      disabled={loading}
    />
    <div className="flex flex-col gap-2">
      {modulo.opciones.map((op, oi) => (
        <div key={oi} className="flex items-center gap-2">
          <input
            type="text"
            placeholder={`Opción ${String.fromCharCode(97 + oi)}`}
            value={op.texto}
            onChange={e => {
              const value = e.target.value;
              setModulos(prev => {
                const nuevos = [...prev];
                nuevos[index].opciones[oi].texto = value;
                return nuevos;
              });
            }}
            className="border border-green-300 p-2 rounded-lg outline-none w-60"
            disabled={loading}
          />
          <input
            type="radio"
            name={`correcta-${index}`}
            checked={op.correcta}
            onChange={() => {
              setModulos(prev => {
                const nuevos = [...prev];
                nuevos[index].opciones = nuevos[index].opciones.map((o, i) => ({
                  ...o,
                  correcta: i === oi,
                }));
                return nuevos;
              });
            }}
            disabled={loading}
          />
          <span className="text-xs">Correcta</span>
          {modulo.opciones.length > 2 && (
            <button
              type="button"
              className="text-red-500 hover:underline ml-2"
              onClick={() => {
                setModulos(prev => {
                  const nuevos = [...prev];
                  nuevos[index].opciones = nuevos[index].opciones.filter((_, i) => i !== oi);
                  // Si la opción eliminada era la correcta, desmarcar todas
                  if (!nuevos[index].opciones.some(o => o.correcta)) {
                    if (nuevos[index].opciones[0]) nuevos[index].opciones[0].correcta = true;
                  }
                  return nuevos;
                });
              }}
              disabled={loading}
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
            nuevos[index].opciones.push({ texto: "", correcta: false });
            return nuevos;
          });
        }}
        disabled={loading}
      >
        + Agregar opción
      </button>
    </div>
    <button
      type="button"
      className="ml-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 w-fit"
      disabled={
        loading ||
        !modulo.nuevaPregunta ||
        modulo.opciones.some((op) => !op.texto) ||
        !modulo.opciones.some((op) => op.correcta)
      }
      onClick={() => {
        setModulos(prev => {
          const nuevos = [...prev];
          nuevos[index].quiz.preguntas.push({
            texto: nuevos[index].nuevaPregunta,
            opciones: nuevos[index].opciones.map(op => ({ ...op })),
          });
          // Limpiar campos auxiliares
          nuevos[index].nuevaPregunta = "";
          nuevos[index].opciones = [
            { texto: "", correcta: false },
            { texto: "", correcta: false },
          ];
          return nuevos;
        });
      }}
    >
      Agregar pregunta
    </button>
  </div>
</div>


            {/* Botón para subir archivos */}
            <label
              htmlFor={`input-archivos-${index}`}
              className={`inline-block cursor-pointer bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition select-none ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Subir archivos
            </label>
            <input
              id={`input-archivos-${index}`}
              type="file"
              multiple
              onChange={(e) => handleFileChange(index, e.target.files)}
              className="hidden"
              disabled={loading}
            />

            {/* Lista de archivos seleccionados */}
            {modulo.archivos.length > 0 && (
              <ul className="mt-2 list-disc list-inside text-sm text-gray-700">
                {modulo.archivos.map((file, i) => (
                  <li key={i}>{file.name}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={handleAgregarModulo}
          className={`px-6 py-2 bg-green-600 text-white rounded-full shadow hover:bg-green-700 transition ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          + Agregar Módulo
        </button>
      </div>

      <button
        type="submit"
        className={`w-full bg-green-600 text-white py-3 rounded-full font-semibold hover:bg-green-700 transition flex justify-center items-center gap-2 ${
          loading ? "cursor-not-allowed opacity-50" : ""
        }`}
        disabled={loading}
      >
        {loading && (
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
        )}
        {loading ? "Creando..." : "Crear Curso"}
      </button>
    </form>
  );
};

export default CourseCreator;
