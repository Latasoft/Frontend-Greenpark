import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';

import axios from 'axios';

interface Modulo {
  enlaces: { nombre: string; url: string }[];
  quiz?: any[];
  // otros campos si tienes
}

interface Curso {
  titulo: string;
  herramientas: any[];
  loAprenderan: any[];
  modulos: Modulo[];
  duracionHoras: number;
  bienvenida: string;
  dirigidoA: string;
  fechaInicio?: string | null;
  fechaTermino?: string | null;
  imagenUrl?: string;
}

interface EditCourseProps {
  cursoId: string;
  cursoInicial: Curso;
}

function safeDateToISOString(dateString?: string | null): string {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

function EditCourse({ cursoId, cursoInicial }: EditCourseProps) {
  const [titulo, setTitulo] = useState<string>(cursoInicial.titulo || '');
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [herramientas, setHerramientas] = useState<string>(JSON.stringify(cursoInicial.herramientas || []));
  const [loAprenderan, setLoAprenderan] = useState<string>(JSON.stringify(cursoInicial.loAprenderan || []));
  const [modulos, setModulos] = useState<string>(JSON.stringify(cursoInicial.modulos || []));
  const [duracionHoras, setDuracionHoras] = useState<number>(cursoInicial.duracionHoras || 0);
  const [bienvenida, setBienvenida] = useState<string>(cursoInicial.bienvenida || '');
  const [dirigidoA, setDirigidoA] = useState<string>(cursoInicial.dirigidoA || '');
  const [fechaInicio, setFechaInicio] = useState<string>(safeDateToISOString(cursoInicial.fechaInicio));
  const [fechaTermino, setFechaTermino] = useState<string>(safeDateToISOString(cursoInicial.fechaTermino));
  const [archivosModulo, setArchivosModulo] = useState<File[]>([]);

  const handleImagenChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImagenFile(e.target.files[0]);
    }
  };

  const handleArchivosModuloChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setArchivosModulo(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append('titulo', titulo);
      if (imagenFile) {
        formData.append('imagen', imagenFile);
      }
      formData.append('herramientas', herramientas);
      formData.append('loAprenderan', loAprenderan);
      formData.append('modulos', modulos);
      formData.append('duracionHoras', duracionHoras.toString());
      formData.append('bienvenida', bienvenida);
      formData.append('dirigidoA', dirigidoA);
      formData.append('fechaInicio', fechaInicio);
      formData.append('fechaTermino', fechaTermino);

      archivosModulo.forEach((file) => {
        formData.append('archivosModulo', file);
      });

      const token = localStorage.getItem('token');

      const res = await axios.put(
        `https://greenpark-backend-0ua6.onrender.com/api/cursos/${cursoId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert('Curso actualizado correctamente');
      console.log('Curso actualizado:', res.data);

    } catch (error) {
      console.error('Error actualizando curso', error);
      alert('Error al actualizar curso');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-6 bg-white rounded shadow-md space-y-6">
      <div>
        <label className="block mb-1 font-semibold">Título</label>
        <input
          type="text"
          placeholder="Título"
          value={titulo}
          onChange={e => setTitulo(e.target.value)}
          required
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block mb-1 font-semibold">Imagen (PNG o JPG)</label>
        <input
          type="file"
          accept="image/png, image/jpeg"
          onChange={handleImagenChange}
          className="w-full"
        />
      </div>

      <div>
        <label className="block mb-1 font-semibold">Herramientas (JSON)</label>
        <textarea
          placeholder="Herramientas (JSON)"
          value={herramientas}
          onChange={e => setHerramientas(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded px-3 py-2 resize-y focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block mb-1 font-semibold">Lo que aprenderán (JSON)</label>
        <textarea
          placeholder="Lo que aprenderán (JSON)"
          value={loAprenderan}
          onChange={e => setLoAprenderan(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded px-3 py-2 resize-y focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block mb-1 font-semibold">Módulos (JSON)</label>
        <textarea
          placeholder="Módulos (JSON)"
          value={modulos}
          onChange={e => setModulos(e.target.value)}
          rows={5}
          className="w-full border border-gray-300 rounded px-3 py-2 resize-y focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block mb-1 font-semibold">Duración (horas)</label>
        <input
          type="number"
          placeholder="Duración horas"
          value={duracionHoras}
          onChange={e => setDuracionHoras(Number(e.target.value))}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block mb-1 font-semibold">Bienvenida</label>
        <textarea
          placeholder="Bienvenida"
          value={bienvenida}
          onChange={e => setBienvenida(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded px-3 py-2 resize-y focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block mb-1 font-semibold">Dirigido a</label>
        <input
          type="text"
          placeholder="Dirigido a"
          value={dirigidoA}
          onChange={e => setDirigidoA(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-semibold">Fecha Inicio</label>
          <input
            type="date"
            value={fechaInicio}
            onChange={e => setFechaInicio(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Fecha Término</label>
          <input
            type="date"
            value={fechaTermino}
            onChange={e => setFechaTermino(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <div>
        <label className="block mb-1 font-semibold">Archivos del módulo (opcional, múltiples)</label>
        <input
          type="file"
          multiple
          onChange={handleArchivosModuloChange}
          className="w-full"
        />
      </div>

      <button
        type="submit"
        className="bg-green-600 text-white font-semibold px-6 py-2 rounded hover:bg-green-700 transition-colors"
      >
        Actualizar Curso
      </button>
    </form>
  );
}

export default EditCourse;
