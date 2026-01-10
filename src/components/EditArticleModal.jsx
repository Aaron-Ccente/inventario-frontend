import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

const EditArticleModal = ({ isOpen, onClose, onArticleUpdated, article, categoryName }) => {
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    unidad: '',
    detalle: '',
    fecha_vencimiento: '',
    otros: '',
    stock: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (article && isOpen) {
      setFormData({
        codigo: article.codigo || '',
        nombre: article.nombre || '',
        unidad: article.unidad || '',
        detalle: article.detalle || '',
        fecha_vencimiento: article.fecha_vencimiento ? article.fecha_vencimiento.split('T')[0] : '',
        otros: article.otros || '',
        stock: article.stock || 0
      });
      setError('');
      setSuccess('');
    }
  }, [article, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.codigo.trim() || !formData.nombre.trim() || !formData.unidad.trim()) {
      setError('Los campos código, nombre y unidad son requeridos');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const articleData = {
        codigo: formData.codigo.trim(),
        nombre: formData.nombre.trim(),
        unidad: formData.unidad.trim(),
        detalle: formData.detalle.trim(),
        fecha_vencimiento: formData.fecha_vencimiento && formData.fecha_vencimiento.trim() !== '' ? formData.fecha_vencimiento : null,
        otros: formData.otros.trim(),
        stock: parseFloat(formData.stock) || 0
      };
      
      const response = await fetch(`${API_BASE_URL}/article/${article.id_articulo}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(articleData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Artículo actualizado exitosamente');
        setTimeout(() => {
          onArticleUpdated();
          onClose();
        }, 1000);
      } else {
        setError(data.message || 'Error al actualizar el artículo');
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
      onClose();
    }
  };

  if (!isOpen || !article) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Editar Artículo en {categoryName}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Código */}
            <div>
              <label htmlFor="codigo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Código *
              </label>
              <input
                type="text"
                id="codigo"
                name="codigo"
                value={formData.codigo}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                placeholder="Ej: ART001"
                disabled={loading}
                required
              />
            </div>

            {/* Nombre */}
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                placeholder="Ej: Computadora Dell"
                disabled={loading}
                required
              />
            </div>

            {/* Unidad */}
            <div>
              <label htmlFor="unidad" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Unidad *
              </label>
              <input
                type="text"
                id="unidad"
                name="unidad"
                value={formData.unidad}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                placeholder="Ej: Unidad, Pieza, Metro"
                disabled={loading}
                required
              />
            </div>

            {/* Stock */}
            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Stock
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                placeholder="0"
                disabled={loading}
              />
            </div>

            {/* Fecha de Vencimiento */}
            <div>
              <label htmlFor="fecha_vencimiento" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fecha de Vencimiento
              </label>
              <input
                type="date"
                id="fecha_vencimiento"
                name="fecha_vencimiento"
                value={formData.fecha_vencimiento}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                disabled={loading}
              />
            </div>

            {/* Otros */}
            <div>
              <label htmlFor="otros" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Otros
              </label>
              <input
                type="text"
                id="otros"
                name="otros"
                value={formData.otros}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                placeholder="Información adicional"
                disabled={loading}
              />
            </div>
          </div>

          {/* Detalle */}
          <div>
            <label htmlFor="detalle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Detalle
            </label>
            <textarea
              id="detalle"
              name="detalle"
              value={formData.detalle}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              placeholder="Descripción detallada del artículo"
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
              disabled={loading || !formData.codigo.trim() || !formData.nombre.trim() || !formData.unidad.trim()}
              className="flex-1 px-4 py-3 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-400 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Actualizando...' : 'Actualizar Artículo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditArticleModal;
