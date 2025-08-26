import { useState } from 'react';
import { icons } from '../assets/icons';

const CreateCategoryModal = ({ isOpen, onClose, onCategoryCreated }) => {
  const [categoryName, setCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🔧');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!categoryName.trim()) {
      setError('El nombre de la categoría es requerido');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:8081/api/category', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          nombre: categoryName.trim(),
          icono: selectedIcon,
          descripcion: description.trim()
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Categoría creada exitosamente');
        setCategoryName('');
        setSelectedIcon('🔧');
        setDescription('');
        setTimeout(() => {
          onCategoryCreated();
          onClose();
        }, 1500);
      } else {
        setError(data.message || 'Error al crear la categoría');
      }
    } catch (err) {
      console.error('Network error:', err);
      setError('Error de conexión. Verifica tu conexión a internet e inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setCategoryName('');
      setSelectedIcon('🔧');
      setDescription('');
      setError('');
      setSuccess('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Crear Nueva Categoría
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre de la categoría */}
          <div>
            <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre de la Categoría *
            </label>
            <input
              type="text"
              id="categoryName"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              placeholder="Ej: Químicos, Medicina, Tecnología"
              disabled={loading}
              required
            />
          </div>

          {/* Selección de icono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Selecciona un Icono *
            </label>
            <div className="grid grid-cols-10 gap-2 max-h-40 overflow-y-auto p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
              {icons.map((icon, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  className={`w-10 h-10 text-xl rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                    selectedIcon === icon
                      ? 'bg-pink-500 text-white ring-2 ring-pink-300'
                      : 'bg-white dark:bg-gray-600 hover:bg-pink-100 dark:hover:bg-pink-900/30'
                  }`}
                  title={`Icono ${index + 1}`}
                >
                  {icon}
                </button>
          ))}
            </div>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Icono seleccionado: <span className="text-2xl">{selectedIcon}</span>
            </div>
          </div>

          {/* Descripción de la categoría */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descripción de la Categoría
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              placeholder="Describe el propósito y contenido de esta categoría..."
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <p className="text-green-600 dark:text-green-400 text-sm">{success}</p>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !categoryName.trim()}
              className="flex-1 px-4 py-3 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-400 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear Categoría'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCategoryModal;
