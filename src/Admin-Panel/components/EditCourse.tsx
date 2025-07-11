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

function EditCourse({ cursoId, cursoInicial }: EditCourseProps) {
  const [titulo, setTitulo] = useState<string>(cursoInicial.titulo || '');
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [herramientas, setHerramientas] = useState<string>(JSON.stringify(cursoInicial.herramientas || []));
  const [loAprenderan, setLoAprenderan] = useState<string>(JSON.stringify(cursoInicial.loAprenderan || []));
  const [modulos, setModulos] = useState<string>(JSON.stringify(cursoInicial.modulos || []));
  const [duracionHoras, setDuracionHoras] = useState<number>(cursoInicial.duracionHoras || 0);
  const [bienvenida, setBienvenida] = useState<string>(cursoInicial.bienvenida || '');
  const [dirigidoA, setDirigidoA] = useState<string>(cursoInicial.dirigidoA || '');
  const [fechaInicio, setFechaInicio] = useState<string>(cursoInicial.fechaInicio ? new Date(cursoInicial.fechaInicio).toISOString().slice(0, 10) : '');
  const [fechaTermino, setFechaTermino] = useState<string>(cursoInicial.fechaTermino ? new Date(cursoInicial.fechaTermino).toISOString().slice(0, 10) : '');
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
        `https://greenpark-backend-0ua6.onrender.com/cursos/${cursoId}`,
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
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Título"
        value={titulo}
        onChange={e => setTitulo(e.target.value)}
        required
      />
      <input
        type="file"
        accept="image/png, image/jpeg"
        onChange={handleImagenChange}
      />
      <textarea
        placeholder="Herramientas (JSON)"
        value={herramientas}
        onChange={e => setHerramientas(e.target.value)}
      />
      <textarea
        placeholder="Lo que aprenderán (JSON)"
        value={loAprenderan}
        onChange={e => setLoAprenderan(e.target.value)}
      />
      <textarea
        placeholder="Módulos (JSON)"
        value={modulos}
        onChange={e => setModulos(e.target.value)}
      />
      <input
        type="number"
        placeholder="Duración horas"
        value={duracionHoras}
        onChange={e => setDuracionHoras(Number(e.target.value))}
      />
      <textarea
        placeholder="Bienvenida"
        value={bienvenida}
        onChange={e => setBienvenida(e.target.value)}
      />
      <input
        type="text"
        placeholder="Dirigido a"
        value={dirigidoA}
        onChange={e => setDirigidoA(e.target.value)}
      />
      <input
        type="date"
        value={fechaInicio}
        onChange={e => setFechaInicio(e.target.value)}
      />
      <input
        type="date"
        value={fechaTermino}
        onChange={e => setFechaTermino(e.target.value)}
      />
      <input
        type="file"
        multiple
        onChange={handleArchivosModuloChange}
      />
      <button type="submit">Actualizar Curso</button>
    </form>
  );
}

export default EditCourse;
