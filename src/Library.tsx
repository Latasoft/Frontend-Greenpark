import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

type Book = {
  id: string;
  title: string;
  author: string;
  description: string;
  downloadUrl?: string;
  pages: number;
  pdfUrl?: string;
  pdfPublicId?: string;
};

const Library = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewBookId, setPreviewBookId] = useState<string | null>(null);
  const navigate = useNavigate();

  const baseURL =
    window.location.hostname === 'localhost'
      ? 'http://localhost:3000'
      : 'https://greenpark-backend-0ua6.onrender.com';

  // Verificar si el usuario está autenticado
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get<Book[]>(`${baseURL}/api/books/libros`);
        setBooks(response.data);
      } catch (err) {
        setError('Error al cargar los libros');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const handleDownload = async (pdfUrl: string | undefined, title: string) => {
    if (!pdfUrl) {
      alert('No hay archivo PDF disponible para este libro.');
      return;
    }

    try {
      const response = await axios.get(pdfUrl, { responseType: 'blob' });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error descargando el PDF:', err);
      alert('Error descargando el archivo.');
    }
  };

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Replace simple loading text with skeleton cards
  if (loading) return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-[#1A3D33] mb-8">Biblioteca</h1>

        <div className="mb-8">
          <div className="relative">
            <div className="w-full md:w-96 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-100 animate-pulse">
              <div className="p-6 flex flex-col h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-full">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4 mb-3"></div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-10 bg-gray-200 rounded w-full"></div>
                  <div className="h-10 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (error) return <p className="p-4 text-red-600">{error}</p>;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-[#1A3D33] mb-8">Biblioteca</h1>

        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por título o autor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-96 px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:border-[#8BAE52] focus:ring-1 focus:ring-[#8BAE52]"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredBooks.map((book) => (
            <div 
              key={book.id} 
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 fade-in flex flex-col h-full"
            >
              <div className="p-6 flex flex-col h-full">
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-[#1A3D33] mb-2">{book.title}</h3>
                      <p className="text-sm text-[#8BAE52] mb-1">{book.author}</p>
                      <p className="text-xs text-gray-500 mb-3">{book.pages} páginas</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{book.description}</p>
                </div>
                
                {/* Button container - fixed at bottom with consistent padding */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        setPreviewBookId(book.id);
                        setShowPreview(true);
                      }}
                      className="w-full bg-white text-[#1A3D33] border border-[#1A3D33] py-2 px-4 rounded hover:bg-[#8BAE52] hover:text-white hover:border-[#8BAE52] transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Vista Previa
                    </button>
                    <button
                      onClick={() => handleDownload(book.pdfUrl, book.title)}
                      className="w-full bg-[#1A3D33] text-white py-2 px-4 rounded hover:bg-[#8BAE52] transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Descargar PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal preview - unchanged */}
      {showPreview && previewBookId && (
        <div
          className="fixed inset-0 z-50 bg-black/20 backdrop-blur-md flex items-center justify-center"
          onClick={() => {
            setShowPreview(false);
            setPreviewBookId(null);
          }}
        >
          <div
            className="bg-white rounded-lg w-full max-w-3xl h-[90vh] p-4 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setShowPreview(false);
                setPreviewBookId(null);
              }}
              className="absolute -top-6 -right-6 bg-white text-[#1A3D33] hover:bg-red-500 hover:text-white shadow-lg rounded-full p-3 transition-colors z-10"
              aria-label="Cerrar vista previa"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <iframe
              src={`https://greenpark-backend-0ua6.onrender.com/api/books/download/${previewBookId}`}
              className="w-full h-full rounded"
              title="Vista previa del libro"
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default Library;
