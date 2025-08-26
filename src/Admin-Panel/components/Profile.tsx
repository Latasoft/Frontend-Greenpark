import React, { useEffect, useState, useCallback } from 'react';
import Swal from 'sweetalert2';
import Cropper from 'react-easy-crop';

interface ProfileProps {
  isAdminPanel?: boolean;
}

// Función auxiliar para crear la imagen recortada (sin cambios)
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

const baseURL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://greenpark-backend-0ua6.onrender.com";

const Profile = ({ }: ProfileProps) => {
  const [userData, setUserData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // Estados para edición
  const [newImagen, setNewImagen] = useState<string>('');
  
  // Estados para manejo de imagen
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  
  // Add new states after existing states
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const userRole = localStorage.getItem('userRole');

        if (!userId || !token) {
          setLoading(false);
          return;
        }

        // First phase: Load user profile
        const response = await fetch(`${baseURL}/api/auth/users/${userId}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await response.json();
        
        if (response.ok) {
          setUserData({
            ...data,
            nombre_pila: data.nombre || '',
            apellido: data.apellido || '',
          });
          setNewImagen(data.imagenPerfil || '');
          setLoading(false);

          // Second phase: Load courses stats
          if (userRole !== 'admin') {
            try {
              const cursosCompletados = await fetchCursosCompletados(userId, token);
              setUserData((prev: any) => ({
                ...prev,
                cursosCompletados
              }));
              // Trigger animation after courses are loaded
            } catch (error) {
              console.error('Error loading courses:', error);
            } finally {
              setLoadingCourses(false);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
        setLoadingCourses(false);
      }
    };

    fetchUserData();
  }, []);

  // Agregar esta función para obtener los cursos completados
  const fetchCursosCompletados = async (userId: string, token: string) => {
    try {
      const response = await fetch(`${baseURL}/api/auth/${userId}/cursos-inscritos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Error al obtener cursos');
      
      const cursosInscritos = await response.json();
      
      // Filtrar solo los cursos con progreso 100%
      const completados = cursosInscritos.filter((curso: any) => 
        curso.progreso === 100
      );

      return completados.length;
    } catch (error) {
      console.error('Error al obtener cursos completados:', error);
      return 0;
    }
  };

  // Manejador para cuando se selecciona una imagen
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Crear URL para la vista previa
    const imageUrl = URL.createObjectURL(file);
    setImageToCrop(imageUrl);
    setShowCropper(true);
  };

  // Función para manejar el fin del recorte
  const onCropComplete = useCallback(
    (_: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  // Función para confirmar el recorte y subir la imagen
  const handleCropConfirm = async () => {
    try {
      if (!imageToCrop || !croppedAreaPixels) return;
      
      setUploading(true);
      
      // Obtener la imagen recortada como blob
      const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
      
      // Crear vista previa
      const previewUrl = URL.createObjectURL(croppedImage);
      setPreviewImage(previewUrl);
      
      // Crear FormData para subir a Cloudinary
      const formData = new FormData();
      formData.append('file', croppedImage, 'profile-image.jpg');
      formData.append('upload_preset', 'unsigned_preset'); // Tu preset
      formData.append('cloud_name', 'dmmlobp9k'); // Tu Cloud name

      // Subir a Cloudinary
      const response = await fetch(`https://api.cloudinary.com/v1_1/dmmlobp9k/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.secure_url) {
        setNewImagen(data.secure_url);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo subir la imagen',
          confirmButtonColor: '#8BAE52'
        });
      }
      
      // Cerrar el cropper
      setShowCropper(false);
      setImageToCrop(null);
      
    } catch (error) {
      console.error('Error al recortar/subir la imagen:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un error al procesar la imagen',
        confirmButtonColor: '#8BAE52'
      });
    } finally {
      setUploading(false);
    }
  };

  // Removed unused handleImageUpload function

  const openEditProfileModal = () => {
    Swal.fire({
      title: 'Editar Perfil',
      html: `
        <div class="space-y-4">
          <div class="flex flex-col md:flex-row md:gap-4">
            <div class="flex-1">
              <label for="swal-nombre" class="block text-sm font-medium text-gray-700 text-left mb-1">Nombre</label>
              <input 
                id="swal-nombre" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8BAE52] focus:border-transparent" 
                value="${userData.nombre_pila || ''}"
              />
            </div>
            <div class="flex-1 mt-4 md:mt-0">
              <label for="swal-apellido" class="block text-sm font-medium text-gray-700 text-left mb-1">Apellido</label>
              <input 
                id="swal-apellido" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8BAE52] focus:border-transparent" 
                value="${userData.apellido || ''}"
              />
            </div>
          </div>
          <div>
            <label for="swal-correo" class="block text-sm font-medium text-gray-700 text-left mb-1">Correo electrónico</label>
            <input 
              id="swal-correo" 
              type="email"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8BAE52] focus:border-transparent"
              value="${userData.correo || ''}"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 text-left mb-1">Imagen de perfil</label>
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center border border-gray-300">
                <img 
                  src="${previewImage || newImagen || '/assets/default-avatar.png'}" 
                  alt="Perfil" 
                  class="w-full h-full object-cover" 
                  id="swal-preview-image"
                />
              </div>
              <button 
                type="button" 
                id="swal-select-image-btn"
                class="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none"
              >
                Cambiar imagen
              </button>
              <input type="file" id="swal-image-input" accept="image/*" class="hidden" />
            </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar cambios',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#8BAE52',
      cancelButtonColor: '#d33',
      showLoaderOnConfirm: true,
      didOpen: () => {
        // Configurar el botón de selección de imagen
        const selectImageBtn = document.getElementById('swal-select-image-btn');
        const imageInput = document.getElementById('swal-image-input') as HTMLInputElement;
        
        if (selectImageBtn && imageInput) {
          selectImageBtn.addEventListener('click', () => {
            imageInput.click();
          });
          
          imageInput.addEventListener('change', (e) => {
            handleFileSelect(e as any);
            Swal.close(); // Cerrar el modal para mostrar el cropper
          });
        }
      },
      preConfirm: async () => {
        const nombreEl = document.getElementById('swal-nombre') as HTMLInputElement;
        const apellidoEl = document.getElementById('swal-apellido') as HTMLInputElement;
        const correoEl = document.getElementById('swal-correo') as HTMLInputElement;
        
        const nombre = nombreEl?.value || '';
        const apellido = apellidoEl?.value || '';
        const correo = correoEl?.value || '';
        
        // Validar campos
        if (!nombre) {
          Swal.showValidationMessage('El nombre es requerido');
          return false;
        }
        
        if (!correo) {
          Swal.showValidationMessage('El correo electrónico es requerido');
          return false;
        }
        
        // Validar formato de correo
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(correo)) {
          Swal.showValidationMessage('El formato del correo electrónico no es válido');
          return false;
        }
        
        try {
          const token = localStorage.getItem('token');
          const userId = localStorage.getItem('userId');
          
          if (!userId || !token) {
            Swal.showValidationMessage('No se pudo identificar el usuario');
            return false;
          }
          
          const response = await fetch(`${baseURL}/api/auth/users/${userId}/profile`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              nombre: nombre,           // Cambio aquí: enviamos nombre y apellido separados
              apellido: apellido,
              correo: correo,
              imagenPerfil: newImagen || userData.imagenPerfil,
            }),
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al actualizar el perfil');
          }
          
          const data = await response.json();
          setUserData({
            ...userData,
            nombre_pila: data.nombre,
            apellido: data.apellido,
            correo: data.correo,
            imagenPerfil: data.imagenPerfil,
          });
          
          // Actualizar localStorage
          localStorage.setItem('userName', `${nombre} ${apellido}`);
          localStorage.setItem('userCorreo', correo);
          if (newImagen) {
            localStorage.setItem('imagenPerfil', newImagen);
          }
          
          return data;
        } catch (error: any) {
          console.error('Error updating profile:', error);
          Swal.showValidationMessage(`Error: ${error.message}`);
          return false;
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: '¡Perfil actualizado!',
          text: 'Tu información de perfil ha sido actualizada exitosamente',
          icon: 'success',
          confirmButtonColor: '#8BAE52',
          timer: 3000,
          timerProgressBar: true
        }).then(() => {
          // Recargar los datos del usuario
          window.location.reload();
        });
      }
    });
  };

  // Handler para cancelar la edición
  // (Eliminado porque no se utiliza)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8BAE52]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Card principal con la información del perfil */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
          {/* Imagen de perfil */}
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center border border-gray-300">
            {userData.imagenPerfil ? (
              <img
                src={userData.imagenPerfil}
                alt={userData.nombre || 'Perfil'}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg
                className="w-10 h-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            )}
          </div>

          {/* Información del usuario */}
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-gray-800">{userData.nombre || 'Usuario'} {userData.apellido || ''}</h1>
            <p className="text-gray-600 mb-2">{userData.correo}</p>
            <p className="text-sm text-gray-500 capitalize">Rol: {userData.rol || 'Usuario'}</p>
          </div>

          {/* Botón editar - Ahora con SweetAlert */}
          <button
            onClick={openEditProfileModal}
            className="px-4 py-2 bg-[#8BAE52] text-white rounded-md hover:bg-[#1A3D33] transition-colors flex items-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Editar perfil
          </button>
        </div>
      </div>

      {/* Detalles adicionales del usuario */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Información personal</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Nombre completo</p>
              <p className="text-gray-800">{userData.nombre + ' ' + userData.apellido || 'No especificado'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Correo electrónico</p>
              <p className="text-gray-800">{userData.correo || 'No especificado'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fecha de nacimiento</p>
              <p className="text-gray-800">
                {userData.fechaNacimiento || 'No disponible'}
              </p>
            </div>
          </div>
        </div>

        {/* Solo mostrar estadísticas si NO es admin */}
        {userData.rol !== 'admin' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Estadísticas</h2>
            <div className="space-y-3">
              {loadingCourses ? (
                <div className="flex flex-col items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#8BAE52] mb-2"></div>
                  <p className="text-sm text-gray-500">Cargando información de cursos...</p>
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-sm text-gray-500">Cursos inscritos</p>
                    <p className="text-gray-800">{userData.cursosInscritos?.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Cursos completados</p>
                    <p className="text-gray-800">{userData.cursosCompletados || 0}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal para recorte de imagen */}
      {showCropper && imageToCrop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-xl">
            <h3 className="text-xl font-medium text-gray-900 mb-4">
              Ajusta tu foto de perfil
            </h3>
            <div className="relative h-80 w-full mb-4">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
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
                disabled={uploading}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCropConfirm}
                className="px-4 py-2 bg-[#8BAE52] text-white rounded-md hover:bg-[#1A3D33] transition-colors"
                disabled={uploading}
              >
                {uploading ? 'Procesando...' : 'Aplicar y guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
