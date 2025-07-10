import { useState, useRef } from 'react';

interface LibraryCreatorProps {
  onCancel: () => void;
  onBookCreated: () => void; // Nuevo prop para notificar creación exitosa
}

const LibraryCreator = ({ onCancel, onBookCreated }: LibraryCreatorProps) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    pages: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      alert('Por favor, selecciona un archivo PDF.');
      return;
    }

    setLoading(true);

    const form = new FormData();
    form.append('title', formData.title);
    form.append('author', formData.author);
    form.append('description', formData.description);
    form.append('pages', formData.pages);
    form.append('pdf', file);

    try {
      const response = await fetch('https://greenpark-backend-0ua6.onrender.com/api/books/upload', {
        method: 'POST',
        body: form,
      });

      const result = await response.json();

      if (response.ok) {
        alert('Libro subido correctamente 🎉');
        setFormData({ title: '', author: '', description: '', pages: '' });
        setFile(null);
        onBookCreated();  // Avisar al padre que se creó el libro para refrescar lista
        onCancel();        // Cerrar formulario
      } else {
        alert(result.error || 'Error al subir el libro.');
      }
    } catch (err) {
      console.error('Error en la solicitud:', err);
      alert('Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === 'application/pdf') {
      setFile(droppedFile);
    } else {
      alert('Solo se permite subir archivos PDF.');
    }
  };

  return (
    <div className="h-screen overflow-y-auto p-6 bg-gray-50">
      <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold text-[#1A3D33] mb-6">Subir Nuevo Libro</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Título del Libro</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#8BAE52] focus:ring-1 focus:ring-[#8BAE52] focus:bg-[#8BAE52]/5"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Autor</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#8BAE52] focus:ring-1 focus:ring-[#8BAE52] focus:bg-[#8BAE52]/5"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Número de Páginas</label>
              <input
                type="number"
                value={formData.pages}
                onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#8BAE52] focus:ring-1 focus:ring-[#8BAE52] focus:bg-[#8BAE52]/5"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#8BAE52] focus:ring-1 focus:ring-[#8BAE52] focus:bg-[#8BAE52]/5"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Archivo PDF</label>
              <div
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg
                  ${isDragging ? 'border-[#8BAE52] bg-[#8BAE52]/5' : 'border-gray-300'}
                  ${file ? 'bg-gray-50' : ''}
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="space-y-1 text-center">
                  {file ? (
                    <div className="flex flex-col items-center">
                      <svg className="mx-auto h-12 w-12 text-[#8BAE52]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-gray-600">{file.name}</p>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="mt-2 text-sm text-red-600 hover:text-red-800"
                        disabled={loading}
                      >
                        Eliminar
                      </button>
                    </div>
                  ) : (
                    <>
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3 3m0 0l-3-3m3 3V6" />
                      </svg>
                      <div className="flex text-sm text-gray-600 justify-center gap-1">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-[#8BAE52] hover:text-[#1A3D33]">
                          <span>Subir archivo</span>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf"
                            className="sr-only"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            disabled={loading}
                          />
                        </label>
                        <p>o arrastra y suelta</p>
                      </div>
                      <p className="text-xs text-gray-500">PDF hasta 10MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-[#8BAE52] text-white rounded-md hover:bg-[#7a9947] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center"
              >
                {loading ? (
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
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 01-8 8z"
                      />
                    </svg>
                    Generando libro...
                  </>
                ) : (
                  'Subir Libro'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LibraryCreator;
