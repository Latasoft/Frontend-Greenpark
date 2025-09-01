import { useState, useCallback } from "react";
import axios from "axios";
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom'; // Add this import
import Cropper from 'react-easy-crop';

const baseURL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://backend-greenpark.onrender.com";

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
  const navigate = useNavigate(); // Add this hook
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

  // --- Cropper states ---
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  // --- Handlers ---

  const handleImagenChange = (file: File | null) => {
    if (!file) {
      setImagen(null);
      setImagenPreview(null);
      return;
    }
    
    // Crear URL para la vista previa
    const imageUrl = URL.createObjectURL(file);
    setImageToCrop(imageUrl);
    setShowCropper(true);
  };

  const onCropComplete = useCallback(
    (_: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleCropConfirm = async () => {
    try {
      if (!imageToCrop || !croppedAreaPixels) return;
      
      // Obtener la imagen recortada como blob
      const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
      
      // Crear vista previa
      const previewUrl = URL.createObjectURL(croppedImage);
      setImagenPreview(previewUrl);
      
      // Guardar el archivo recortado
      const file = new File([croppedImage], 'cropped-image.jpg', { type: 'image/jpeg' });
      setImagen(file);
      
      // Cerrar el cropper
      setShowCropper(false);
      setImageToCrop(null);
      
    } catch (error) {
      console.error('Error al recortar la imagen:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un error al procesar la imagen',
        confirmButtonColor: '#8BAE52'
      });
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
      Swal.fire({
        icon: 'error',
        title: 'Error de validación',
        text: 'Por favor ingresa una duración válida.',
        confirmButtonColor: '#8BAE52'
      });
      return false;
    }
    if (!imagen) {
      Swal.fire({
        icon: 'error',
        title: 'Imagen requerida',
        text: 'Debes seleccionar una imagen para el curso.',
        confirmButtonColor: '#8BAE52'
      });
      return false;
    }
    if (!titulo.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Título requerido',
        text: 'El título del curso es obligatorio.',
        confirmButtonColor: '#8BAE52'
      });
      return false;
    }
    if (fechaInicio && fechaTermino && fechaInicio > fechaTermino) {
      Swal.fire({
        icon: 'error',
        title: 'Error en fechas',
        text: 'La fecha de inicio no puede ser mayor que la fecha de término.',
        confirmButtonColor: '#8BAE52'
      });
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
      
      // Replace with SweetAlert that redirects
      Swal.fire({
        icon: 'success',
        title: '¡Curso creado!',
        text: 'El curso ha sido creado exitosamente.',
        confirmButtonColor: '#8BAE52',
        confirmButtonText: 'Ver cursos'
      }).then((result) => {
        if (result.isConfirmed) {
          // Navigate to the courses page
          navigate('/admin/courses');
        }
      });
      
      console.log("Curso creado:", res.data);
    } catch (error) {
      console.error("Error al crear curso:", error);
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al crear el curso. Por favor intenta nuevamente.',
        confirmButtonColor: '#8BAE52'
      });
    } finally {
      setLoading(false);
    }
  };

  // Función auxiliar para crear la imagen recortada
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

  async function getCroppedImg(
    imageSrc: string,
    pixelCrop: { x: number; y: number; width: number; height: number }
  ): Promise<Blob> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Canvas is empty');
        }
        resolve(blob);
      }, 'image/jpeg');
    });
  }

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="form-container">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-green-100 relative form-animation">
        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-8"
        >
      <h2 className="text-3xl font-bold text-green-700 border-b pb-4">
        Crear Nuevo Curso
      </h2>

      {/* Título */}
      <div className="transition-all duration-300 ease-in-out transform hover:scale-[1.01]">
        <input
          type="text"
          name="titulo"
          placeholder="Título del curso"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="w-full border border-green-300 focus:ring-2 focus:ring-green-400 p-3 rounded-lg outline-none disabled:opacity-50 transition-colors duration-200"
          required
          disabled={loading}
        />
      </div>

      {/* Imagen y preview */}
      <div className="relative">
        <label className="block text-green-700 font-semibold mb-2">
          Imagen del curso
        </label>
        
        {imagenPreview ? (
          <div className="relative group">
            <img
              src={imagenPreview}
              alt="Vista previa"
              className="w-full h-64 object-cover rounded-xl border mb-4"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  document.getElementById('input-imagen')?.click();
                }}
                className="bg-white text-green-700 p-2 rounded-full hover:bg-green-100 transition-colors"
                title="Cambiar imagen"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => {
                  handleImagenChange(null);
                }}
                className="bg-white text-red-500 p-2 rounded-full hover:bg-red-100 transition-colors"
                title="Eliminar imagen"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-green-300 rounded-xl p-8 mb-4 flex flex-col items-center justify-center bg-green-50 cursor-pointer hover:bg-green-100 transition-colors"
            onClick={() => document.getElementById('input-imagen')?.click()}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-green-700 font-medium">Haz clic para seleccionar una imagen</p>
            <p className="text-green-600 text-sm mt-1">o arrastra y suelta aquí</p>
          </div>
        )}
        <input
          id="input-imagen"
          type="file"
          accept="image/*"
          onChange={(e) => handleImagenChange(e.target.files?.[0] || null)}
          className="hidden"
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
          // Create a new array instead of mutating the original
          const preguntas = [...nuevos[index].quiz.preguntas];
          
          // Add the question to the new array
          preguntas.push({
            texto: nuevos[index].nuevaPregunta,
            opciones: nuevos[index].opciones.map(op => ({ ...op })),
          });
          
          // Update the module with the new array
          nuevos[index] = {
            ...nuevos[index],
            quiz: { 
              ...nuevos[index].quiz, 
              preguntas 
            },
            nuevaPregunta: "",
            opciones: [
              { texto: "", correcta: false },
              { texto: "", correcta: false }
            ]
          };
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

      {/* Modal para recorte de imagen */}
      {showCropper && imageToCrop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-xl">
            <h3 className="text-xl font-medium text-gray-900 mb-4">
              Ajusta la imagen del curso
            </h3>
            <div className="relative h-80 w-full mb-4">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={16/9}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="zoom" className="block text-sm font-medium text-gray-700 mb-1">
                Zoom
              </label>
              <input
                type="range"
                id="zoom"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowCropper(false);
                  setImageToCrop(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCropConfirm}
                className="px-4 py-2 bg-[#8BAE52] text-white rounded-md hover:bg-[#1A3D33] transition-colors"
              >
                Aplicar y guardar
              </button>
            </div>
          </div>
        </div>
      )}
        </form>
      </div>
    </div>
  );
};

export default CourseCreator;
