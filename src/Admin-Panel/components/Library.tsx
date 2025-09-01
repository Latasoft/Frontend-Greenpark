import { useEffect, useState } from 'react';
import axios from 'axios';
import LibraryCreator from './LibraryCreator';

type Book = {
  id: string;
  title: string;
  author: string;
  pages: number;
  description: string;
  pdfUrl?: string;
  pdfPublicId?: string;
};

const baseURL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://backend-greenpark.onrender.com';

const Library = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);

  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Carga inicial y refrescar libros
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await axios.get<Book[]>(`${baseURL}/api/books/libros`);
      setBooks(response.data);
    } catch (error) {
      console.error('Error al obtener libros:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Manejar borrado de libro seleccionado
  const handleDelete = async () => {
    if (!selectedBook) return;

    try {
      await axios.delete(`${baseURL}/api/books/${selectedBook.id}`);
      setBooks((prevBooks) => prevBooks.filter((book) => book.id !== selectedBook.id));
      setShowDeleteModal(false);
      setSuccessMessage(`Libro "${selectedBook.title}" eliminado correctamente.`);
      setSelectedBook(null);
    } catch (error) {
      console.error('Error al eliminar el libro:', error);
      alert('Hubo un error al eliminar el libro.');
    }
  };

  // Limpieza automática del mensaje de éxito
  useEffect(() => {
    if (!successMessage) return;

    const timeout = setTimeout(() => setSuccessMessage(null), 3000);
    return () => clearTimeout(timeout);
  }, [successMessage]);

  // Callback para refrescar lista luego de crear un libro
  const handleBookCreated = () => {
    setShowUploadForm(false);
    fetchBooks();
    setSuccessMessage('Libro creado correctamente.');
  };

  // Filtrar libros por título o autor
  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 relative">
      {/* Mensaje éxito */}
      {successMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded shadow z-50">
          {successMessage}
        </div>
      )}

      {showUploadForm ? (
        <LibraryCreator
          onCancel={() => setShowUploadForm(false)}
          onBookCreated={handleBookCreated}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por título o autor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-96 px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:border-[#8BAE52] focus:ring-1 focus:ring-[#8BAE52] focus:bg-[#8BAE52]/5"
                disabled={loading}
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
            <button
              onClick={() => setShowUploadForm(true)}
              className="bg-[#8BAE52] text-white px-4 py-2 rounded hover:bg-[#7a9947] transition-colors flex items-center gap-2"
              disabled={loading}
              aria-label="Subir libro nuevo"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Subir Libro
            </button>
          </div>

          {loading ? (
            <p className="text-center text-gray-500">Cargando libros...</p>
          ) : (
            <div
              className="bg-white rounded-lg shadow overflow-auto"
              style={{ maxHeight: 'calc(100vh - 200px)' }}
            >
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Título
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Autor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Páginas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBooks.map((book) => (
                    <tr key={book.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-[#1A3D33]">{book.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[#8BAE52]">{book.author}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{book.pages}</div>
                      </td>
                      <td className="px-6 py-4 max-w-xs text-sm text-gray-500 truncate">
                        {book.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedBook(book);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-800"
                          aria-label={`Eliminar ${book.title}`}
                          disabled={loading}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Modal de confirmación para eliminar */}
          {showDeleteModal && selectedBook && (
            <div
              className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedBook(null);
              }}
              role="dialog"
              aria-modal="true"
            >
              <div
                className="bg-white p-6 rounded shadow max-w-sm w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-xl font-semibold mb-4">Eliminar libro</h2>
                <p className="mb-6">
                  ¿Estás seguro que quieres eliminar <strong>{selectedBook.title}</strong>?
                </p>
                <div className="flex justify-end gap-4">
                  <button
                    className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedBook(null);
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                    onClick={handleDelete}
                    disabled={loading}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Library;
