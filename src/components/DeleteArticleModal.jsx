import { useState } from 'react';

const DeleteArticleModal = ({ isOpen, onClose, onArticleDeleted, article, categoryName }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleDelete = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`http://localhost:8081/api/article/${article.id_articulo}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        const successMessage = data.data?.movimientos_eliminados > 0
          ? `✅ Artículo eliminado exitosamente junto con ${data.data.movimientos_eliminados} movimientos del historial`
          : '✅ Artículo eliminado exitosamente';
        
        setSuccess(successMessage);
        setTimeout(() => {
          onArticleDeleted();
          onClose();
        }, 2000);
      } else {
        setError(data.message || 'Error al eliminar el artículo');
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
      setError('');
      setSuccess('');
      onClose();
    }
  };

  if (!isOpen || !article) return null;

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 w-full max-w-md mx-4">
        <div className="text-center">
          {/* Icono de advertencia */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
            <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>

          {/* Título y mensaje */}
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            ⚠️ Eliminación Permanente
          </h3>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="text-center">
              <p className="text-sm text-red-700 dark:text-red-300 mb-2 font-medium">
                🚨 <strong>ATENCIÓN:</strong> Esta acción eliminará completamente:
              </p>
              <ul className="text-sm text-red-600 dark:text-red-400 text-left space-y-1">
                <li>• El artículo <strong>"{article.nombre}"</strong></li>
                <li>• <strong>TODOS</strong> los movimientos registrados (entradas/salidas)</li>
                <li>• <strong>TODA</strong> la información del historial</li>
                <li>• La relación con la categoría <strong>"{categoryName}"</strong></li>
              </ul>
              <p className="text-sm text-red-700 dark:text-red-300 mt-3 font-semibold">
                ⚡ Esta acción es <strong>IRREVERSIBLE</strong> y no se puede deshacer.
              </p>
            </div>
          </div>

          {/* Información del artículo */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <div className="text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Código:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{article.codigo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Nombre:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{article.nombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Unidad:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{article.unidad}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Stock:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{article.stock}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
              <p className="text-green-600 dark:text-green-400 text-sm">{success}</p>
            </div>
          )}

          {/* Botones de acción */}
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
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-all duration-200 disabled:opacity-50 font-semibold shadow-lg hover:shadow-xl"
            >
              {loading ? '🗑️ Eliminando...' : '🗑️ ELIMINAR PERMANENTEMENTE'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteArticleModal;
